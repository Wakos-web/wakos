import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

/**
 * Server-only admin backend. The admin passcode (ADMIN_SECRET) and the Supabase
 * service-role key live ONLY in server env vars — never in the client bundle.
 *
 * Flow: the admin page asks for the passcode once -> adminLogin verifies it
 * server-side and sets an httpOnly signed cookie -> every later mutation goes
 * through adminProxy, which replays the request against PostgREST / Storage with
 * the service-role key (RLS bypassed), gated by the session cookie.
 */

const SESSION_COOKIE = "wacos_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Env values can arrive with a UTF-8 BOM and trailing CR/LF (e.g. added via a
 * shell pipe); sanitize before exact-match compares and key material. */
function envVal(value: string | undefined): string {
  return (value || "").replace(/^\uFEFF/, "").trim();
}

export function sessionSecret(): string {
  return envVal(process.env.ADMIN_SESSION_KEY) || "wacos-local-dev-session-key";
}

export function serviceRoleKey(): string {
  return envVal(process.env.SUPABASE_SERVICE_ROLE_KEY);
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

export function issueSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${signToken(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, signToken(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export const adminLogin = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const expected = envVal(process.env.ADMIN_SECRET);
    const provided = (data as { secret?: unknown })?.secret;
    if (!expected || typeof provided !== "string" || !safeEqual(expected, provided)) {
      return { ok: false as const };
    }
    setCookie(SESSION_COOKIE, issueSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });
    return { ok: true as const };
  },
);

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true as const };
});

export const adminSession = createServerFn().handler(async () => {
  return { authed: verifySessionToken(getCookie(SESSION_COOKIE)) };
});

type ProxyRequest = {
  url: string;
  method?: string;
  /** Raw JSON string body (already serialized by the client), or undefined. */
  body?: string;
  /** PostgREST Prefer header value (e.g. return=representation, count=exact). */
  prefer?: string;
  /** Base64-encoded binary body for storage uploads. */
  base64?: string;
  contentType?: string;
};

export const adminProxy = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const req = data as ProxyRequest;

    if (!verifySessionToken(getCookie(SESSION_COOKIE))) {
      return {
        status: 401,
        statusText: "Unauthorized",
        bodyText: JSON.stringify({ code: "401", message: "Admin session expired. Sign in again." }),
      };
    }

    const serviceKey = serviceRoleKey();
    if (!serviceKey) {
      return {
        status: 500,
        statusText: "Server misconfigured",
        bodyText: JSON.stringify({ code: "500", message: "Service role key is not configured." }),
      };
    }

    const supabaseUrl =
      process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";

    // SSRF guard: only ever talk to this project's REST / Storage endpoints.
    if (
      !req.url?.startsWith(`${supabaseUrl}/rest/v1/`) &&
      !req.url?.startsWith(`${supabaseUrl}/storage/v1/`)
    ) {
      return {
        status: 400,
        statusText: "Bad Request",
        bodyText: JSON.stringify({ code: "400", message: "Unsupported target URL." }),
      };
    }

    const headers: Record<string, string> = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    };

    let body: string | Buffer | undefined;
    if (req.base64) {
      headers["Content-Type"] = req.contentType || "application/octet-stream";
      body = Buffer.from(req.base64, "base64");
    } else if (req.body !== undefined && req.body !== null && req.body !== "") {
      headers["Content-Type"] = "application/json";
      body = req.body;
    }
    if (req.prefer) headers["Prefer"] = req.prefer;

    let upstream: Response;
    try {
      upstream = await fetch(req.url, {
        method: req.method || "GET",
        headers,
        body,
      });
    } catch {
      return {
        status: 502,
        statusText: "Bad Gateway",
        bodyText: JSON.stringify({ code: "502", message: "Upstream request failed." }),
      };
    }

    const upstreamText = await upstream.text();
    const forwarded: Record<string, string> = {};
    const contentRange = upstream.headers.get("content-range");
    const contentType = upstream.headers.get("content-type");
    if (contentRange) forwarded["content-range"] = contentRange;
    if (contentType) forwarded["content-type"] = contentType;

    return {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: forwarded,
      bodyText: upstreamText,
    };
  },
);
