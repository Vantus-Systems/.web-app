import { defineEventHandler, getQuery, createError } from "h3";
import { z } from "zod";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

// Validate slug parameter
const slugSchema = z.string().min(1).max(255);

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const query = getQuery(event);
  let slug: string;

  try {
    slug = slugSchema.parse(query.slug);
  } catch (validationError: any) {
    throw createError({
      statusCode: 400,
      message: "Invalid slug parameter",
      data: {
        errors: validationError.errors?.map((e: any) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
    });
  }

  // Fetch program with full data for audit trail
  const program = await prisma.bingoProgram.findUnique({
    where: { slug },
    include: { games: true },
  });

  if (!program) {
    throw createError({
      statusCode: 404,
      message: "Program not found",
    });
  }

  // Object-level authorization: Ensure user has permission to delete
  // In a multi-tenant scenario, check if the program belongs to user's business
  // For now, OWNER role is sufficient, but this can be expanded
  // Example: if (!program.business_id || program.business_id !== event.context.user?.business_id) { throw ... }

  // Delete the program (cascades to games due to schema)
  await prisma.bingoProgram.delete({
    where: { slug },
  });

  // Audit log the deletion with full program data
  await auditService.log({
    actorUserId: event.context.user.id,
    action: "DELETE_PROGRAM",
    entity: `bingoProgram:${slug}`,
    before: program,
    after: null,
  });

  return {
    success: true,
    message: `Program "${program.name}" deleted successfully`,
  };
});
