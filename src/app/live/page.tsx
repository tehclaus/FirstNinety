import { isLiveAuthed } from "@/lib/server/auth";
import { db, liveConfigured, type LiveCheckpoint, type LiveEvent, type LiveHire } from "@/lib/server/supabase";
import { templateByKey } from "@/lib/templates";
import { FlagBadge, PageHeader } from "@/components/ui";
import type { Flag } from "@/lib/types";
import { LaunchForm, LoginForm } from "./Forms";
import { deleteHireAction } from "./actions";
import { PulseButton } from "./PulseButton";
import { LocalTime } from "./LocalTime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live mode — Ramp90", robots: { index: false } };

export default async function LivePage() {
  const cfg = liveConfigured();
  if (!cfg.supabase || !cfg.slack || !cfg.password) {
    return (
      <div className="card mx-auto max-w-lg p-6">
        <h1 className="text-lg font-semibold">Live mode is not configured yet</h1>
        <ul className="mt-4 space-y-2 text-sm">
          <li>{cfg.supabase ? "✓" : "○"} Supabase — <code>SUPABASE_URL</code>, <code>SUPABASE_SECRET_KEY</code></li>
          <li>{cfg.slack ? "✓" : "○"} Slack — <code>SLACK_BOT_TOKEN</code>, <code>SLACK_SIGNING_SECRET</code></li>
          <li>{cfg.password ? "✓" : "○"} Password — <code>LIVE_PASSWORD</code></li>
        </ul>
        <p className="mt-4 text-sm text-ink-2">Add them in Vercel → Settings → Environment Variables, then redeploy.</p>
      </div>
    );
  }
  if (!(await isLiveAuthed())) return <LoginForm />;

  const [{ data: hires, error }, { data: events }, { data: cps }] = await Promise.all([
    db().from("live_hires").select("*").order("created_at", { ascending: false }).limit(20),
    db().from("live_events").select("*").order("created_at", { ascending: false }).limit(200),
    db().from("live_checkpoints").select("*"),
  ]);

  return (
    <>
      <PageHeader title="Live mode" subtitle="Real Supabase records and real Slack messages. Visible only to you." />
      {error && <p className="card mb-4 p-4 text-sm text-crit">Supabase error: {error.message}. Did you run supabase/schema.sql?</p>}
      <LaunchForm />

      <h2 className="mb-3 mt-8 text-xs font-medium uppercase tracking-wide text-ink-2">Live hires · {hires?.length ?? 0}</h2>
      <div className="space-y-4">
        {(hires as LiveHire[] | null)?.map((h) => {
          const ev = (events as LiveEvent[] | null)?.filter((e) => e.hire_id === h.id) ?? [];
          const cp = (cps as LiveCheckpoint[] | null)?.filter((c) => c.hire_id === h.id) ?? [];
          return (
            <section key={h.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-sm text-ink-2">{h.grade} {templateByKey(h.template).role} · {h.location} ({h.work_mode}) · starts {new Date(`${h.start_date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })} · manager {h.manager} · buddy {h.buddy}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[30, 60, 90].map((d) => {
                    const sent = ev.find((e) => e.action === `Day ${d} pulse survey sent` && e.status === "ok");
                    const done = cp.find((c) => c.day === d && c.completed);
                    return <PulseButton key={d} hireId={h.id} day={d} disabled={!h.email} lastSentAt={sent?.created_at} answered={done?.flag} />;
                  })}
                  <form action={deleteHireAction}>
                    <input type="hidden" name="hireId" value={h.id} />
                    <button className="rounded-lg px-3 py-1.5 text-xs text-crit hover:bg-crit-soft">Delete</button>
                  </form>
                </div>
              </div>

              {cp.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {cp.sort((a, b) => a.day - b.day).map((c) => (
                    <div key={c.id} className="rounded-xl border border-line p-3 text-sm">
                      <div className="flex items-center gap-2 font-medium">Day {c.day} {c.completed ? <FlagBadge flag={c.flag as Flag} /> : <span className="text-xs text-muted">in progress</span>}</div>
                      <div className="mt-1 text-xs text-ink-2 tabular-nums">
                        Clarity {c.answers.clarity ?? "–"}/5 · Support {c.answers.support ?? "–"}/5 · Workload {c.answers.workload ?? "–"}/5 · eNPS {c.answers.enps ?? "–"}/10
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ul className="mt-4 divide-y divide-line text-sm">
                {ev.map((e) => (
                  <li key={e.id} className="flex gap-3 py-2">
                    <span className={e.status === "ok" ? "text-good" : e.status === "error" ? "text-crit" : "text-muted"}>{e.status === "ok" ? "✓" : e.status === "error" ? "✕" : "–"}</span>
                    <span className="flex-1">{e.action}{e.error && <span className="text-crit"> — {e.error}</span>}</span>
                    <span className="text-xs text-muted tabular-nums"><LocalTime iso={e.created_at} /></span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
