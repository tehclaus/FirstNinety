import "server-only";
import crypto from "node:crypto";

type SlackResponse = { ok: boolean; error?: string; [k: string]: unknown };

export async function slack(method: string, body: Record<string, unknown>): Promise<SlackResponse> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return { ok: false, error: "SLACK_BOT_TOKEN not set" };
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return (await res.json()) as SlackResponse;
}

/** users.lookupByEmail is a form-encoded GET-style method */
export async function lookupUserId(email: string): Promise<{ id?: string; error?: string }> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return { error: "SLACK_BOT_TOKEN not set" };
  const res = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = (await res.json()) as SlackResponse & { user?: { id: string } };
  return j.ok ? { id: j.user?.id } : { error: j.error };
}

export async function dmByEmail(email: string, text: string, blocks?: unknown[]) {
  const u = await lookupUserId(email);
  if (!u.id) return { ok: false, error: `lookup ${email}: ${u.error}` } as SlackResponse;
  const open = await slack("conversations.open", { users: u.id });
  const channel = (open.channel as { id?: string } | undefined)?.id;
  if (!open.ok || !channel) return { ok: false, error: `conversations.open: ${open.error}` } as SlackResponse;
  return slack("chat.postMessage", { channel, text, blocks });
}

export function verifySlackSignature(rawBody: string, timestamp: string | null, signature: string | null) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false;
  const base = `v0:${timestamp}:${rawBody}`;
  const mine = "v0=" + crypto.createHmac("sha256", secret).update(base).digest("hex");
  const a = Buffer.from(mine);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ——— Pulse survey (Block Kit) ———
export const pulseQuestions = [
  { key: "clarity", text: "How clear is your role and what's expected of you?", max: 5, min: 1 },
  { key: "support", text: "How supported do you feel by your manager?", max: 5, min: 1 },
  { key: "workload", text: "How manageable is your workload?", max: 5, min: 1 },
  { key: "enps", text: "How likely are you to recommend Brightfold as a place to work?", max: 10, min: 0 },
] as const;

export function pulseBlocks(hireId: string, firstName: string, day: number, answers: Record<string, number>) {
  const blocks: unknown[] = [
    { type: "section", text: { type: "mrkdwn", text: `Hi ${firstName} 👋 It's your *day ${day}* check-in. 4 quick questions, about a minute. Your manager sees a summary, not raw answers.` } },
  ];
  for (const q of pulseQuestions) {
    const chosen = answers[q.key];
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${q.text}*${chosen !== undefined ? `  ✓ ${chosen}` : ""}` } });
    const values = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
    if (q.max === 5) {
      blocks.push({
        type: "actions",
        block_id: `q_${q.key}`,
        elements: values.map((v) => ({
          type: "button",
          text: { type: "plain_text", text: String(v) },
          value: `${hireId}|${day}|${q.key}|${v}`,
          action_id: `pulse_${q.key}_${v}`,
          ...(chosen === v ? { style: "primary" } : {}),
        })),
      });
    } else {
      blocks.push({
        type: "actions",
        block_id: `q_${q.key}`,
        elements: [{
          type: "static_select",
          action_id: `pulse_${q.key}`,
          placeholder: { type: "plain_text", text: "0 = not at all · 10 = definitely" },
          options: values.map((v) => ({ text: { type: "plain_text", text: String(v) }, value: `${hireId}|${day}|${q.key}|${v}` })),
          ...(chosen !== undefined ? { initial_option: { text: { type: "plain_text", text: String(chosen) }, value: `${hireId}|${day}|${q.key}|${chosen}` } } : {}),
        }],
      });
    }
  }
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "Ramp90 · onboarding checkpoint" }] });
  return blocks;
}

export function flagFromAnswers(a: Record<string, number>): "on_track" | "watch" | "at_risk" {
  const scores = [a.clarity, a.support, a.workload];
  if (a.enps <= 4 || scores.some((s) => s <= 2)) return "at_risk";
  if (a.enps <= 6 || scores.some((s) => s === 3)) return "watch";
  return "on_track";
}
