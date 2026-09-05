import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import {
  clearStaffSession,
  issueStaffSession,
  readStaffSession,
} from "@/lib/staff-session";

/**
 * Server-only admin backend. There is no shared passcode anymore: staff sign in
 * with the Supabase Auth email one-time code (the same OTP flow as the alumni
 * Pulse). The client-side OTP produces an access token; adminLogin exchanges it
 * here for an httpOnly session cookie that carries the authenticated user_id.
 *
 * Every later mutation goes through adminProxy, which replays the request with
 * the service-role key, gated by that cookie AND a role allowlist so a club
 * patron cannot reach tables outside their domain even by hand-crafting calls.
 *
 * Secrets (service-role key, session signing key) live only in server env vars.
 */

const STAFF_ROLES = ["super_admin", "admin", "club_patron", "alumni_patron"] as const;

function envVal(value: string | undefined): string {
  return (value || "").replace(/^\uFEFF/, "").trim();
}

export function serviceRoleKey(): string {
  return envVal(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co",
    serviceRoleKey() || "no-key",
    { auth: { persistSession: false } },
  );
}

/** Roles currently assigned to a user (live from the DB, never cached). */
async function rolesForUid(uid: string): Promise<string[]> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);
  return (data || []).map((r) => r.role);
}

async function isSuperAdminUid(uid: string): Promise<boolean> {
  const roles = await rolesForUid(uid);
  return roles.includes("super_admin");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Activate any pending staff invites for a verified auth user. */
async function activatePendingInvites(supabase: ReturnType<typeof getServiceClient>, user: { id: string; email: string }) {
  const email = user.email.toLowerCase();
  const { data: invites } = await supabase
    .from("staff_invites")
    .select("*")
    .eq("status", "pending")
    .ilike("email", email);

  for (const invite of invites || []) {
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", invite.role)
      .maybeSingle();
    if (!existing) {
      const { data: newRole, error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: invite.role, created_by: invite.created_by })
        .select()
        .single();
      if (!roleErr && newRole?.id && invite.club_id) {
        await supabase.from("role_scopes").insert({
          user_role_id: newRole.id,
          scope_type: "club",
          scope_id: invite.club_id,
        });
      }
    }
    await supabase
      .from("staff_invites")
      .update({ status: "active", user_id: user.id, updated_at: new Date().toISOString() })
      .eq("id", invite.id);
  }

}

/**
 * Login: exchange a Supabase Auth access token (obtained client-side from the
 * email OTP flow) for the httpOnly staff session cookie.
 *
 * If the email has a pending invite, the invite is activated first (user_roles
 * + club scope inserted), so a newly invited staff member goes straight in.
 */
export const adminLogin = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { accessToken?: unknown })
  .handler(async ({ data }) => {
  const accessToken = data.accessToken;
  if (typeof accessToken !== "string" || !accessToken) {
    return { ok: false as const, reason: "Missing session token" };
  }

  const supabase = getServiceClient();
  const { data: authData, error } = await supabase.auth.getUser(accessToken);
  const user = authData?.user;
  if (error || !user?.id || !user?.email) {
    return { ok: false as const, reason: "Session could not be verified" };
  }

  await activatePendingInvites(supabase, { id: user.id, email: user.email });

  const roles = await rolesForUid(user.id);
  if (roles.length === 0) {
    return {
      ok: false as const,
      reason: "This email is not an invited staff member yet. Ask a super admin to add you.",
    };
  }

  issueStaffSession(user.id, user.email);
  return {
    ok: true as const,
    user: { id: user.id, email: user.email },
    roles,
  };
});

/**
 * Fallback login for the super admin only: verifies the shared passcode
 * (ADMIN_SECRET env) against a fixed email. Identity still comes from the
 * real auth user for that email — the passcode never replaces per-account
 * sessions, it just unlocks the super admin account when email OTP is
 * unavailable (e.g. mail delivery is down). Any other role is refused.
 */
