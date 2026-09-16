import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function liveConfigured() {
  return {
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
    slack: Boolean(process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET),
    password: Boolean(process.env.LIVE_PASSWORD),
  };
}

export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase is not configured (SUPABASE_URL / SUPABASE_SECRET_KEY)");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export interface LiveHire {
  id: string; created_at: string; name: string; email: string | null; template: string; grade: string;
  location: string; work_mode: string; manager: string; buddy: string; buddy_email: string | null; start_date: string;
  plan: { tasks?: unknown[]; meetings?: unknown[]; goals?: unknown[] };
}
export interface LiveEvent {
  id: number; created_at: string; hire_id: string; channel: string; action: string; target: string | null;
  preview: string | null; status: "ok" | "error" | "skipped"; error: string | null;
}
export interface LiveCheckpoint {
  id: number; hire_id: string; day: 30 | 60 | 90; answers: Record<string, number>; flag: string | null; completed: boolean; updated_at: string;
}

export async function logEvent(e: Omit<LiveEvent, "id" | "created_at" | "error" | "status"> & { status?: LiveEvent["status"]; error?: string | null }) {
  const { error } = await db().from("live_events").insert({ status: "ok", ...e });
  if (error) console.error("logEvent failed", error.message);
}
