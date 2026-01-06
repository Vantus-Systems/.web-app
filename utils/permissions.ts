import { normalizeRole, type NormalizedRole } from "./roles";

export type Permission =
  | "admin:read"
  | "admin:write"
  | "ops:read"
  | "ops:edit"
  | "ops:publish"
  | "ops:rollback"
  | "mic:read"
  | "mic:edit"
  | "mic:submit"
  | "mic:approve"
  | "mic:publish"
  | "people:read"
  | "people:edit"
  | "people:delete"
  | "people:assign_roles"
  | "owner:dashboard"
  | "owner:finance:view"
  | "owner:finance:edit"
  | "owner:approve_all"
  | "charities:read"
  | "charities:edit"
  | "charities:delete"
  | "audit:read"
  | "patterns:read"
  | "patterns:edit"
  | "programs:read"
  | "programs:edit";

const ROLE_PERMISSIONS: Record<NormalizedRole, Permission[]> = {
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
  CHARITY: ["admin:read", "charities:read", "charities:edit"],
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
};

export const hasPermission = (
  role: string | null | undefined,
  permission: Permission,
) => {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return ROLE_PERMISSIONS[normalized].includes(permission);
};
