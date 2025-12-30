/**
 * Client-side permission checking composable
 * Note: This is for UI convenience only. Server-side checks are authoritative.
 */

import { computed } from "vue";
import type { Permission } from "@server/utils/permissions";
import { normalizeRole } from "~/utils/roles";

const rolePermissions: Record<string, Permission[]> = {
  OWNER: [
    "admin:read",
    "admin:write",
    "ops:read",
    "ops:edit",
    "ops:publish",
    "ops:rollback",
    "mic:read",
    "mic:edit",
    "mic:submit",
    "mic:approve",
    "mic:publish",
    "people:read",
    "people:edit",
    "people:delete",
    "people:assign_roles",
    "owner:dashboard",
    "owner:finance:view",
    "owner:finance:edit",
    "owner:approve_all",
    "charities:read",
    "charities:edit",
    "charities:delete",
    "audit:read",
    "patterns:read",
    "patterns:edit",
    "programs:read",
    "programs:edit",
  ],
  MIC: [
    "admin:read",
    "ops:read",
    "ops:edit",
    "mic:read",
    "mic:edit",
    "mic:submit",
    "patterns:read",
    "programs:read",
  ],
  CHARITY: ["admin:read", "charities:read", "charities:edit"],
};

export const usePermissions = (userRole?: string | null) => {
  const permissions = computed(() => {
    const normalized = normalizeRole(userRole);
    if (!normalized) return [];
    return rolePermissions[normalized] ?? [];
  });

  const hasPermission = (permission: Permission): boolean => {
    return permissions.value.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((p) => hasPermission(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
