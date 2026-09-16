import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "r90_live";
const digest = (s: string) => crypto.createHash("sha256").update(`ramp90:${s}`).digest("hex");

export async function isLiveAuthed() {
  const pw = process.env.LIVE_PASSWORD;
  if (!pw) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return c === digest(pw);
}

export async function tryLogin(password: string) {
  const pw = process.env.LIVE_PASSWORD;
  if (!pw || password !== pw) return false;
  (await cookies()).set(COOKIE, digest(pw), { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 14, path: "/" });
  return true;
}
