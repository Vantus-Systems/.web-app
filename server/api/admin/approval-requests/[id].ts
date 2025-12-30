import { defineEventHandler, readBody } from "h3";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const dataDir = join(process.cwd(), "server/data");

interface ApprovalRequest {
  id: string;
  userId: string;
  type: string;
  data: any;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  rejectionReason?: string;
}

async function loadApprovals(): Promise<ApprovalRequest[]> {
  try {
    const content = await readFile(join(dataDir, "approvals.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveApprovals(approvals: ApprovalRequest[]): Promise<void> {
  await writeFile(
    join(dataDir, "approvals.json"),
    JSON.stringify(approvals, null, 2),
  );
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = getRouterParam(event, "id");

  if (method === "PUT") {
    // Update approval request status
    const body = await readBody(event);
    const approvals = await loadApprovals();

    const idx = approvals.findIndex((a) => a.id === id);
    if (idx < 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Approval request not found",
      });
    }

    const approval = approvals[idx];
    approval.status = body.status;
    approval.respondedAt = new Date().toISOString();
    approval.respondedBy = body.respondedBy || "system";

    if (body.status === "rejected") {
      approval.rejectionReason = body.rejectionReason;
    }

    await saveApprovals(approvals);

    return {
      success: true,
      data: approval,
    };
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});
