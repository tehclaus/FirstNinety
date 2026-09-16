"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Cohort" },
  { href: "/insights", label: "Insights" },
  { href: "/integrations", label: "Integrations log" },
  { href: "/new", label: "+ New hire" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm text-white">90</span>
          Ramp90
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" || path.startsWith("/hires") : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={`rounded-md px-2.5 py-1.5 transition-colors ${active ? "bg-surface-2 text-ink font-medium" : "text-ink-2 hover:text-ink"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <span className="ml-auto hidden rounded-full border border-line px-2.5 py-1 text-xs text-ink-2 sm:inline">
          Demo mode · synthetic data
        </span>
      </div>
    </header>
  );
}
