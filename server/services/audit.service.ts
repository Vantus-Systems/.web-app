import prisma from "@server/db/client";

export const auditService = {
  log(data: {
    actorUserId?: string;
    action: string;
    entity: string;
    before?: any;
    after?: any;
  }) {
    return prisma.auditLog.create({
      data: {
        actor_user_id: data.actorUserId,
        action: data.action,
        entity: data.entity,
        before: data.before,
        after: data.after,
      },
    });
  },
};
