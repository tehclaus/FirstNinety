import type { Flag } from "@/lib/types";
import { flagLabel } from "@/lib/logic";

const flagStyle: Record<Flag, { cls: string; icon: string }> = {
  on_track: { cls: "bg-good-soft text-good", icon: "●" },
  watch: { cls: "bg-warn-soft text-warn", icon: "▲" },
  at_risk: { cls: "bg-crit-soft text-crit", icon: "◆" },
};

export function FlagBadge({ flag, size = "sm" }: { flag: Flag | null; size?: "sm" | "md" }) {
  if (!flag) return <span className="text-xs text-muted">No signal yet</span>;
  const s = flagStyle[flag];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${s.cls} ${size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}>
      <span aria-hidden className="text-[0.7em]">{s.icon}</span>
      {flagLabel[flag]}
    </span>
  );
}

export function Progress({ pct, label }: { pct: number; label?: string }) {
  return (
    <div className="w-full" title={label ?? `${pct}%`}>
      <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "crit" | "warn" | "good" }) {
  const toneCls = tone === "crit" ? "text-crit" : tone === "warn" ? "text-warn" : tone === "good" ? "text-good" : "text-ink";
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-3xl font-semibold tabular-nums ${toneCls}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-2">{hint}</div>}
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hues = [210, 25, 160, 280, 340, 45];
  const hue = hues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 45% 45%)` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export const channelMeta = {
  slack: { label: "Slack", icon: "#" },
  calendar: { label: "Google Calendar", icon: "▦" },
  gmail: { label: "Gmail", icon: "✉" },
  notion: { label: "Notion", icon: "☑" },
} as const;

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-2 max-w-2xl">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
