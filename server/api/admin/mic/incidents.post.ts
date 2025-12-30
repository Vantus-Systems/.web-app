import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { incidentCreateSchema } from "~/server/schemas/micIncident.zod";

/**
 * POST /api/admin/mic/incidents - Create a new incident
 * Can be reported by MIC or OWNER
 * Linked to current shift if shift_id provided
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["MIC", "OWNER"]);

  const body = await readBody(event);
  const data = incidentCreateSchema.parse(body);

  const incident = await prisma.incident.create({
    data: {
      shift_id: data.shift_id || null,
      reported_by_user_id: event.context.user.id,
      type: data.type,
      description: data.description,
      status: "OPEN",
    },
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
  });

  return {
    id: incident.id,
    shift_id: incident.shift_id,
    reported_by_user_id: incident.reported_by_user_id,
    type: incident.type,
    description: incident.description,
    status: incident.status,
    created_at: incident.created_at.toISOString(),
    resolved_at: incident.resolved_at?.toISOString() || null,
    reported_by: incident.reported_by,
  };
});
