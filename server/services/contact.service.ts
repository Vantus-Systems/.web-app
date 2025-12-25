import prisma from "@server/db/client";
import { auditService } from "@server/services/audit.service";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export const contactService = {
  create(data: { name: string; email: string; message: string }) {
    const validated = contactSchema.parse(data);
    return prisma.contactMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        message: validated.message,
      },
    });
  },

  list() {
    return prisma.contactMessage.findMany({
      orderBy: { created_at: "desc" },
    });
  },

  async updateStatus(id: string, status: string, actorUserId: string) {
    const before = await prisma.contactMessage.findUnique({ where: { id } });
    if (!before) throw new Error("Message not found");

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    await auditService.log({
      actorUserId,
      action: "UPDATE_STATUS",
      entity: `contact_message:${id}`,
      before: { status: before.status },
      after: { status },
    });

    return updated;
  },
};
