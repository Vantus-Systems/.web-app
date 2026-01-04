import { normalizeRole, type NormalizedRole } from "./roles";

export type Permission =
  | "ops:edit"
  | "ops:publish"
  | "ops:rollback"
  | "charities:read"
  | "charities:edit";

const ROLE_PERMISSIONS: Record<NormalizedRole, Permission[]> = {
  OWNER: [
    "ops:edit",
    "ops:publish",
    "ops:rollback",
    "charities:read",
    "charities:edit",
  ],
  CHARITY: ["charities:read"],
  MIC: ["charities:read"],
};

export const hasPermission = (
  role: string | null | undefined,
  permission: Permission,
) => {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return ROLE_PERMISSIONS[normalized].includes(permission);
};
