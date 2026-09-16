import { hires, managers } from "./demo-data";
import { templateByKey } from "./templates";
import type { Channel, Flag, Hire, Stage, Task } from "./types";

export const DAY = 86_400_000;

export function today(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export const startDate = (h: Hire) => new Date(today().getTime() + h.startOffset * DAY);
export const dateAt = (h: Hire, day: number) => new Date(startDate(h).getTime() + day * DAY);
export const daysIn = (h: Hire) => -h.startOffset; // day index since start (0 = start day)

export const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function stageOf(h: Hire): Stage {
  const d = daysIn(h);
  if (d < 0) return "preboarding";
  if (d < 7) return "week1";
  if (d <= 30) return "day30";
  if (d <= 60) return "day60";
  if (d <= 90) return "day90";
  return "completed";
}

export const stageLabel: Record<Stage, string> = {
  preboarding: "Pre-boarding",
  week1: "Week 1",
  day30: "Days 1–30",
  day60: "Days 31–60",
  day90: "Days 61–90",
  completed: "Completed",
};

export const stages: Stage[] = ["preboarding", "week1", "day30", "day60", "day90", "completed"];

export type TaskStatus = "done" | "overdue" | "open";
export interface TaskView extends Task { status: TaskStatus; due: Date }

export function tasksOf(h: Hire): TaskView[] {
  const t = templateByKey(h.template);
  return t.tasks
    .map((task) => {
      const dueAbs = h.startOffset + task.dueDay; // days from today
      let status: TaskStatus = dueAbs < 0 ? "done" : "open";
      if (h.overdueTaskIds?.includes(task.id)) status = "overdue";
      return { ...task, status, due: dateAt(h, task.dueDay) };
    })
    .sort((a, b) => a.dueDay - b.dueDay);
}

export function goalsOf(h: Hire) {
  const d = daysIn(h);
  return templateByKey(h.template).goals.map((g) => {
    const missed = h.missedGoals?.includes(`${g.phase}-${g.kind}`);
    const status = missed ? "missed" : d >= g.phase ? "done" : d >= g.phase - 30 ? "in_progress" : "upcoming";
    return { ...g, status: status as "missed" | "done" | "in_progress" | "upcoming" };
  });
}

export function latestFlag(h: Hire): Flag | null {
  const tasks = tasksOf(h);
  const cp = h.checkpoints.at(-1);
  if (cp) return cp.flag;
  if (tasks.some((t) => t.status === "overdue")) return "watch";
  return null;
}

export const flagLabel: Record<Flag, string> = { on_track: "On track", watch: "Watch", at_risk: "At risk" };

export function progress(h: Hire) {
  const tasks = tasksOf(h);
  const done = tasks.filter((t) => t.status === "done").length;
  return { done, total: tasks.length, pct: Math.round((done / tasks.length) * 100) };
}

export function nextCheckpoint(h: Hire) {
  const d = daysIn(h);
  const next = [30, 60, 90].find((c) => c > d);
  return next ? { day: next, inDays: next - d, date: dateAt(h, next) } : null;
}

export const allHires = () => hires;
export const managerOf = (h: Hire) => managers.find((m) => m.name === h.manager)!;

// ——— Integration log (simulated) ———
export interface IntegrationEvent {
  id: string;
  hireId: string;
  hireName: string;
  channel: Channel;
  when: Date;
  action: string;
  target: string;
  preview: string;
  scheduled: boolean; // in the future
}

export function eventsOf(h: Hire): IntegrationEvent[] {
  const t = templateByKey(h.template);
  const first = h.name.split(" ")[0];
  const ev: IntegrationEvent[] = [];
  const push = (channel: Channel, day: number, action: string, target: string, preview: string) => {
    const when = dateAt(h, day);
    ev.push({
      id: `${h.id}-${ev.length}`, hireId: h.id, hireName: h.name, channel, when, action, target, preview,
      scheduled: when.getTime() > today().getTime(),
    });
  };

  push("notion", -14, "Created onboarding board with " + t.tasks.length + " tasks", "Notion · People Ops / Onboarding",
    t.tasks.slice(0, 4).map((x) => `☐ ${x.title} — ${x.owner}`).join("\n") + "\n…");
  push("gmail", -3, "Sent welcome email", `${first.toLowerCase()}@personal-mail.example`,
    `Subject: Welcome to Brightfold, ${first}! Your first day\n\nHi ${first},\n\nWe're excited to have you join as ${h.role}. On Day 1, your manager ${h.manager} and your buddy ${h.buddy} will be waiting for you${h.workMode === "Remote" ? " on Google Meet" : ` at the ${h.location} office`} at 09:30.\n\nYour first week agenda is already in your calendar.`);
  push("gmail", -3, "Sent manager briefing", h.manager,
    `Subject: ${first} starts on ${fmt(startDate(h))} — your 5-minute brief\n\n• Confirm 30/60/90 goals in your first 1:1 (draft attached)\n• Week 1 meetings are booked\n• Checkpoints: day 30, 60, 90 — you'll get a 3-minute form`);
  push("calendar", -2, `Booked ${t.meetings.length} Week 1 meetings`, `${first}, ${h.manager}, ${h.buddy}`,
    t.meetings.map((m) => `Day ${m.day} · ${m.time} · ${m.title} (${m.minutes} min) — ${m.with}`).join("\n"));
  push("calendar", -2, "Booked 30/60/90 checkpoints", `${first} + ${h.manager}`,
    [30, 60, 90].map((c) => `Day ${c} · ${fmt(dateAt(h, c))} · Onboarding checkpoint (30 min)`).join("\n"));
  push("slack", -2, "Sent buddy intro DM", `@${h.buddy.split(" ")[0].toLowerCase()}`,
    `👋 You're ${first}'s onboarding buddy! ${first} joins as ${h.role} on ${fmt(startDate(h))}. Your coffee chat is booked for Day 1, 14:00. Tip: share one thing you wish you'd known in your first week.`);
  push("slack", 0, "Posted welcome in #welcome", "#welcome",
    `🎉 Please welcome *${h.name}*, our new ${h.role} in ${h.location}! ${first} is joining ${managerOf(h).title.split(",")[1]?.trim() ?? managerOf(h).dept}. Say hi 👋`);
  for (const cp of [30, 60, 90]) {
    push("slack", cp, `Day ${cp} pulse survey sent`, `@${first.toLowerCase()}`,
      `Hi ${first}, it's day ${cp}! 4 quick questions (≈2 min):\n1. How clear is your role and what's expected? (1–5)\n2. How supported do you feel by your manager? (1–5)\n3. How manageable is your workload? (1–5)\n4. How likely are you to recommend Brightfold as a place to work? (0–10)`);
  }
  for (const task of tasksOf(h).filter((x) => x.status === "overdue")) {
    push("slack", task.dueDay + 1, `Overdue reminder: ${task.title}`, task.owner === "Manager" ? `@${h.manager.split(" ")[0].toLowerCase()}` : `#it-helpdesk`,
      `⏰ Reminder: "${task.title}" for ${h.name} was due ${fmt(task.due)}. Can you update the status?`);
  }
  return ev;
}

export function allEvents() {
  return hires.flatMap(eventsOf).sort((a, b) => b.when.getTime() - a.when.getTime());
}
