import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

/**
 * Shared staff session (server-only). Replaces the old shared-passcode cookie
 * (whose payload held only an expiry) with a signed token that carries the
 * Supabase Auth user id and email of the logged-in staff member. Both
 * admin-server.ts (dashboard + proxy) and rbac-server.ts (role helpers) rely
 * on this, so the identity is enforced consistently.
 */

export const SESSION_COOKIE = "wacos_admin_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days ("kept logged in")

type StaffSession = {
  uid: string;
  email: string;
  exp: number;
};

function envVal(value: string | undefined): string {
  return (value || "").replace(/^\uFEFF/, "").trim();
}

function sessionSecret(): string {
  return envVal(process.env.ADMIN_SESSION_KEY) || "wacos-local-dev-session-key";
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function signToken(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function encode(obj: StaffSession): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

export function readStaffSession(): StaffSession | null {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!safeEqual(sig, signToken(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as StaffSession;
    if (
      typeof parsed.uid !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number" ||
      Date.now() >= parsed.exp
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function issueStaffSession(uid: string, email: string): void {
  const payload = encode({ uid, email, exp: Date.now() + SESSION_TTL_MS });
  setCookie(SESSION_COOKIE, `${payload}.${signToken(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearStaffSession(): void {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
