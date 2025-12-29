import { createError } from "h3";
import { hasRole, normalizeRole, type NormalizedRole } from "~/utils/roles";

export const assertRole = (
  role: string | null | undefined,
  allowed: NormalizedRole[],
) => {
  if (!hasRole(role, allowed)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  return normalizeRole(role) as NormalizedRole;
};
