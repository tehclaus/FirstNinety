import Link from "next/link";
import { allHires, latestFlag, tasksOf } from "@/lib/logic";
import { managers } from "@/lib/demo-data";
import { templateByKey } from "@/lib/templates";
import { FlagBadge, PageHeader, Stat } from "@/components/ui";
import type { Owner } from "@/lib/types";

export const revalidate = 3600;

function HBar({ label, value, max, suffix = "", sub }: { label: string; value: number; max: number; suffix?: string; sub?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr_48px] items-center gap-3 text-sm" title={`${label}: ${value}${suffix}`}>
      <div className="truncate text-ink-2">{label}{sub && <span className="block text-xs text-muted">{sub}</span>}</div>
      <div className="h-3 rounded-r bg-surface-2">
        <div className="h-full rounded-r" style={{ width: `${(value / max) * 100}%`, background: "var(--bar)" }} />
      </div>
      <div className="text-right tabular-nums">{value}{suffix}</div>
    </div>
  );
}

export default function InsightsPage() {
  const hires = allHires();
  const cps = hires.flatMap((h) => h.checkpoints.map((c) => ({ h, c })));

  // Perception gap: manager ramp (1–5 → ×2) vs hire eNPS (0–10)
  const gaps = cps
    .filter(({ c }) => c.manager)
    .map(({ h, c }) => ({ h, c, mgr: c.manager!.ramp * 2, hire: c.hire.enps, gap: c.manager!.ramp * 2 - c.hire.enps }))
    .sort((a, b) => b.gap - a.gap);

  // Time to first contribution by role
  const byRole = new Map<string, number[]>();
  hires.filter((h) => h.firstContributionDay).forEach((h) => {
    const r = templateByKey(h.template).role;
    byRole.set(r, [...(byRole.get(r) ?? []), h.firstContributionDay!]);
  });
  const ttfc = [...byRole.entries()].map(([role, v]) => ({ role, avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length), n: v.length }));
  const ttfcAll = Math.round(hires.filter((h) => h.firstContributionDay).reduce((a, h) => a + h.firstContributionDay!, 0) / hires.filter((h) => h.firstContributionDay).length);

  // Overdue by owner
  const owners: Owner[] = ["IT", "Manager", "HR", "Buddy", "New hire"];
  const tasks = hires.flatMap(tasksOf);
  const overdueBy = owners.map((o) => ({ o, n: tasks.filter((t) => t.owner === o && t.status === "overdue").length }));
  const onTime = Math.round((tasks.filter((t) => t.status === "done").length / tasks.filter((t) => t.status !== "open").length) * 100);

  // Managers
  const mgrRows = managers.map((m) => {
    const hs = hires.filter((h) => h.manager === m.name);
    const enps = hs.flatMap((h) => h.checkpoints.map((c) => c.hire.enps));
    const flags = hs.map(latestFlag);
    return { m, n: hs.length, enps: enps.length ? (enps.reduce((a, b) => a + b, 0) / enps.length).toFixed(1) : "—", risk: flags.includes("at_risk") ? "at_risk" as const : flags.includes("watch") ? "watch" as const : hs.some((h) => h.checkpoints.length) ? "on_track" as const : null };
  }).sort((a, b) => b.n - a.n);

  const avgEnps = (day: number) => {
    const v = cps.filter(({ c }) => c.day === day).map(({ c }) => c.hire.enps);
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "—";
  };

  return (
    <>
      <PageHeader title="Insights" subtitle="Where onboarding works, where it breaks, and what to fix first. Aggregates only — individual answers are visible to the People Partner, never ranked." />

      <div className="card mb-6 border-l-4 border-l-accent p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-accent">✦ AI cohort brief · for Head of People</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li><b className="font-medium">One manager, one pattern.</b> All three current hires under Daniel Kraus (14 direct reports) carry a flag. Lukas: cancelled 1:1s at day 30, eNPS 3 at day 60. Elif: goals still not agreed at day 20. Rui: laptop late before day 1. This is a capacity issue, not a hiring issue.</li>
          <li><b className="font-medium">Structure beats enthusiasm.</b> Most flags in the cohort trace back to structure (no territory, two PMs, no definition of done, cancelled 1:1s), not motivation. Nino’s case shows one structural fix moved clarity from 2 to 4 in 30 days.</li>
          <li><b className="font-medium">Buddies are the hidden accelerator.</b> Hires with active pairing buddies (Ana, Sophie) reached first contribution in 37 days on average vs 42 for the cohort.</li>
          <li><b className="font-medium">Recommended next step:</b> rebalance Daniel’s span (move 3–4 reports to a new team lead) and make “goals agreed by day 5” a blocking task for managers.</li>
        </ul>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="eNPS day 30 → 90" value={`${avgEnps(30)} → ${avgEnps(90)}`} hint="Avg hire response, 0–10" />
        <Stat label="Time to first contribution" value={`${ttfcAll}d`} hint="Cohort average" />
        <Stat label="Tasks done on time" value={`${onTime}%`} hint="Of tasks already due" />
        <Stat label="Checkpoint response" value="100%" hint="Hires and managers" tone="good" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold">Perception gap: manager vs new hire</h2>
          <p className="mt-1 text-sm text-ink-2">Manager ramp score (1–5, shown ×2) against the hire’s own eNPS (0–10). A large positive gap means the manager thinks things are fine while the hire does not — the earliest warning signal we have.</p>
          <div className="mt-4 flex gap-4 text-xs text-ink-2">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2a78d6" }} /> Manager view</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "#eb6834" }} /> New hire eNPS</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="py-2 font-medium">Hire · checkpoint</th><th className="py-2 font-medium">0 ——— 10</th><th className="py-2 text-right font-medium">Gap</th><th className="py-2 pl-4 font-medium">Flag</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {gaps.slice(0, 8).map(({ h, c, mgr, hire, gap }) => (
                  <tr key={h.id + c.day}>
                    <td className="py-2"><Link href={`/hires/${h.id}`} className="hover:underline">{h.name}</Link> <span className="text-muted">· D{c.day}</span></td>
                    <td className="w-1/2 py-2">
                      <div className="relative h-4" title={`Manager ${mgr}/10 · Hire ${hire}/10`}>
                        <div className="absolute top-1/2 h-px w-full bg-line" />
                        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink-2/40" style={{ left: `${Math.min(mgr, hire) * 10}%`, width: `${Math.abs(gap) * 10}%` }} />
                        <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--surface)]" style={{ left: `${hire * 10}%`, background: "#eb6834" }} />
                        <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--surface)]" style={{ left: `${mgr * 10}%`, background: "#2a78d6" }} />
                      </div>
                    </td>
                    <td className={`py-2 text-right tabular-nums ${gap >= 3 ? "font-semibold text-crit" : "text-ink-2"}`}>{gap > 0 ? `+${gap}` : gap}</td>
                    <td className="py-2 pl-4"><FlagBadge flag={c.flag} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Time to first contribution</h2>
          <p className="mt-1 text-sm text-ink-2">Days from start to first shipped work, by role.</p>
          <div className="mt-4 space-y-3">
            {ttfc.sort((a, b) => a.avg - b.avg).map((r) => <HBar key={r.role} label={r.role} sub={`${r.n} hire${r.n > 1 ? "s" : ""}`} value={r.avg} max={60} suffix="d" />)}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Overdue tasks by owner</h2>
          <p className="mt-1 text-sm text-ink-2">Who the onboarding is waiting on right now.</p>
          <div className="mt-4 space-y-3">
            {overdueBy.map((r) => <HBar key={r.o} label={r.o} value={r.n} max={Math.max(3, ...overdueBy.map((x) => x.n))} />)}
          </div>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold">Managers</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="py-2 font-medium">Manager</th><th className="py-2 text-right font-medium">Span</th><th className="py-2 text-right font-medium">New hires</th><th className="py-2 text-right font-medium">Avg hire eNPS</th><th className="py-2 pl-4 font-medium">Worst current flag</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {mgrRows.map((r) => (
                  <tr key={r.m.name}>
                    <td className="py-2">{r.m.name}<div className="text-xs text-muted">{r.m.title}</div></td>
                    <td className={`py-2 text-right tabular-nums ${r.m.directReports > 10 ? "font-semibold text-warn" : ""}`}>{r.m.directReports}</td>
                    <td className="py-2 text-right tabular-nums">{r.n}</td>
                    <td className="py-2 text-right tabular-nums">{r.enps}</td>
                    <td className="py-2 pl-4"><FlagBadge flag={r.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
