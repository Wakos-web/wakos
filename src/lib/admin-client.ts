import { createClient } from "@supabase/supabase-js";
import {
  adminLogin,
  adminLogout,
  adminPasscodeLogin,
  adminProxy,
  adminSession,
  adminListStaff,
  adminInviteStaff,
  adminAcceptInvite,
  adminResendInviteCode,
  adminRevokeStaff,
} from "@/lib/admin-server";

/**
 * Admin-only Supabase client. Every request is replayed server-side by
 * adminProxy with the service-role key, gated by an httpOnly session cookie.
 * No admin secret or service key ever ships in the client bundle.
 *
 * The rest of the dashboard code keeps using the normal supabase-js API
 * (.from(...).select/.insert/.update/.delete, storage uploads) unchanged —
 * only the underlying fetch is swapped.
 */

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_BXQkhnpm3ha7O7ZjGrZlqg_Es95WeON";

type ProxyResult = {
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  bodyText: string;
};

function toResponse(r: ProxyResult): Response {
  // 204/205/304 must not carry a body — null it out when empty.
  const body = r.bodyText === "" ? null : r.bodyText;
  return new Response(body, {
    status: r.status,
    statusText: r.statusText,
    headers: r.headers ?? {},
  });
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const adminFetch: typeof fetch = async (input, init) => {
  const url = resolveUrl(input);
  // Only REST/Storage calls need the service role. Everything else
  // (auth endpoints etc.) goes straight through with the anon key.
  if (
    !url.startsWith(`${supabaseUrl}/rest/v1/`) &&
    !url.startsWith(`${supabaseUrl}/storage/v1/`)
  ) {
    return fetch(input, init);
  }

  const method = init?.method || "GET";
  const headers = new Headers(init?.headers || {});
  const prefer = headers.get("Prefer") || undefined;

  // Binary storage uploads (images etc.) cannot be JSON-serialized, so encode
  // them as base64 and let the server forward the raw bytes with the service key.
  if (url.includes("/storage/v1/") && init?.body instanceof Blob) {
    const buf = new Uint8Array(await init.body.arrayBuffer());
    const result = await adminProxy({
      data: {
        url,
        method,
        base64: bytesToBase64(buf),
        contentType: headers.get("Content-Type") || "application/octet-stream",
      },
    });
    return toResponse(result);
  }

  const rawBody = init?.body;
  const result = await adminProxy({
    data: {
      url,
      method,
      body: typeof rawBody === "string" ? rawBody : undefined,
      prefer,
    },
  });
  return toResponse(result);
};

export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: adminFetch as typeof fetch },
});

export { adminLogin, adminLogout, adminPasscodeLogin, adminSession, adminListStaff, adminInviteStaff, adminAcceptInvite, adminResendInviteCode, adminRevokeStaff };
