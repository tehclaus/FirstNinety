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

  // Insert-only log of every answer → no lost updates when clicks arrive in parallel.
  await db().from("live_events").insert({ hire_id: hireId, channel: "slack", action: `Day ${day} pulse answer`, target: key, preview: String(v), status: "ok" });
  const answers = await answersFor(hireId, day);
  const completed = pulseQuestions.every((q) => answers[q.key] !== undefined);
  const flag = completed ? flagFromAnswers(answers) : null;

  await db().from("live_checkpoints").upsert(
    { hire_id: hireId, day, answers, completed, flag, updated_at: new Date().toISOString() },
    { onConflict: "hire_id,day" },
  );

  const channel = payload.container?.channel_id ?? payload.channel?.id;
  const ts = payload.container?.message_ts;
  const first = hire.name.split(" ")[0];
  if (channel && ts) {
    if (completed) {
      await slack("chat.update", {
        channel, ts,
        text: "Thanks — check-in received",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: `🙌 Thanks, ${first}! Your day ${day} check-in is in. Your People Partner will follow up if anything needs attention.` } },
          { type: "context", elements: [{ type: "mrkdwn", text: `Clarity ${answers.clarity}/5 · Support ${answers.support}/5 · Workload ${answers.workload}/5 · eNPS ${answers.enps}/10` }] },
        ],
      });
      await logEvent({ hire_id: hireId, channel: "slack", action: `Day ${day} pulse completed → ${flag}`, target: `@${first.toLowerCase()}`, preview: JSON.stringify(answers) });
    } else {
      await slack("chat.update", { channel, ts, text: `Day ${day} check-in`, blocks: pulseBlocks(hireId, first, day, answers) });
    }
  }
  return;
}

async function answersFor(hireId: string, day: number) {
  const { data } = await db().from("live_events").select("target,preview,created_at")
    .eq("hire_id", hireId).eq("action", `Day ${day} pulse answer`).order("created_at", { ascending: true });
  const answers: Record<string, number> = {};
  for (const r of data ?? []) if (r.target) answers[r.target] = Number(r.preview);
  return answers;
}
