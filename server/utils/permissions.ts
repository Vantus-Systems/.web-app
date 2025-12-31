/**
 * Enhanced RBAC Permission System
 * Provides granular permission control beyond simple role checks
 */

import { createError } from "h3";
import type { NormalizedRole } from "~/utils/roles";
import { normalizeRole } from "~/utils/roles";

export type Permission =
  // Admin read/write
  | "admin:read"
  | "admin:write"
  // Operations
  | "ops:read"
  | "ops:edit"
  | "ops:publish"
  | "ops:rollback"
  // MIC/Shifts
  | "mic:read"
  | "mic:edit"
  | "mic:submit"
  | "mic:approve"
  | "mic:publish"
  // People management
  | "people:read"
  | "people:edit"
  | "people:delete"
  | "people:assign_roles"
  // Owner/Finance
  | "owner:dashboard"
  | "owner:finance:view"
  | "owner:finance:edit"
  | "owner:approve_all"
  // Charities
  | "charities:read"
  | "charities:edit"
  | "charities:delete"
  // Audit
  | "audit:read"
  // Patterns & Programs
  | "patterns:read"
  | "patterns:edit"
  | "programs:read"
  | "programs:edit";

/**
 * Role-to-permission mapping
 */
const rolePermissions: Record<NormalizedRole, Permission[]> = {
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

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (
  role: string | null | undefined,
  permission: Permission,
): boolean => {
  const normalized = normalizeRole(role);
  if (!normalized) return false;

  return rolePermissions[normalized]?.includes(permission) ?? false;
};

/**
 * Check if a role has ANY of the specified permissions
 */
export const hasAnyPermission = (
  role: string | null | undefined,
  permissions: Permission[],
): boolean => {
  return permissions.some((p) => hasPermission(role, p));
};

/**
 * Check if a role has ALL of the specified permissions
 */
export const hasAllPermissions = (
  role: string | null | undefined,
  permissions: Permission[],
): boolean => {
  return permissions.every((p) => hasPermission(role, p));
};

/**
 * Assert a role has a specific permission, throw 403 if not
 */
export const assertPermission = (
  role: string | null | undefined,
  permission: Permission,
): void => {
  if (!hasPermission(role, permission)) {
    throw createError({
      statusCode: 403,
      message: `Permission denied: ${permission}`,
    });
  }
};

/**
 * Assert a role has ANY of the specified permissions, throw 403 if none match
 */
export const assertAnyPermission = (
  role: string | null | undefined,
  permissions: Permission[],
): void => {
  if (!hasAnyPermission(role, permissions)) {
    throw createError({
      statusCode: 403,
      message: `Permission denied. Required: ${permissions.join(" OR ")}`,
    });
  }
};

/**
 * Get all permissions for a role
 */
export const getPermissions = (
  role: string | null | undefined,
): Permission[] => {
  const normalized = normalizeRole(role);
  if (!normalized) return [];
  return rolePermissions[normalized] ?? [];
};
