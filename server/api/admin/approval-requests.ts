import { defineEventHandler, readBody, getQuery } from "h3";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const dataDir = join(process.cwd(), "server/data");

interface ApprovalRequest {
  id: string;
  userId: string;
  type: "shift" | "schema" | "pricing";
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

  if (method === "GET") {
    // Get all approval requests with optional filtering
    const query = getQuery(event);
    const status = query.status as string | undefined;
    const type = query.type as string | undefined;

    const approvals = await loadApprovals();
    let filtered = approvals;

    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (type) {
      filtered = filtered.filter((a) => a.type === type);
    }

    return {
      success: true,
      data: filtered,
    };
  }

  if (method === "POST") {
    // Create new approval request
    const body = await readBody(event);
    const approvals = await loadApprovals();

    const newRequest: ApprovalRequest = {
      id: `req-${Date.now()}`,
      userId: body.userId,
      type: body.type,
      data: body.data,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    approvals.push(newRequest);
    await saveApprovals(approvals);

    return {
      success: true,
      data: newRequest,
    };
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});
