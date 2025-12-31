import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { incidentUpdateSchema } from "~/server/schemas/micIncident.zod";

/**
 * PUT /api/admin/mic/incidents/<id> - Update incident (e.g., mark as resolved)
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["MIC", "OWNER"]);

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID required" });
  }

  const body = await readBody(event);
  const data = incidentUpdateSchema.parse(body);

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: data.status,
      description: data.description,
      resolved_at: data.status === "RESOLVED" ? new Date() : data.resolved_at,
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
