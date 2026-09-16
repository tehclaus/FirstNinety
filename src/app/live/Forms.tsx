"use client";
import { useActionState } from "react";
import { launchHireAction, loginAction, type ActionState } from "./actions";
import { templates } from "@/lib/templates";
import { managers } from "@/lib/demo-data";

const field = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:outline-2 focus:outline-accent";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="card mx-auto mt-10 max-w-sm p-6">
      <h1 className="text-lg font-semibold">Live mode</h1>
      <p className="mt-1 text-sm text-ink-2">Live mode sends real Slack messages. Enter the owner password.</p>
      <input name="password" type="password" required autoFocus className={field + " mt-4"} placeholder="Password" />
      {state.message && <p className="mt-2 text-sm text-crit">{state.message}</p>}
      <button disabled={pending} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}

export function LaunchForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(launchHireAction, {});
  const today = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  return (
    <form action={action} className="card p-5">
      <h2 className="font-semibold">Launch a real onboarding</h2>
      <p className="mt-1 text-sm text-ink-2">Use Slack emails of people in your test workspace (your own email works for both hire and buddy).</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm sm:col-span-2">Full name<input name="name" required className={field} defaultValue="Nika Tabatadze" /></label>
        <label className="text-sm sm:col-span-2">New hire Slack email<input name="email" type="email" className={field} placeholder="name@company.com" /></label>
        <label className="text-sm">Role template
          <select name="template" className={field}>{templates.map((t) => <option key={t.key} value={t.key}>{t.role}</option>)}</select>
        </label>
        <label className="text-sm">Grade
          <select name="grade" className={field} defaultValue="Senior">{["Junior", "Mid", "Senior", "Lead"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="text-sm">Location
          <select name="location" className={field}>{["Tbilisi", "Berlin", "Lisbon"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="text-sm">Work mode
          <select name="workMode" className={field} defaultValue="Hybrid">{["Office", "Hybrid", "Remote"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="text-sm">Manager
          <select name="manager" className={field}>{managers.map((m) => <option key={m.name}>{m.name}</option>)}</select>
        </label>
        <label className="text-sm">Start date<input name="start" type="date" required className={field} defaultValue={today} /></label>
        <label className="text-sm">Buddy name<input name="buddy" required className={field} defaultValue="Dato Lomidze" /></label>
        <label className="text-sm">Buddy Slack email<input name="buddyEmail" type="email" className={field} placeholder="buddy@company.com" /></label>
      </div>
      <button disabled={pending} className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-bg disabled:opacity-50">
        {pending ? "Launching…" : "🚀 Launch for real"}
      </button>
      {state.message && !state.steps && <p className="mt-3 text-sm text-crit">{state.message}</p>}
      {state.steps && (
        <ul className="mt-4 space-y-1 text-sm">
          {state.steps.map((s, i) => (
            <li key={i} className={s.ok ? "text-good" : "text-crit"}>
              {s.ok ? "✓" : "✕"} <span className="text-ink">{s.label}</span>{s.detail && <span className="text-muted"> — {s.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
