import { getUserRoles, checkPermission, assignRole, removeRole, listUsersWithRoles } from "@/lib/rbac-server";

export { getUserRoles, checkPermission, assignRole, removeRole, listUsersWithRoles };

// Client-side role checking (for UI rendering)
export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

export function isSuperAdmin(userRoles: string[]): boolean {
  return userRoles.includes("super_admin");
}

export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes("admin") || userRoles.includes("super_admin");
}

export function isClubAdmin(userRoles: string[]): boolean {
  return userRoles.includes("club_patron") || isAdmin(userRoles);
}

export function isAlumniAdmin(userRoles: string[]): boolean {
  return userRoles.includes("alumni_patron") || isAdmin(userRoles);
}

// Get available tabs based on user roles
export function getAvailableTabs(userRoles: string[]): string[] {
  const tabs: string[] = [];

  if (isSuperAdmin(userRoles) || isAdmin(userRoles)) {
    tabs.push("overview", "clubs", "alumni", "events", "news", "page-content", "inquiries", "settings");
  }
  
  if (isClubAdmin(userRoles) && !isAdmin(userRoles)) {
    tabs.push("my-clubs");
  }
  
  if (isAlumniAdmin(userRoles) && !isAdmin(userRoles)) {
    tabs.push("alumni", "businesses", "class-notes");
  }

  return tabs;
}

// Role display names
export const ROLE_NAMES: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  club_patron: "Club Patron",
  alumni_patron: "Alumni Patron",
};

// Role colors for UI
export const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  club_patron: "bg-green-100 text-green-800",
  alumni_patron: "bg-amber-100 text-amber-800",
};
