import { templates } from "./templates";
import type { Goal, Meeting, Task } from "./types";

export type Form = { name: string; template: string; grade: string; location: string; workMode: string; manager: string; buddy: string; start: string };

export function buildPlan(f: Form) {
  const t = templates.find((x) => x.key === f.template)!;
  const first = f.name.split(" ")[0] || "the new hire";
  const remote = f.workMode === "Remote";
  const tasks: Task[] = t.tasks.map((x) =>
    x.id === "laptop" && remote ? { ...x, title: "Laptop + home-office kit shipped to home address (tracking shared)", dueDay: -7 } : x,
  );
  if (remote) tasks.push({ id: "remote-intro", title: "Virtual team lunch booked for Week 1", owner: "Manager", dueDay: 2 });
  if (f.grade === "Senior" || f.grade === "Lead") tasks.push({ id: "leadership-intro", title: "Intro to cross-functional leads (skip-level + adjacent teams)", owner: "Manager", dueDay: 10 });
  const meetings: Meeting[] = t.meetings.map((m) => ({ ...m, title: remote ? `${m.title} (Google Meet)` : m.title }));
  const goals: Goal[] = t.goals.map((g) =>
    g.phase === 90 && (f.grade === "Senior" || f.grade === "Lead") ? { ...g, text: `${g.text}; start mentoring one teammate` } : g,
  );
  const rationale = [
    `Based on the ${t.role} template, adapted for ${first}:`,
    remote ? "• Remote setup: equipment ships 7 days earlier, all Week 1 meetings moved to Google Meet, virtual team lunch added." : `• ${f.workMode} in ${f.location}: Day 1 starts at the office at 09:30 local time.`,
    f.grade === "Senior" || f.grade === "Lead" ? "• Senior grade: cross-functional intros added and a mentoring element in the 90-day goal." : "• Mid/Junior grade: stronger buddy pairing in Week 1.",
    `• Checkpoints auto-scheduled for days 30, 60 and 90 with ${f.manager}.`,
  ];
  return { t, tasks: tasks.sort((a, b) => a.dueDay - b.dueDay), meetings, goals, rationale };
}

