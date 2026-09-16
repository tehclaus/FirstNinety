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

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySlackSignature(raw, req.headers.get("x-slack-request-timestamp"), req.headers.get("x-slack-signature"))) {
    return new Response("invalid signature", { status: 401 });
  }
  const payload = JSON.parse(new URLSearchParams(raw).get("payload") ?? "{}") as Payload;
  if (payload.type !== "block_actions" || !payload.actions?.length) return new Response("", { status: 200 });

  const action = payload.actions[0];
  const value = action.value ?? action.selected_option?.value;
  if (!value || !action.action_id.startsWith("pulse_")) return new Response("", { status: 200 });

  const [hireId, dayStr, key, vStr] = value.split("|");
  const day = Number(dayStr);
  const v = Number(vStr);

  const { data: hire } = await db().from("live_hires").select("id,name").eq("id", hireId).single();
  if (!hire) return new Response("", { status: 200 });

  const { data: existing } = await db().from("live_checkpoints").select("answers").eq("hire_id", hireId).eq("day", day).maybeSingle();
  const answers: Record<string, number> = { ...((existing?.answers as Record<string, number>) ?? {}), [key]: v };
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
  return new Response("", { status: 200 });
}
