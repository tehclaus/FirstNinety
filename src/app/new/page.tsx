"use client";
import { useState } from "react";
import { templates } from "@/lib/templates";
import { managers } from "@/lib/demo-data";
import { PageHeader, channelMeta } from "@/components/ui";
import type { Channel } from "@/lib/types";
import { buildPlan, type Form } from "@/lib/plan";

const launchSteps: { channel: Channel; text: (f: Form, n: { tasks: number; meetings: number }) => string }[] = [
  { channel: "notion", text: (_, n) => `Onboarding board created with ${n.tasks} tasks` },
  { channel: "calendar", text: (f, n) => `${n.meetings} Week 1 meetings + 3 checkpoints booked for ${f.name.split(" ")[0]}, ${f.manager}, ${f.buddy}` },
  { channel: "gmail", text: (f) => `Welcome email scheduled for 3 days before start; manager brief sent to ${f.manager}` },
  { channel: "slack", text: (f) => `Buddy intro DM to ${f.buddy}; #welcome post scheduled for Day 1` },
];

export default function NewHirePage() {
  const [f, setF] = useState<Form>({ name: "Nika Tabatadze", template: "engineer", grade: "Senior", location: "Tbilisi", workMode: "Remote", manager: "Levan Chkheidze", buddy: "Dato Lomidze", start: "" });
  const [phase, setPhase] = useState<"form" | "thinking" | "plan" | "launching" | "launched">("form");
  const [done, setDone] = useState(0);
  const plan = phase === "form" || phase === "thinking" ? null : buildPlan(f);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const generate = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("thinking");
    setTimeout(() => setPhase("plan"), 1400);
  };
  const launch = () => {
    setPhase("launching");
    setDone(0);
    launchSteps.forEach((_, i) => setTimeout(() => { setDone(i + 1); if (i === launchSteps.length - 1) setPhase("launched"); }, 700 * (i + 1)));
  };

  const field = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:outline-2 focus:outline-accent";

  return (
    <>
      <PageHeader title="New hire" subtitle="Enter the basics — Ramp90 drafts a personalised pre-boarding checklist, Week 1 schedule and 30/60/90 goals. You review, edit, then launch the automations." />

      <form onSubmit={generate} className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm sm:col-span-2">Full name<input required className={field} value={f.name} onChange={set("name")} /></label>
        <label className="text-sm">Role template
          <select className={field} value={f.template} onChange={set("template")}>{templates.map((t) => <option key={t.key} value={t.key}>{t.role}</option>)}</select>
        </label>
        <label className="text-sm">Grade
          <select className={field} value={f.grade} onChange={set("grade")}>{["Junior", "Mid", "Senior", "Lead"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="text-sm">Location
          <select className={field} value={f.location} onChange={set("location")}>{["Tbilisi", "Berlin", "Lisbon"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="text-sm">Work mode
          <select className={field} value={f.workMode} onChange={set("workMode")}>{["Office", "Hybrid", "Remote"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="text-sm">Manager
          <select className={field} value={f.manager} onChange={set("manager")}>{managers.map((m) => <option key={m.name}>{m.name}</option>)}</select>
        </label>
        <label className="text-sm">Buddy<input required className={field} value={f.buddy} onChange={set("buddy")} /></label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button type="submit" disabled={phase === "thinking" || phase === "launching"} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {phase === "thinking" ? "Drafting plan…" : plan ? "✦ Regenerate plan" : "✦ Generate plan"}
          </button>
          <span className="ml-3 text-xs text-muted">Demo mode: plan built from role templates. Live mode calls an LLM (Gemini / Claude).</span>
        </div>
      </form>

      {phase === "thinking" && (
        <div className="card mt-6 animate-pulse p-5 text-sm text-ink-2">✦ Reading the {templates.find((t) => t.key === f.template)!.role} template, adapting for {f.grade.toLowerCase()} · {f.workMode.toLowerCase()} · {f.location}…</div>
      )}

      {plan && (
        <div className="mt-6 space-y-6">
          <div className="card border-l-4 border-l-accent p-5 text-sm leading-relaxed">
            <div className="text-xs font-medium uppercase tracking-wide text-accent">✦ Why this plan</div>
            {plan.rationale.map((r, i) => <p key={i} className={i ? "mt-1" : "mt-2"}>{r}</p>)}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card p-5">
              <h2 className="font-semibold">Pre-boarding & tasks <span className="text-sm font-normal text-muted">({plan.tasks.length})</span></h2>
              <ul className="mt-3 space-y-2 text-sm">
                {plan.tasks.map((t) => (
                  <li key={t.id}><div>{t.title}</div><div className="text-xs text-muted">{t.owner} · {t.dueDay < 0 ? `${-t.dueDay}d before start` : t.dueDay === 0 ? "Day 1" : `Day ${t.dueDay}`}</div></li>
                ))}
              </ul>
            </section>
            <section className="card p-5">
              <h2 className="font-semibold">Week 1</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[...plan.meetings].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)).map((m, i) => (
                  <li key={i}><div>{m.title}</div><div className="text-xs text-muted">Day {m.day} · {m.time} · {m.minutes} min · {(m.with === "Manager" ? f.manager : m.with === "Buddy" ? f.buddy : m.with)}</div></li>
                ))}
              </ul>
            </section>
            <section className="card p-5">
              <h2 className="font-semibold">30 / 60 / 90 goals</h2>
              <ol className="mt-3 space-y-3 text-sm">
                {plan.goals.map((g) => (
                  <li key={g.phase}><div className="text-xs uppercase tracking-wide text-muted">Day {g.phase} · {g.kind}</div><div>{g.text}</div></li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted">Manager confirms goals in the first 1:1 — a blocking task on day 5.</p>
            </section>
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Launch automations</h2>
                <p className="text-sm text-ink-2">Simulated in demo mode — nothing is actually sent.</p>
              </div>
              <button onClick={launch} disabled={phase === "launching" || phase === "launched"} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60">
                {phase === "launched" ? "✓ Launched" : phase === "launching" ? "Launching…" : "🚀 Launch"}
              </button>
            </div>
            {(phase === "launching" || phase === "launched") && (
              <ul className="mt-4 space-y-2 text-sm">
                {launchSteps.map((s, i) => (
                  <li key={s.channel} className={`flex items-center gap-3 transition-opacity ${i < done ? "opacity-100" : "opacity-30"}`}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-ink-2" aria-hidden>{channelMeta[s.channel].icon}</span>
                    <span className="flex-1"><b className="font-medium">{channelMeta[s.channel].label}</b> — {s.text(f, { tasks: plan.tasks.length, meetings: plan.meetings.length })}</span>
                    <span className={i < done ? "text-good" : "text-muted"}>{i < done ? "✓" : "…"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