export const adminPasscodeLogin = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { email?: unknown; passcode?: unknown })
  .handler(async ({ data }) => {
  const { email, passcode } = data;

  const secret = envVal(process.env.ADMIN_SECRET);
  if (!secret) {
    return { ok: false as const, reason: "Passcode fallback is not configured on the server." };
  }
  if (typeof passcode !== "string" || !passcode || !safeEqual(passcode, secret)) {
    return { ok: false as const, reason: "Incorrect passcode." };
  }
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return { ok: false as const, reason: "Enter the super admin email address." };
  }

  const supabase = getServiceClient();
  const serviceKey = serviceRoleKey();
  let user: { id: string; email: string } | null = null;
  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co"}/auth/v1/admin/users?filter=${encodeURIComponent(email.trim())}`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    if (res.ok) {
      const body = (await res.json()) as { users?: Array<{ id: string; email: string }> };
      const match = (body.users || []).find(
        (u) => u.email?.toLowerCase() === email.trim().toLowerCase(),
      );
      if (match) user = { id: match.id, email: match.email };
    }
  } catch {
    // fall through to the "no account" response below
  }
  if (!user) {
    return { ok: false as const, reason: "No staff account found for that email." };
  }

  // The passcode is reserved for the super admin — refuse any other role even
  // with a correct passcode, so a leaked passcode cannot unlock lower accounts.
  await activatePendingInvites(supabase, { id: user.id, email: user.email });
  const roles = await rolesForUid(user.id);
  if (!roles.includes("super_admin")) {
    return { ok: false as const, reason: "The passcode is reserved for the super admin account." };
  }

  issueStaffSession(user.id, user.email);
  return {
    ok: true as const,
    user: { id: user.id, email: user.email },
    roles,
  };
});

export const adminLogout = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as Record<string, never>)
  .handler(async () => {
  clearStaffSession();
  return { ok: true as const };
});

/** Current session: whether the staff cookie is valid, who it belongs to, roles. */
export const adminSession = createServerFn().handler(async () => {
  const session = readStaffSession();
  if (!session) return { authed: false as const, user: null, roles: [] as string[] };

  const roles = await rolesForUid(session.uid);
  if (roles.length === 0) {
    // Revoked or no longer staff — drop the cookie so the gate reappears.
    clearStaffSession();
    return { authed: false as const, user: null, roles: [] as string[] };
  }

  // Resolve the staff member's display name from their invite record so the
  // dashboard can attribute actions (e.g. club post approvals) to a person.
  let name = session.email;
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("staff_invites")
      .select("name")
      .eq("user_id", session.uid)
      .maybeSingle();
    if (data?.name) name = data.name;
  } catch {
    // fall back to the email address
  }

  return {
    authed: true as const,
    user: { id: session.uid, email: session.email, name },
    roles,
  };
});

type ProxyRequest = {
  url: string;
  method?: string;
  body?: string;
  prefer?: string;
  base64?: string;
  contentType?: string;
};

/** Table allowlist per role. Row-level scoping (own club only) is the next step. */
const SUPER_TABLES = new Set<string>([
  "clubs", "club_members", "club_posts", "club_post_media", "club_editors", "club_applications",
  "mentorship_requests", "sports_scholarships", "alumni_profiles", "alumni_businesses",
  "class_notes", "note_comments", "note_likes", "events", "event_rsvps", "inquiries",
  "articles", "page_content", "donations", "giving_ways", "giving_stats",
  "donation_accounts", "mobile_donations", "giving_contact", "site_settings",
  "mwosa_stats", "mwosa_links", "mwosa_updates", "mwosa_update_media",
  "user_roles", "role_scopes", "role_permissions", "staff_invites",
]);

const ADMIN_FORBIDDEN = new Set<string>([
  "user_roles", "role_scopes", "role_permissions", "staff_invites", "site_settings", "donations",
]);

// NOTE: mentorship_requests is NOT included — it stores the club by name
// text (no club_id), so it cannot be scoped per club and is admin-managed.
const CLUB_PATRON_TABLES = new Set<string>([
  "clubs", "club_members", "club_posts", "club_editors", "club_applications",
  "events", "alumni_profiles",
]);

