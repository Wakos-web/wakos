import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { readStaffSession } from "@/lib/staff-session";

// Get Supabase client with service role (bypasses RLS)
function getServiceClient() {
  const url = process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key);
}

// Resolve the logged-in staff member from the httpOnly session cookie (which
// carries the Supabase Auth user_id, set by adminLogin after the email OTP).
async function verifySession() {
  const session = readStaffSession();
  if (!session) return null;
  // Confirm the user still holds at least one role (revocations apply now).
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.uid)
    .limit(1);
  if (!data || data.length === 0) return null;
  return { id: session.uid, email: session.email };
}

// Get user's roles and scopes
export const getUserRoles = createServerFn().handler(async () => {
  const user = await verifySession();
  if (!user) return { roles: [], scopes: [] };

  const supabase = getServiceClient();
  
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("id, role, role_scopes(*)")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching user roles:", error);
    return { roles: [], scopes: [] };
  }

  return {
    roles: roles?.map(r => r.role) || [],
    roleDetails: roles || [],
  };
});

// Check if user has permission for a specific action
export const checkPermission = createServerFn()
  .validator((d: unknown) => (d ?? {}) as { table_name?: unknown; action?: unknown; scope_id?: unknown })
  .handler(async ({ data }) => {
  const { table_name, action, scope_id } = data;
  const user = await verifySession();
  if (!user) return { allowed: false, reason: "Not authenticated" };

  const supabase = getServiceClient();
  
  // Get user's roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (!userRoles?.length) {
    return { allowed: false, reason: "No roles assigned" };
  }

  const roleNames = userRoles.map(r => r.role);
  
  // Check if any role has the required permission
  const { data: permissions } = await supabase
    .from("role_permissions")
    .select("role, can_create, can_read, can_update, can_delete, scope_required")
    .in("role", roleNames)
    .eq("table_name", table_name);

  if (!permissions?.length) {
    return { allowed: false, reason: "No permissions for this table" };
  }

  // Check each permission
  for (const perm of permissions) {
    const hasAction = 
      (action === "create" && perm.can_create) ||
      (action === "read" && perm.can_read) ||
      (action === "update" && perm.can_update) ||
      (action === "delete" && perm.can_delete);

    if (!hasAction) continue;

    // Check scope if required
    if (perm.scope_required === "own" && scope_id) {
      // Check if user has scope for this specific resource
      const { data: scopes } = await supabase
        .from("role_scopes")
        .select("scope_id")
        .eq("user_role_id", perm.role)
        .eq("scope_type", "club")
        .eq("scope_id", scope_id);

      if (scopes?.length) {
        return { allowed: true, role: perm.role };
      }
    } else if (perm.scope_required === "all" || perm.scope_required === null) {
      return { allowed: true, role: perm.role };
    }
  }

  return { allowed: false, reason: "Insufficient permissions" };
});

// Assign role to user (super_admin only)
export const assignRole = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { user_id?: unknown; role?: unknown; scope_type?: unknown; scope_id?: unknown })
  .handler(async ({ data }) => {
  const { user_id, role, scope_type, scope_id } = data;
  
  // Verify caller is super_admin
  const caller = await verifySession();
  if (!caller) return { error: "Not authenticated" };

  const supabase = getServiceClient();
  
  const { data: callerRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "super_admin")
    .single();

  if (!callerRole) {
    return { error: "Only super admins can assign roles" };
  }

  // Insert the role
  const { data: newRole, error: roleError } = await supabase
    .from("user_roles")
    .insert({
      user_id,
      role,
      created_by: caller.id,
    })
    .select()
    .single();

  if (roleError) {
    return { error: roleError.message };
  }

  // Add scope if provided
  if (scope_type && newRole) {
    const { error: scopeError } = await supabase
      .from("role_scopes")
      .insert({
        user_role_id: newRole.id,
        scope_type,
        scope_id: scope_id || null,
      });

    if (scopeError) {
      return { error: "Role created but scope failed: " + scopeError.message };
    }
  }

  return { success: true, roleId: newRole?.id };
});

// Remove role from user (super_admin only)
export const removeRole = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { user_id?: unknown; role?: unknown })
  .handler(async ({ data }) => {
  const { user_id, role } = data;
  
  // Verify caller is super_admin
  const caller = await verifySession();
  if (!caller) return { error: "Not authenticated" };

  const supabase = getServiceClient();
  
  const { data: callerRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "super_admin")
    .single();

  if (!callerRole) {
    return { error: "Only super admins can remove roles" };
  }

  // Delete the role (cascades to role_scopes)
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", user_id)
    .eq("role", role);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
});

// List all users with their roles
export const listUsersWithRoles = createServerFn().handler(async () => {
  const caller = await verifySession();
  if (!caller) return { users: [] };

  const supabase = getServiceClient();
  
  // Get all auth users
  const { data: users } = await supabase.auth.admin.listUsers();
  
  if (!users?.users) return { users: [] };

  // Get all roles
  const { data: allRoles } = await supabase
    .from("user_roles")
    .select("user_id, role, role_scopes(*)");

  // Combine
  const usersWithRoles = users.users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    roles: allRoles?.filter(r => r.user_id === u.id).map(r => ({
      role: r.role,
      scopes: r.role_scopes || [],
    })) || [],
  }));

  return { users: usersWithRoles };
});
