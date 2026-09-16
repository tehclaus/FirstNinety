import Link from "next/link";

export default function AboutPage() {
  const h2 = "mt-10 text-lg font-semibold";
  return (
    <article className="mx-auto max-w-2xl leading-relaxed">
      <div className="text-xs font-medium uppercase tracking-wide text-accent">Case study</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Onboarding is not a checklist. It’s a managed path to productivity.</h1>
      <p className="mt-4 text-ink-2">Ramp90 is a portfolio project by a People &amp; Culture leader: an onboarding orchestrator that automates the busywork and gives HR Business Partners an early-warning system for the first 90 days.</p>

      <h2 className={h2}>The problem</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2">
        <li>Onboarding lives in spreadsheets, email threads and people’s heads. Tasks fall between IT, HR and managers.</li>
        <li>HR usually learns that onboarding failed at the exit interview — months too late.</li>
        <li>Managers and new hires often see the same first month very differently, and nobody measures that gap.</li>
      </ul>

      <h2 className={h2}>What it does</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-2">
        <li><b className="text-ink">Drafts a personalised plan</b> — pre-boarding tasks, Week 1 schedule and 30/60/90 goals from role templates, adapted for grade, location and remote work.</li>
        <li><b className="text-ink">Runs the logistics</b> — Google Calendar invites, Gmail welcome and manager briefs, Slack intros and reminders, Notion task boards.</li>
        <li><b className="text-ink">Listens at day 30, 60, 90</b> — a 2-minute Slack pulse for the hire, a 3-minute form for the manager.</li>
        <li><b className="text-ink">Flags what needs a human</b> — AI compares both views, explains the gap and suggests an action for the People Partner.</li>
      </ol>

      <h2 className={h2}>Metrics it tracks</h2>
      <p className="mt-3 text-ink-2">Time to first contribution · task completion by owner · checkpoint eNPS · manager–hire perception gap · flags by manager and span of control.</p>

      <h2 className={h2}>Ethics by design</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2">
        <li>Flags describe the <i>onboarding experience</i>, not a prediction about a person. There is no “will they quit” score.</li>
        <li>AI drafts, humans decide. Every suggestion is addressed to the People Partner, never sent automatically to a manager.</li>
        <li>New hires are told what is collected and why. Team-level eNPS is shown only for groups of 5+.</li>
        <li>Minimum OAuth scopes; no data is used to train models. This public demo uses fully synthetic data.</li>
      </ul>

      <h2 className={h2}>How it’s built</h2>
      <p className="mt-3 text-ink-2">Next.js on Vercel · Supabase (Postgres) · LLM via API · Google Calendar &amp; Gmail APIs · Slack app with Block Kit · Notion API. Designed and vibe-coded with Claude.</p>

      <h2 className={h2}>Roadmap</h2>
      <p className="mt-3 text-ink-2">Ramp90 is module 1 of 3: <b className="text-ink">Onboarding</b> → <b className="text-ink">Performance &amp; Calibration</b> → <b className="text-ink">Org Health</b>. Checkpoint data from onboarding becomes an input for performance and organisational health signals.</p>

      <div className="mt-10 flex gap-3">
        <Link href="/" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">Explore the demo</Link>
        <Link href="/hires/lukas-brandt" className="rounded-lg border border-line px-4 py-2 text-sm">See an “At risk” case</Link>
      </div>
    </article>
  );
}