const ALUMNI_PATRON_TABLES = new Set<string>([
  "alumni_profiles", "alumni_businesses", "class_notes", "note_comments", "note_likes",
  "events", "event_rsvps", "inquiries", "clubs",
]);

function tableAllowedFor(roles: string[], table: string): boolean {
  if (roles.includes("super_admin")) return SUPER_TABLES.has(table);
  if (roles.includes("admin")) return !ADMIN_FORBIDDEN.has(table) && SUPER_TABLES.has(table);
  if (roles.includes("club_patron")) return CLUB_PATRON_TABLES.has(table);
  if (roles.includes("alumni_patron")) return ALUMNI_PATRON_TABLES.has(table);
  return false;
}

/* ------------------------------------------------------------------ */
/* Row-level club scoping for club patrons.
 *
 * A patron may only see and change rows belonging to the clubs listed in
 * their role_scopes. Reads without a club filter get one injected; reads
 * that already filter are checked to be a subset of the patron's clubs;
 * writes must target a specific row (or, for inserts, carry a club_id)
 * whose club is within the patron's scope.
 * ------------------------------------------------------------------ */

const CLUB_SCOPED_TABLES = new Set<string>([
  "club_members", "club_posts", "club_editors", "club_applications", "mentorship_requests",
]);

/** Club ids in the patron's role_scopes, or null if they have no club scope. */
async function patronClubScope(uid: string): Promise<string[] | null> {
  const supabase = getServiceClient();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", uid)
    .eq("role", "club_patron");
  const roleIds = (roles || []).map((r) => r.id);
  if (roleIds.length === 0) return null;
  const { data: scopes } = await supabase
    .from("role_scopes")
    .select("scope_id")
    .in("user_role_id", roleIds)
    .eq("scope_type", "club");
  const ids = (scopes || []).map((s) => s.scope_id).filter((x): x is string => !!x);
  return ids.length ? ids : null;
}

function valuesFromFilter(filterValue: string): string[] | null {
  if (filterValue.startsWith("eq.")) return [filterValue.slice(3)];
  if (filterValue.startsWith("in.(") && filterValue.endsWith(")")) {
    return filterValue.slice(4, -1).split(",").filter((v) => v !== "");
  }
  return null; // unsupported operator (neq./not./gt. etc.) — treat as unscoped
}

type ScopeGate =
  | { ok: true; url: string }
  | { ok: false; reason: string };

