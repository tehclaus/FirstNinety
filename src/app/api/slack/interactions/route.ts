import { after } from "next/server";
import { db, logEvent } from "@/lib/server/supabase";
import { flagFromAnswers, pulseBlocks, pulseQuestions, slack, verifySlackSignature } from "@/lib/server/slack";

type Action = { action_id: string; value?: string; selected_option?: { value: string } };
type Payload = {
  type: string;
  user: { id: string; name?: string };
  channel?: { id: string };
  container?: { message_ts?: string; channel_id?: string };
  actions?: Action[];
};

export const maxDuration = 30;

/** Safe diagnostics — no secret values, only whether they are present. */
export async function GET() {
  const secret = process.env.SLACK_SIGNING_SECRET ?? "";
  return Response.json({
    route: "ok",
    signingSecretSet: Boolean(secret),
    signingSecretLooksValid: /^[a-f0-9]{32}$/.test(secret.trim()),
    signingSecretHasWhitespace: secret !== secret.trim(),
    botTokenSet: Boolean(process.env.SLACK_BOT_TOKEN),
    supabaseSet: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
  });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const ts = req.headers.get("x-slack-request-timestamp");
  if (!verifySlackSignature(raw, ts, req.headers.get("x-slack-signature"))) {
    after(() => logEvent({ hire_id: null, channel: "slack", action: "Slack button click rejected", target: "/api/slack/interactions", preview: null, status: "error", error: `Signature check failed (timestamp ${ts ?? "missing"}). Check SLACK_SIGNING_SECRET.` }));
    return new Response("invalid signature", { status: 401 });
  }
  // Acknowledge within Slack's 3-second window; do the work afterwards.
  after(() => handle(raw).catch((e) => logEvent({ hire_id: null, channel: "slack", action: "Slack button handler failed", target: "/api/slack/interactions", preview: null, status: "error", error: String(e?.message ?? e) })));
  return new Response("", { status: 200 });
}

async function handle(raw: string) {
  const payload = JSON.parse(new URLSearchParams(raw).get("payload") ?? "{}") as Payload;
  if (payload.type !== "block_actions" || !payload.actions?.length) return;

  const action = payload.actions[0];
  const value = action.value ?? action.selected_option?.value;
  if (!value || !action.action_id.startsWith("pulse_")) return;

  const [hireId, dayStr, key, vStr] = value.split("|");
  const day = Number(dayStr);
  const v = Number(vStr);

  const { data: hire } = await db().from("live_hires").select("id,name").eq("id", hireId).single();
  if (!hire) return;
  const first = hire.name.split(" ")[0];
  const channel = payload.container?.channel_id ?? payload.channel?.id;
  const ts = payload.container?.message_ts;
  if (!channel || !ts) return;

  // Only the newest copy of a check-in accepts answers.
  const { data: latestSent } = await db().from("live_events").select("target")
    .eq("hire_id", hireId).eq("action", `Day ${day} pulse survey sent`).eq("status", "ok")
    .order("created_at", { ascending: false }).limit(1);
  const latestTs = String(latestSent?.[0]?.target ?? "").split("|")[1];
  if (latestTs && latestTs !== ts) {
    await slack("chat.update", { channel, ts, text: "Replaced by a newer check-in", blocks: [
      { type: "context", elements: [{ type: "mrkdwn", text: `_This day ${day} check-in was replaced by a newer one — please use the latest message._` }] },
    ] });
    return;
  }

  // Already submitted → lock, don't accept changes.
  const before = await answersFor(hireId, day, ts);
  if (pulseQuestions.every((q) => before[q.key] !== undefined)) {
    await slack("chat.update", { channel, ts, text: "Check-in already submitted", blocks: thanksBlocks(first, day, before) });
    return;
  }

  // Insert-only log of every answer (keyed by message) → no lost updates on fast clicks.
  await db().from("live_events").insert({ hire_id: hireId, channel: "slack", action: `Day ${day} pulse answer`, target: `${ts}:${key}`, preview: String(v), status: "ok" });
  const answers = await answersFor(hireId, day, ts);
  const completed = pulseQuestions.every((q) => answers[q.key] !== undefined);
  const flag = completed ? flagFromAnswers(answers) : null;

  await db().from("live_checkpoints").upsert(
    { hire_id: hireId, day, answers, completed, flag, updated_at: new Date().toISOString() },
    { onConflict: "hire_id,day" },
  );

  if (completed) {
    await slack("chat.update", { channel, ts, text: "Thanks — check-in received", blocks: thanksBlocks(first, day, answers) });
    await logEvent({ hire_id: hireId, channel: "slack", action: `Day ${day} pulse completed → ${flag}`, target: `@${first.toLowerCase()}`, preview: JSON.stringify(answers) });
  } else {
    await slack("chat.update", { channel, ts, text: `Day ${day} check-in`, blocks: pulseBlocks(hireId, first, day, answers) });
  }
}

function thanksBlocks(first: string, day: number, a: Record<string, number>) {
  return [
    { type: "section", text: { type: "mrkdwn", text: `🙌 Thanks, ${first}! Your day ${day} check-in is in. Your People Partner will follow up if anything needs attention.` } },
    { type: "context", elements: [{ type: "mrkdwn", text: `Clarity ${a.clarity}/5 · Support ${a.support}/5 · Workload ${a.workload}/5 · eNPS ${a.enps}/10 · submitted answers are final` }] },
  ];
}

async function answersFor(hireId: string, day: number, ts: string) {
  const { data } = await db().from("live_events").select("target,preview")
    .eq("hire_id", hireId).eq("action", `Day ${day} pulse answer`).like("target", `${ts}:%`)
    .order("created_at", { ascending: true });
  const answers: Record<string, number> = {};
  for (const r of data ?? []) answers[String(r.target).split(":")[1]] = Number(r.preview);
  return answers;
}
