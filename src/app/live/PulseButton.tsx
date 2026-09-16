"use client";
import { useActionState, useEffect, useState } from "react";
import { sendPulseAction, type PulseState } from "./actions";

const time = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "");

export function PulseButton({ hireId, day, disabled, lastSentAt, answered }: {
  hireId: string; day: number; disabled?: boolean; lastSentAt?: string; answered?: string | null;
}) {
  const [state, action, pending] = useActionState<PulseState, FormData>(sendPulseAction, {});
  const [toast, setToast] = useState<PulseState | null>(null);

  useEffect(() => {
    if (!state.message) return;
    setToast(state);
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [state]);

  const sentAt = state.ok ? state.at : lastSentAt;
  const status = answered
    ? { cls: "text-good", text: `✓ Answered` }
    : sentAt
      ? { cls: "text-good", text: `✓ Sent ${time(sentAt)}` }
      : null;

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="hireId" value={hireId} />
      <input type="hidden" name="day" value={day} />
      {state.ok === false && state.at && <input type="hidden" name="force" value="1" />}
      <button
        disabled={disabled || pending}
        aria-busy={pending}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${pending ? "border-accent bg-accent-soft text-accent" : "border-line hover:bg-surface-2"}`}
      >
        {pending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
        {pending ? "Sending…" : state.ok === false && state.at ? `Resend day ${day} anyway` : sentAt ? `Resend day ${day}` : `Send day ${day} pulse`}
      </button>
      {status && !pending && <span className={`text-xs ${status.cls}`}>{status.text}</span>}

      {toast && (
        <div role="status" aria-live="polite"
          className={`fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${toast.ok ? "border-good/40 bg-good-soft text-good" : "border-warn/40 bg-warn-soft text-warn"}`}>
          {toast.ok ? "✓ " : "⚠ "}<span className="text-ink">{toast.message}</span>
        </div>
      )}
    </form>
  );
}
