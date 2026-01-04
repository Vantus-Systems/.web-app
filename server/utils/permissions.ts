import { createError } from "h3";
import { hasPermission, type Permission } from "~/utils/permissions";

export const assertPermission = (
  role: string | null | undefined,
  permission: Permission,
) => {
  if (!hasPermission(role, permission)) {
    throw createError({
      statusCode: 403,
      message: `Forbidden: Missing permission ${permission}`,
    });
  }
};

export const assertAnyPermission = (
  role: string | null | undefined,
  permissions: Permission[],
) => {
  if (!permissions.some((p) => hasPermission(role, p))) {
    throw createError({
      statusCode: 403,
      message: `Forbidden: Missing any of permissions ${permissions.join(", ")}`,
    });
  }
};
