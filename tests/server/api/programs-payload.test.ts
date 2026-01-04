import { describe, it, expect, vi, beforeEach } from "vitest";
import { readBody } from "h3";
import postHandler from "../../../server/api/admin/programs.post";
import { assertRole } from "../../../server/utils/roles";
import prisma from "../../../server/db/client";

vi.mock("h3", async () => {
  const actual = await vi.importActual("h3");
  return {
    ...actual,
    readBody: vi.fn(),
  };
});

vi.mock("../../../server/utils/roles");
vi.mock("../../../server/db/client", () => ({
  default: {
    bingoPattern: {
      findMany: vi.fn(),
    },
    bingoProgram: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    bingoGame: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Programs POST Payload Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (assertRole as any).mockImplementation(() => {});
    (prisma.bingoPattern.findMany as any).mockResolvedValue([
      { slug: "test-pattern" },
    ]);
    (prisma.bingoProgram.findUnique as any).mockResolvedValue(null);
    (prisma.$transaction as any).mockImplementation((cb: any) => cb(prisma));
    (prisma.bingoProgram.upsert as any).mockResolvedValue({ id: 1 });
    (prisma.bingoGame.deleteMany as any).mockResolvedValue({});
    (prisma.bingoGame.create as any).mockResolvedValue({});
    (prisma.auditLog.create as any).mockResolvedValue({});
  });

  it("should succeed (robustness) even when extra fields are present (backend now allows it)", async () => {
    const event = { context: { user: { role: "OWNER" } } };

    // Simulate body with extra fields
    const body = {
      slug: "test-program",
      name: "Test Program",
      games: [
        {
          sortOrder: 1,
          title: "Game 1",
          paperColor: "#ffffff",
          notes: "",
          patternSlug: "test-pattern",
          pricing: { model: "included" },
          payout: { type: "fixed", amount: 100 },
          timeline: { estimatedDuration: 10, isBreak: false },
          // Extra fields - should be ignored now
          id: 123,
          pattern: { name: "Pattern 1" },
        },
      ],
    };

    (readBody as any).mockResolvedValue(body);

    await expect(postHandler(event as any)).resolves.not.toThrow();
  });

  it("should succeed when payload is clean", async () => {
    const event = { context: { user: { role: "OWNER" } } };

    // Clean body
    const body = {
      slug: "test-program",
      name: "Test Program",
      games: [
        {
          sortOrder: 1,
          title: "Game 1",
          paperColor: "#ffffff",
          notes: "",
          patternSlug: "test-pattern",
          pricing: { model: "included" },
          payout: { type: "fixed", amount: 100 },
          timeline: { estimatedDuration: 10, isBreak: false },
        },
      ],
    };

    (readBody as any).mockResolvedValue(body);

    await expect(postHandler(event as any)).resolves.not.toThrow();
  });
});
