/**
 * GET /api/admin/audit-logs
 * Retrieve recent audit logs with filtering
 */

import { defineEventHandler, getQuery } from "h3";
import prisma from "@server/db/client";
import { assertPermission } from "@server/utils/permissions";

export default defineEventHandler(async (event) => {
  assertPermission(event.context.user?.role, "audit:read");

  const query = getQuery(event);
  const limit = Math.min(parseInt(query.limit as string) || 50, 200);
  const offset = parseInt(query.offset as string) || 0;
  const entity = query.entity as string | undefined;
  const action = query.action as string | undefined;
  const actorUserId = query.actorUserId as string | undefined;

  const where: any = {};
  if (entity) {
    where.entity = { contains: entity };
  }
  if (action) {
    where.action = action;
  }
  if (actorUserId) {
    where.actor_user_id = actorUserId;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      actor: log.actor
        ? {
            id: log.actor.id,
            username: log.actor.username,
            name: [log.actor.first_name, log.actor.last_name]
              .filter(Boolean)
              .join(" "),
            role: log.actor.role,
          }
        : null,
      before: log.before ? JSON.parse(log.before) : null,
      after: log.after ? JSON.parse(log.after) : null,
      createdAt: log.created_at.toISOString(),
    })),
    total,
    limit,
    offset,
  };
});
