import { defineEventHandler, getQuery } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

/**
 * GET /api/admin/mic/incidents?status=OPEN&shift_id=<id>
 * Get incidents filtered by status and optionally shift
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["MIC", "OWNER"]);

  const query = getQuery(event);
  const status = query.status as string | undefined;
  const shiftId = query.shift_id as string | undefined;

  const where: Record<string, any> = {};
  if (status) {
    where.status = status;
  }
  if (shiftId) {
    where.shift_id = shiftId;
  }

  const incidents = await prisma.incident.findMany({
    where,
    include: {
      reported_by: {
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return incidents.map((incident) => ({
    id: incident.id,
    shift_id: incident.shift_id,
    reported_by_user_id: incident.reported_by_user_id,
    type: incident.type,
    description: incident.description,
    status: incident.status,
    created_at: incident.created_at.toISOString(),
    resolved_at: incident.resolved_at?.toISOString() || null,
    reported_by: incident.reported_by,
  }));
});