async function gateClubScope(opts: {
  uid: string;
  table: string;
  method: string;
  url: string;
  bodyText?: string | undefined;
}): Promise<ScopeGate> {
  const scope = await patronClubScope(opts.uid);
  if (!scope) {
    return { ok: false, reason: "No club scope is assigned to your account." };
  }
  const scopeSet = new Set(scope);

  const isClubsTable = opts.table === "clubs";
  const col = isClubsTable ? "id" : CLUB_SCOPED_TABLES.has(opts.table) ? "club_id" : null;
  if (!col) return { ok: true, url: opts.url }; // global table — table allowlist already governs

  const u = new URL(opts.url);
  const params = u.searchParams;
  const method = (opts.method || "GET").toUpperCase();

  // ---- Reads: ensure the request is confined to the patron's clubs. ----
  if (method === "GET") {
    let hasColFilter = false;
    for (const filterValue of params.getAll(col)) {
      hasColFilter = true;
      const values = valuesFromFilter(filterValue);
      if (!values) {
        return { ok: false, reason: "Unsupported filter on scoped rows." };
      }
      for (const v of values) {
        if (!scopeSet.has(v)) {
          return { ok: false, reason: "This request targets rows outside your clubs." };
        }
      }
    }
    if (!hasColFilter) {
      params.append(col, `in.(${scope.join(",")})`);
    }
    return { ok: true, url: u.href };
  }

  // ---- Writes ----
  if (method === "POST") {
    if (isClubsTable) {
      return { ok: false, reason: "Club patrons cannot create clubs." };
    }
    let clubId: string | null = null;
    try {
      clubId = (JSON.parse(opts.bodyText || "{}") as { club_id?: unknown })?.club_id as string | undefined ?? null;
    } catch {
      return { ok: false, reason: "Could not read the row to scope-check it." };
    }
    if (typeof clubId !== "string" || !scopeSet.has(clubId)) {
      return { ok: false, reason: "You can only add rows to your own clubs." };
    }
    return { ok: true, url: opts.url };
  }

  // PATCH / DELETE: every targeted row must belong to one of the patron's clubs.
  const ids: string[] = [];
  for (const filterValue of params.getAll("id")) {
    const values = valuesFromFilter(filterValue);
    if (!values) return { ok: false, reason: "Unsupported id filter." };
    ids.push(...values);
  }
  if (ids.length === 0) {
    return { ok: false, reason: "Changes must target a specific row (no bulk edits)." };
  }
  if (isClubsTable) {
    if (method === "DELETE") {
      return { ok: false, reason: "Club patrons cannot delete clubs." };
    }
    for (const id of ids) {
      if (!scopeSet.has(id)) return { ok: false, reason: "This club is not in your scope." };
    }
    return { ok: true, url: opts.url };
  }

  const supabase = getServiceClient();
  const { data: rows, error: lookupError } = await supabase
    .from(opts.table)
    .select("id, club_id")
    .in("id", ids);
  if (lookupError) {
    // Table has no club_id column (e.g. mentorship_requests) — not scoped.
    return { ok: false, reason: "This table cannot be scope-checked for your role." };
  }
  for (const row of rows || []) {
    if (!row.club_id || !scopeSet.has(row.club_id)) {
      return { ok: false, reason: "One or more target rows are outside your clubs." };
    }
  }
  return { ok: true, url: opts.url };
}

