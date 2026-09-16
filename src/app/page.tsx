import Link from "next/link";
import { allHires, daysIn, fmt, latestFlag, nextCheckpoint, progress, stageLabel, stageOf, stages, startDate, tasksOf } from "@/lib/logic";
import { Avatar, FlagBadge, PageHeader, Progress, Stat } from "@/components/ui";
import { company } from "@/lib/demo-data";

export const revalidate = 3600;

export default function CohortPage() {
  const hires = allHires();
  const active = hires.filter((h) => stageOf(h) !== "completed");
  const overdue = hires.flatMap(tasksOf).filter((t) => t.status === "overdue").length;
  const atRisk = hires.filter((h) => latestFlag(h) === "at_risk").length;
  const watch = hires.filter((h) => latestFlag(h) === "watch").length;
  const cps30 = hires.flatMap((h) => h.checkpoints.filter((c) => c.day === 30));
  const enps30 = (cps30.reduce((a, c) => a + c.hire.enps, 0) / cps30.length).toFixed(1);

  return (
    <>
      <PageHeader
        title="Onboarding cohort"
        subtitle={`${company.name} — ${company.tagline}. Every new hire from offer to day 90, with AI flags from 30/60/90 checkpoints.`}
        right={<Link href="/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">+ New hire</Link>}
      />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Active onboardings" value={active.length} hint={`${hires.length - active.length} completed in last 90 days`} />
        <Stat label="Overdue tasks" value={overdue} tone={overdue ? "warn" : undefined} hint="Owners reminded in Slack" />
        <Stat label="Flags" value={`${atRisk} / ${watch}`} tone={atRisk ? "crit" : undefined} hint="At risk / Watch" />
        <Stat label="Day-30 eNPS" value={enps30} hint={`Avg of ${cps30.length} responses, 0–10`} />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-[1080px] grid-cols-6 gap-3">
          {stages.map((s) => {
            const list = hires.filter((h) => stageOf(h) === s).sort((a, b) => a.startOffset - b.startOffset);
            return (
              <section key={s} className="flex flex-col gap-2">
                <h2 className="flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wide text-ink-2">
                  {stageLabel[s]} <span className="text-muted tabular-nums">{list.length}</span>
                </h2>
                {list.map((h) => {
                  const p = progress(h);
                  const d = daysIn(h);
                  const next = nextCheckpoint(h);
                  const flag = latestFlag(h);
                  return (
                    <Link key={h.id} href={`/hires/${h.id}`} className="card block p-3 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent">
                      <div className="flex items-center gap-2">
                        <Avatar name={h.name} size={30} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{h.name}</div>
                          <div className="truncate text-xs text-ink-2">{h.role} · {h.location}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink-2">
                        <span className="tabular-nums">{d < 0 ? `Starts ${fmt(startDate(h))}` : `Day ${d}`}</span>
                        <FlagBadge flag={flag} />
                      </div>
                      {s !== "completed" && (
                        <div className="mt-2">
                          <Progress pct={p.pct} label={`${p.done}/${p.total} tasks`} />
                          <div className="mt-1 text-[11px] text-muted">
                            {p.done}/{p.total} tasks{next ? ` · checkpoint in ${next.inDays}d` : ""}
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
                {list.length === 0 && <div className="rounded-xl border border-dashed border-line p-3 text-xs text-muted">Nobody here</div>}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
