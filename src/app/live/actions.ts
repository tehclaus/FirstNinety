"use server";
import { revalidatePath } from "next/cache";
import { buildPlan, type Form } from "@/lib/plan";
import { isLiveAuthed, tryLogin } from "@/lib/server/auth";
import { db, logEvent } from "@/lib/server/supabase";
import { dmByEmail, pulseBlocks, slack } from "@/lib/server/slack";

export type ActionState = { ok?: boolean; message?: string; steps?: { label: string; ok: boolean; detail?: string }[] };

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const ok = await tryLogin(String(fd.get("password") ?? ""));
  if (ok) revalidatePath("/live");
  return ok ? { ok } : { ok: false, message: "Wrong password" };
}

export async function launchHireAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isLiveAuthed())) return { ok: false, message: "Not authorised" };
  const f: Form = {
    name: String(fd.get("name") ?? "").trim(),
    template: String(fd.get("template") ?? "engineer"),
    grade: String(fd.get("grade") ?? "Mid"),
    location: String(fd.get("location") ?? "Tbilisi"),
    workMode: String(fd.get("workMode") ?? "Hybrid"),
    manager: String(fd.get("manager") ?? ""),
    buddy: String(fd.get("buddy") ?? "").trim(),
    start: String(fd.get("start") ?? ""),
  };
  const email = String(fd.get("email") ?? "").trim() || null;
  const buddyEmail = String(fd.get("buddyEmail") ?? "").trim() || null;
  if (!f.name || !f.buddy || !f.start) return { ok: false, message: "Name, buddy and start date are required" };

  const plan = buildPlan(f);
  const steps: NonNullable<ActionState["steps"]> = [];

  const { data: hire, error } = await db().from("live_hires").insert({
    name: f.name, email, template: f.template, grade: f.grade, location: f.location, work_mode: f.workMode,
    manager: f.manager, buddy: f.buddy, buddy_email: buddyEmail, start_date: f.start,
    plan: { tasks: plan.tasks, meetings: plan.meetings, goals: plan.goals },
  }).select("id").single();
  if (error || !hire) return { ok: false, message: `Supabase: ${error?.message ?? "insert failed"}` };
  steps.push({ label: `Saved ${f.name} with ${plan.tasks.length} tasks and 30/60/90 goals`, ok: true, detail: "Supabase" });
  await logEvent({ hire_id: hire.id, channel: "notion", action: `Plan saved (${plan.tasks.length} tasks)`, target: "Supabase", preview: null, status: "ok" });

  const first = f.name.split(" ")[0];
  const role = plan.t.role;

  // 1. #welcome post
  const channel = process.env.SLACK_WELCOME_CHANNEL || "#welcome";
  const welcomeText = `🎉 Please welcome *${f.name}*, joining as ${f.grade} ${role} in ${f.location} on ${f.start}! Manager: ${f.manager} · Buddy: ${f.buddy}. Say hi 👋`;
  const w = await slack("chat.postMessage", { channel, text: welcomeText });
  steps.push({ label: `Welcome posted in ${channel}`, ok: w.ok, detail: w.error });
  await logEvent({ hire_id: hire.id, channel: "slack", action: `Posted welcome in ${channel}`, target: channel, preview: welcomeText, status: w.ok ? "ok" : "error", error: w.error ?? null });

  // 2. Buddy DM
  if (buddyEmail) {
    const text = `👋 You're ${first}'s onboarding buddy! ${first} joins as ${role} on ${f.start}. A coffee chat is planned for Day 1 at 14:00. Tip: share one thing you wish you'd known in your first week.`;
    const r = await dmByEmail(buddyEmail, text);
    steps.push({ label: `Buddy intro DM to ${f.buddy}`, ok: r.ok, detail: r.error });
    await logEvent({ hire_id: hire.id, channel: "slack", action: "Sent buddy intro DM", target: buddyEmail, preview: text, status: r.ok ? "ok" : "error", error: r.error ?? null });
  } else {
    steps.push({ label: "Buddy DM skipped (no buddy email)", ok: true });
  }

  // 3. New hire Day 1 DM
  if (email) {
    const agenda = [...plan.meetings].filter((m) => m.day === 1).map((m) => `• ${m.time} — ${m.title}`).join("\n");
    const text = `Welcome to Brightfold, ${first}! 🎉\n\nHere's your Day 1:\n${agenda}\n\nYour 30/60/90 goals:\n${plan.goals.map((g) => `• Day ${g.phase} (${g.kind}): ${g.text}`).join("\n")}`;
    const r = await dmByEmail(email, text);
    steps.push({ label: `Day 1 plan DM to ${first}`, ok: r.ok, detail: r.error });
    await logEvent({ hire_id: hire.id, channel: "slack", action: "Sent Day 1 plan DM", target: email, preview: text, status: r.ok ? "ok" : "error", error: r.error ?? null });
  }

  revalidatePath("/live");
  return { ok: steps.every((s) => s.ok), steps, message: `${f.name} launched` };
}

export async function sendPulseAction(fd: FormData) {
  if (!(await isLiveAuthed())) return;
  const hireId = String(fd.get("hireId"));
  const day = Number(fd.get("day") ?? 30);
  const { data: hire } = await db().from("live_hires").select("id,name,email").eq("id", hireId).single();
  if (!hire) return;
  if (!hire.email) {
    await logEvent({ hire_id: hireId, channel: "slack", action: `Day ${day} pulse not sent`, target: null, preview: null, status: "skipped", error: "No Slack email for this hire" });
  } else {
    const first = hire.name.split(" ")[0];
    const r = await dmByEmail(hire.email, `Day ${day} check-in`, pulseBlocks(hireId, first, day, {}));
    await logEvent({ hire_id: hireId, channel: "slack", action: `Day ${day} pulse survey sent`, target: hire.email, preview: "4 questions: clarity, support, workload, eNPS", status: r.ok ? "ok" : "error", error: r.error ?? null });
  }
  revalidatePath("/live");
}

export async function deleteHireAction(fd: FormData) {
  if (!(await isLiveAuthed())) return;
  await db().from("live_hires").delete().eq("id", String(fd.get("hireId")));
  revalidatePath("/live");
}