export const adminProxy = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as ProxyRequest)
  .handler(async ({ data }) => {
  const req = data;

  const session = readStaffSession();
  if (!session) {
    return {
      status: 401,
      statusText: "Unauthorized",
      bodyText: JSON.stringify({ code: "401", message: "Staff session expired. Sign in again." }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
  // SSRF guard: only this project's REST / Storage endpoints.
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

  const roles = await rolesForUid(session.uid);
  if (roles.length === 0) {
    return {
      status: 401,
      statusText: "Unauthorized",
      bodyText: JSON.stringify({ code: "401", message: "Your staff access was removed." }),
    };
  }

  // Storage uploads/downloads are allowed for any active staff member; REST
  // calls are checked against the role's table allowlist AND, for club
  // patrons, confined to the rows of their own club(s).
  let targetUrl = req.url;
  if (req.url.startsWith(`${supabaseUrl}/rest/v1/`)) {
    const match = req.url.slice(`${supabaseUrl}/rest/v1/`.length).match(/^([a-zA-Z_]+)/);
    const table = match?.[1];
    if (!table || !tableAllowedFor(roles, table)) {
      return {
        status: 403,
        statusText: "Forbidden",
        bodyText: JSON.stringify({ code: "403", message: `Access to '${table || "?"}' is not allowed for your role.` }),
      };
    }
    if (roles.includes("club_patron")) {
      const gate = await gateClubScope({
        uid: session.uid,
        table,
        method: req.method || "GET",
        url: req.url,
        bodyText: req.body,
      });
      if (!gate.ok) {
        return {
          status: 403,
          statusText: "Forbidden",
          bodyText: JSON.stringify({ code: "403", message: gate.reason }),
        };
      }
      targetUrl = gate.url;
    }
  }

  const serviceKey = serviceRoleKey();
  if (!serviceKey) {
    return {
      status: 500,
      statusText: "Server misconfigured",
      bodyText: JSON.stringify({ code: "500", message: "Service role key is not configured." }),
    };
  }

  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  let body: string | Uint8Array | undefined;
  if (req.base64) {
    headers["Content-Type"] = req.contentType || "application/octet-stream";
    body = new Uint8Array(Buffer.from(req.base64, "base64"));
  } else if (req.body !== undefined && req.body !== null && req.body !== "") {
    headers["Content-Type"] = "application/json";
    body = req.body;
  }
  if (req.prefer) headers["Prefer"] = req.prefer;

  let upstream: Response;
  try {
    const upstreamInit: RequestInit = {
      method: req.method || "GET",
      headers,
    };
    if (body !== undefined) upstreamInit.body = body as unknown as BodyInit;
    upstream = await fetch(targetUrl, upstreamInit);
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
});

/* ------------------------------------------------------------------ */
/* Staff & Roles management (super admin only)                         */
/* ------------------------------------------------------------------ */

export const adminListStaff = createServerFn().handler(async () => {
  const session = readStaffSession();
  if (!session || !(await isSuperAdminUid(session.uid))) {
    return { error: "Only super admins can manage staff." };
  }
  const supabase = getServiceClient();
  const { data } = await supabase.from("staff_invites").select("*").order("created_at", { ascending: true });
  return { invites: data || [] };
});

async function sendStaffInviteEmail(email: string, name: string, roleLabel: string, code: string): Promise<void> {
  const apiKey = envVal(process.env.RESEND_API_KEY);
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  // Production portal URL — the invite must never point at localhost or a
  // preview deployment. Set PORTAL_URL explicitly if the domain changes.
  const portalBase = (process.env.PORTAL_URL || "https://wacos.alerotek.co.ke").replace(/\/$/, "");
  const portal = portalBase + "/admin";
  // Direct link to the password-creation screen (code + new password), so the
  // flow is one hop: code → create password → sign in.
  const acceptUrl = portalBase + "/admin/accept-invite?email=" + encodeURIComponent(email);
  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #166534; margin-bottom: 4px;">
        M.M College Wairaka · Staff Portal
      </p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">Welcome to the WACOS staff team</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        Hi ${name}, you have been added to the M.M College Wairaka admin dashboard
        as <strong>${roleLabel}</strong>. Your access is limited to what that role allows.
      </p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
        To finish setting up your account:
      </p>
      <ol style="font-size: 15px; line-height: 1.7; margin: 0 0 20px; padding-left: 20px; color: #1c1917;">
        <li>
          Open the staff portal: <a href="${acceptUrl}" style="color: #166534; font-weight: 700;">${portal}</a>
        </li>
        <li>Enter your email and this one-time code, then choose your new password:</li>
      </ol>
      <p style="margin: 0 0 20px;">
        <span style="display: inline-block; background: #f0fdf4; border: 2px solid #166534; color: #14532d;
                     padding: 14px 28px; border-radius: 12px; font-size: 30px; font-weight: 700; letter-spacing: 0.35em;">${code}</span>
      </p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        You'll then create your own password. From then on, sign in at
        <a href="${portal}" style="color: #166534; font-weight: 700;">${portal}</a>
        with your email and password.
      </p>
      <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0 0 8px;">
        This code does not expire and can be used once. If you lose it, ask your
        super admin to resend it from Staff &amp; Roles.
      </p>
      <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">
        This invite is for ${email}. If you weren't expecting it, you can ignore this email.
      </p>
    </div>
  `;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "WACOS Staff <wacos@alerotek.co.ke>",
      to: [email],
      subject: `Your M.M College Wairaka staff invite code: ${code}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend replied ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** 6-digit one-time code for invite acceptance. */
function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Hash a code for storage (never store the plaintext code). */
function hashOtpCode(code: string, email: string): string {
  const { createHash } = require("node:crypto") as typeof import("node:crypto");
  return createHash("sha256").update(`${email.toLowerCase()}::${code}`).digest("hex");
}

/** Resolve-or-create the Supabase auth user for an invited email. */
async function ensureAuthUser(supabase: ReturnType<typeof getServiceClient>, email: string) {
  try {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (!createErr && created?.user?.id) return created.user.id;
  } catch {
    // fall through to lookup below (user already exists)
  }
  // Resolve the existing account via the raw admin endpoint (the supabase-js
  // listUsers PageParams type has no `filter`), matching the passcode-login path.
  let users: Array<{ id: string; email: string | null }> = [];
  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co"}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
      { headers: { apikey: serviceRoleKey(), Authorization: `Bearer ${serviceRoleKey()}` } },
    );
    if (res.ok) {
      const body = (await res.json()) as { users?: Array<{ id: string; email: string | null }> };
      users = body.users || [];
    }
  } catch {
    // fall through to the lookup below
  }
  const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return existing?.id || null;
}

export const adminInviteStaff = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { name?: unknown; email?: unknown; role?: unknown; club_id?: unknown })
  .handler(async ({ data }) => {
  const session = readStaffSession();
  if (!session || !(await isSuperAdminUid(session.uid))) {
    return { error: "Only super admins can invite staff." };
  }
  const { name, email, role, club_id } = data;
  const cleanRole = typeof role === "string" && (STAFF_ROLES as readonly string[]).includes(role) ? role : null;
  if (typeof name !== "string" || !name.trim()) return { error: "Name is required." };
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return { error: "A valid email is required." };
  }
  if (!cleanRole) return { error: "Choose a valid role." };
  if (cleanRole === "club_patron" && typeof club_id !== "string") {
    return { error: "Club patrons need a club selected." };
  }
  if (cleanRole !== "club_patron" && club_id) {
    return { error: "Only club patrons can have a club scope." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = getServiceClient();
  const { error } = await supabase.from("staff_invites").insert({
    email: cleanEmail,
    name: name.trim(),
    role: cleanRole,
    status: "pending",
    club_id: typeof club_id === "string" ? club_id : null,
    created_by: session.uid,
    notes: "Invited by " + session.email,
  });
  if (error) {
    return { error: error.code === "23505" ? "That email is already invited or on staff." : error.message };
  }

  // Create the auth account, generate a one-time acceptance code, email it.
  let emailed = false;
  try {
    await ensureAuthUser(supabase, cleanEmail);
    const code = generateOtpCode();
    // No expiry on acceptance codes — the invite stays valid until used or revoked.
    const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("staff_invites")
      .update({ otp_code_hash: hashOtpCode(code, cleanEmail), otp_expires_at: farFuture, otp_attempts: 0 })
      .eq("email", cleanEmail);
    const roleLabel =
      cleanRole === "super_admin" ? "Super Admin"
      : cleanRole === "admin" ? "Admin"
      : cleanRole === "club_patron" ? "Club Patron"
      : "Alumni Patron";
    await sendStaffInviteEmail(cleanEmail, name.trim(), roleLabel, code);
    emailed = true;
  } catch (e: any) {
    console.error("adminInviteStaff email:", e?.message || e);
  }

  return { ok: true as const, emailed };
});

/**
 * Accept a staff invite with the emailed one-time code: verifies the code
 * server-side, sets the chosen password on the auth account, activates the
 * invite + role, and issues the staff session cookie. No staff session is
 * needed here — the code itself is the credential.
 */
export const adminAcceptInvite = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { email?: unknown; code?: unknown; password?: unknown })
  .handler(async ({ data }) => {
  const { email, code, password } = data;
  if (
    typeof email !== "string" ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code.trim()) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return { ok: false as const, reason: "Check your email, 6-digit code, and a password of at least 8 characters." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = getServiceClient();
  const { data: invite } = await supabase
    .from("staff_invites")
    .select("*")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (!invite) return { ok: false as const, reason: "No invite found for that email." };
  if (invite.status === "removed") return { ok: false as const, reason: "This invite was withdrawn." };
  if (invite.status === "active") return { ok: false as const, reason: "This invite is already active. Sign in at /admin." };
  if (!invite.otp_code_hash || !invite.otp_expires_at) {
    return { ok: false as const, reason: "No acceptance code was sent. Ask your super admin to resend it." };
  }
  // No expiry: an acceptance code stays valid until the invite is used or revoked.
  if ((invite.otp_attempts || 0) >= 5) {
    return { ok: false as const, reason: "Too many wrong attempts. Ask your super admin to resend the code." };
  }

  if (hashOtpCode(code.trim(), cleanEmail) !== invite.otp_code_hash) {
    await supabase.from("staff_invites").update({ otp_attempts: (invite.otp_attempts || 0) + 1 }).eq("id", invite.id);
    return { ok: false as const, reason: "That code is incorrect." };
  }

  // Code verified — resolve the auth user (created at invite time) and set the password.
  const uid = await ensureAuthUser(supabase, cleanEmail);
  if (!uid) return { ok: false as const, reason: "Could not find the account for that email." };
  const { error: pwdErr } = await supabase.auth.admin.updateUserById(uid, { password });
  if (pwdErr) {
    console.error("adminAcceptInvite updateUserById:", pwdErr.message);
    return { ok: false as const, reason: "Could not set the password. Try again." };
  }

  // Activate the invite + role (same as first OTP login would).
  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", uid)
    .eq("role", invite.role)
    .maybeSingle();
  if (!existingRole) {
    const { data: newRole } = await supabase
      .from("user_roles")
      .insert({ user_id: uid, role: invite.role, created_by: invite.created_by })
      .select()
      .single();
    if (newRole?.id && invite.club_id) {
      await supabase.from("role_scopes").insert({
        user_role_id: newRole.id,
        scope_type: "club",
        scope_id: invite.club_id,
      });
    }
  }
  await supabase
    .from("staff_invites")
    .update({ status: "active", user_id: uid, otp_code_hash: null, otp_expires_at: null, updated_at: new Date().toISOString() })
    .eq("id", invite.id);

  issueStaffSession(uid, cleanEmail);
  return { ok: true as const, user: { id: uid, email: cleanEmail } };
});

/** Resend a fresh acceptance code for a pending invite (super admin only). */
export const adminResendInviteCode = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: unknown })
  .handler(async ({ data }) => {
  const session = readStaffSession();
  if (!session || !(await isSuperAdminUid(session.uid))) {
    return { error: "Only super admins can resend codes." };
  }
  const id = data.id;
  if (typeof id !== "string") return { error: "Missing invite id." };

  const supabase = getServiceClient();
  const { data: invite } = await supabase.from("staff_invites").select("*").eq("id", id).maybeSingle();
  if (!invite) return { error: "Invite not found." };
  if (invite.status !== "pending") return { error: "Only pending invites can be resent." };

  await ensureAuthUser(supabase, invite.email);
  const code = generateOtpCode();
  // No expiry on acceptance codes — consistent with the original invite.
  const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("staff_invites").update({
    otp_code_hash: hashOtpCode(code, invite.email),
    otp_expires_at: farFuture,
    otp_attempts: 0,
  }).eq("id", id);

  const roleLabel =
    invite.role === "super_admin" ? "Super Admin"
    : invite.role === "admin" ? "Admin"
    : invite.role === "club_patron" ? "Club Patron"
    : "Alumni Patron";
  try {
    await sendStaffInviteEmail(invite.email, invite.name, roleLabel, code);
  } catch (e: any) {
    console.error("adminResendInviteCode:", e?.message || e);
    return { error: "Code was generated but the email could not be sent." };
  }
  return { ok: true as const };
});

export const adminRevokeStaff = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: unknown })
  .handler(async ({ data }) => {
  const session = readStaffSession();
  if (!session || !(await isSuperAdminUid(session.uid))) {
    return { error: "Only super admins can remove staff." };
  }
  const id = data.id;
  if (typeof id !== "string") return { error: "Missing invite id." };

  const supabase = getServiceClient();
  const { data: invite } = await supabase
    .from("staff_invites")
    .select("id, user_id, role")
    .eq("id", id)
    .maybeSingle();
  if (!invite) return { error: "Invite not found." };

  if (invite.user_id) {
    await supabase.from("user_roles").delete().eq("user_id", invite.user_id).eq("role", invite.role);
    await supabase.from("staff_invites").update({ status: "removed", updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    await supabase.from("staff_invites").update({ status: "removed", updated_at: new Date().toISOString() }).eq("id", id);
  }
  return { ok: true as const };
});
