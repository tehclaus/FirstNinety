import Link from "next/link";
import { notFound } from "next/navigation";
import { allHires, daysIn, eventsOf, fmt, goalsOf, latestFlag, managerOf, nextCheckpoint, stageLabel, stageOf, startDate, tasksOf } from "@/lib/logic";
import { hireById } from "@/lib/demo-data";
import { templateByKey } from "@/lib/templates";
import { Avatar, FlagBadge, channelMeta } from "@/components/ui";

export const revalidate = 3600;
export function generateStaticParams() {
  return allHires().map((h) => ({ id: h.id }));
}

const scale = (v: number, max: number) => (
  <span className="tabular-nums">{v}<span className="text-muted">/{max}</span></span>
);

export default async function HirePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = hireById(id);
  if (!h) notFound();

  const d = daysIn(h);
  const flag = latestFlag(h);
  const tasks = tasksOf(h);
  const goals = goalsOf(h);
  const tpl = templateByKey(h.template);
  const next = nextCheckpoint(h);
  const mgr = managerOf(h);
  const latest = h.checkpoints.at(-1);
  const events = [
    ...eventsOf(h).filter((e) => !e.scheduled).sort((a, b) => b.when.getTime() - a.when.getTime()),
    ...eventsOf(h).filter((e) => e.scheduled).sort((a, b) => a.when.getTime() - b.when.getTime()),
  ];
  const pos = Math.max(0, Math.min(100, (d / 90) * 100));

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-ink-2 hover:text-ink">← Cohort</Link>

      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={h.name} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{h.name}</h1>
              <FlagBadge flag={flag} size="md" />
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {h.grade} {h.role} · {tpl.dept} · {h.location} ({h.workMode}) · Manager <b className="font-medium text-ink">{h.manager}</b> · Buddy <b className="font-medium text-ink">{h.buddy}</b>
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="text-ink-2">{stageLabel[stageOf(h)]}</div>
            <div className="text-xl font-semibold tabular-nums">{d < 0 ? `Starts in ${-d}d` : `Day ${d}`}</div>
            <div className="text-xs text-muted">Start {fmt(startDate(h))}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <div className="relative h-2 rounded-full bg-surface-2">
            <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${pos}%` }} />
            {[0, 30, 60, 90].map((m) => {
              const cp = h.checkpoints.find((c) => c.day === m);
              return (
                <div key={m} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(m / 90) * 100}%` }}>
                  <div className={`h-4 w-4 rounded-full border-2 border-surface ${cp ? (cp.flag === "at_risk" ? "bg-crit" : cp.flag === "watch" ? "bg-warn" : "bg-good") : d >= m ? "bg-accent" : "bg-line"}`} />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Start</span><span>Day 30</span><span>Day 60</span><span>Day 90</span>
          </div>
        </div>
      </div>

      {(latest || h.note) && (
        <div className={`card border-l-4 p-5 ${flag === "at_risk" ? "border-l-crit" : flag === "watch" ? "border-l-warn" : "border-l-good"}`}>
          <div className="text-xs font-medium uppercase tracking-wide text-accent">✦ AI summary {latest ? `· Day ${latest.day} checkpoint` : "· task signals"}</div>
          <p className="mt-2 leading-relaxed">{latest?.aiSummary ?? h.note}</p>
          {latest?.recommendation && (
            <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm"><b className="font-medium">Suggested HRBP action:</b> {latest.recommendation}</p>
          )}
          <p className="mt-3 text-xs text-muted">AI drafts; the People Partner decides. Flags describe the onboarding experience, not a prediction about the person.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Checkpoints */}
          <section className="card p-5">
            <h2 className="font-semibold">Checkpoints</h2>
            {h.checkpoints.length === 0 && (
              <p className="mt-2 text-sm text-ink-2">No checkpoints yet.{next && ` Day ${next.day} pulse goes out on ${fmt(next.date)} via Slack.`}</p>
            )}
            <div className="mt-3 space-y-4">
              {h.checkpoints.map((c) => (
                <div key={c.day} className="rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Day {c.day}</div>
                    <FlagBadge flag={c.flag} />
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted">New hire (Slack pulse)</div>
                      <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                        <dt className="text-ink-2">Role clarity</dt><dd>{scale(c.hire.clarity, 5)}</dd>
                        <dt className="text-ink-2">Manager support</dt><dd>{scale(c.hire.support, 5)}</dd>
                        <dt className="text-ink-2">Workload</dt><dd>{scale(c.hire.workload, 5)}</dd>
                        <dt className="text-ink-2">eNPS</dt><dd>{scale(c.hire.enps, 10)}</dd>
                      </dl>
                      <p className="mt-2 text-sm italic text-ink-2">“{c.hire.comment}”</p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted">Manager ({h.manager})</div>
                      {c.manager ? (
                        <>
                          <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                            <dt className="text-ink-2">Goal progress</dt><dd>{scale(c.manager.goalProgress, 5)}</dd>
                            <dt className="text-ink-2">Ramp score</dt><dd>{scale(c.manager.ramp, 5)}</dd>
                          </dl>
                          <p className="mt-2 text-sm italic text-ink-2">“{c.manager.comment}”</p>
                        </>
                      ) : <p className="mt-2 text-sm text-warn">Not submitted</p>}
                    </div>
                  </div>
                  {c !== latest && <p className="mt-3 border-t border-line pt-3 text-sm text-ink-2"><span className="text-accent">✦</span> {c.aiSummary}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Goals */}
          <section className="card p-5">
            <h2 className="font-semibold">30 / 60 / 90 goals</h2>
            <ol className="mt-3 space-y-3">
              {goals.map((g) => (
                <li key={g.phase} className="flex gap-3">
                  <span className="mt-0.5 w-14 shrink-0 text-sm font-semibold tabular-nums">Day {g.phase}</span>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wide text-muted">{g.kind}</div>
                    <div className="text-sm">{g.text}</div>
                  </div>
                  <span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-xs ${g.status === "done" ? "bg-good-soft text-good" : g.status === "missed" ? "bg-crit-soft text-crit" : g.status === "in_progress" ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2"}`}>
                    {g.status === "done" ? "✓ Met" : g.status === "missed" ? "✕ Missed" : g.status === "in_progress" ? "In progress" : "Upcoming"}
                  </span>
                </li>
              ))}
            </ol>
            {h.firstContributionDay && <p className="mt-4 text-sm text-ink-2">First contribution shipped on <b className="text-ink">day {h.firstContributionDay}</b>.</p>}
          </section>

          {/* Week 1 */}
          <section className="card p-5">
            <h2 className="font-semibold">Week 1 schedule <span className="text-sm font-normal text-muted">· booked in Google Calendar ({h.timezone})</span></h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {[...tpl.meetings].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)).map((m, i) => (
                <li key={i} className="flex gap-3 py-2">
                  <span className="w-24 shrink-0 tabular-nums text-ink-2">Day {m.day} · {m.time}</span>
                  <span className="flex-1">{m.title}</span>
                  <span className="text-ink-2">{(m.with === "Manager" ? h.manager : m.with === "Buddy" ? h.buddy : m.with)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          {/* Tasks */}
          <section className="card p-5">
            <h2 className="font-semibold">Tasks</h2>
            <ul className="mt-3 space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex gap-2 text-sm">
                  <span aria-hidden className={`mt-0.5 ${t.status === "done" ? "text-good" : t.status === "overdue" ? "text-crit" : "text-muted"}`}>
                    {t.status === "done" ? "✓" : t.status === "overdue" ? "!" : "○"}
                  </span>
                  <div className="flex-1">
                    <div className={t.status === "done" ? "text-ink-2 line-through decoration-line" : ""}>{t.title}</div>
                    <div className={`text-xs ${t.status === "overdue" ? "text-crit" : "text-muted"}`}>
                      {t.owner} · {t.status === "overdue" ? "Overdue since " : "Due "}{fmt(t.due)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5 text-sm">
            <h2 className="font-semibold">Manager context</h2>
            <p className="mt-2 text-ink-2">{mgr.title} · {mgr.location}</p>
            <p className={`mt-1 ${mgr.directReports > 10 ? "text-warn" : "text-ink-2"}`}>
              {mgr.directReports} direct reports{mgr.directReports > 10 ? " — above the 10-person span guideline" : ""}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Automations</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {events.slice(0, 8).map((e) => (
                <li key={e.id} className="flex gap-2">
                  <span className="w-5 text-center text-ink-2" aria-hidden>{channelMeta[e.channel].icon}</span>
                  <div className="flex-1">
                    <div>{e.action}</div>
                    <div className="text-xs text-muted">{channelMeta[e.channel].label} · {e.scheduled ? "Scheduled " : ""}{fmt(e.when)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Link href={`/integrations?hire=${h.id}`} className="mt-3 inline-block text-sm text-accent hover:underline">See full log with previews →</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
