import Link from "next/link";
import { allEvents, fmt } from "@/lib/logic";
import { hireById } from "@/lib/demo-data";
import { PageHeader, channelMeta } from "@/components/ui";
import type { Channel } from "@/lib/types";

const channels: Channel[] = ["slack", "calendar", "gmail", "notion"];

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ channel?: string; hire?: string }> }) {
  const { channel, hire } = await searchParams;
  const hireObj = hire ? hireById(hire) : undefined;
  let events = allEvents();
  if (channel) events = events.filter((e) => e.channel === channel);
  if (hireObj) events = events.filter((e) => e.hireId === hireObj.id);
  const upcoming = events.filter((e) => e.scheduled).reverse();
  const past = events.filter((e) => !e.scheduled);

  const href = (c?: string) => {
    const p = new URLSearchParams();
    if (c) p.set("channel", c);
    if (hireObj) p.set("hire", hireObj.id);
    const s = p.toString();
    return `/integrations${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Integrations log"
        subtitle="Everything FirstNinety sends on your behalf. In demo mode these are simulated — open any entry to preview the exact Slack message, email or calendar invite."
      />
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <Link href={href()} className={`rounded-full border px-3 py-1 ${!channel ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2"}`}>All</Link>
        {channels.map((c) => (
          <Link key={c} href={href(c)} className={`rounded-full border px-3 py-1 ${channel === c ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2"}`}>
            <span aria-hidden>{channelMeta[c].icon}</span> {channelMeta[c].label}
          </Link>
        ))}
        {hireObj && (
          <Link href={channel ? `/integrations?channel=${channel}` : "/integrations"} className="rounded-full bg-surface-2 px-3 py-1 text-ink">
            {hireObj.name} ✕
          </Link>
        )}
      </div>

      {[{ title: "Scheduled", list: upcoming }, { title: "Sent", list: past }].map((g) => g.list.length > 0 && (
        <section key={g.title} className="mb-8">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-2">{g.title} · {g.list.length}</h2>
          <ul className="card divide-y divide-line">
            {g.list.map((e) => (
              <li key={e.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-surface-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2" aria-hidden>{channelMeta[e.channel].icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{e.action}</div>
                      <div className="truncate text-xs text-muted">{channelMeta[e.channel].label} → {e.target} · for <Link href={`/hires/${e.hireId}`} className="hover:underline">{e.hireName}</Link></div>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-ink-2">{fmt(e.when)}</span>
                    <span className="text-muted transition-transform group-open:rotate-90" aria-hidden>›</span>
                  </summary>
                  <pre className="mx-4 mb-4 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 font-sans text-sm leading-relaxed text-ink">{e.preview}</pre>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
