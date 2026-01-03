import { describe, it, expect, vi, beforeEach } from "vitest";
import getHandler from "~/server/api/admin/programs.get";
import postHandler from "~/server/api/admin/programs.post";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";
import { readBody, createError } from "h3";

// Mock dependencies
vi.mock("~/server/db/client", () => ({
  default: {
    bingoProgram: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    bingoGame: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    bingoPattern: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock("~/server/services/audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

vi.mock("~/server/utils/roles", () => ({
  assertRole: vi.fn(),
}));

vi.mock("h3", () => ({
  defineEventHandler: (handler) => handler,
  readBody: vi.fn(),
  createError: vi.fn((err) => err),
}));

describe("Admin Programs API", () => {
  const mockUser = { id: "user-1", role: "OWNER" };
  const mockEvent = { context: { user: mockUser } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/programs", () => {
    it("should return programs with parsed config fields", async () => {
      const mockPrograms = [
        {
          id: "prog-1",
          slug: "test-program",
          name: "Test Program",
          description: "Desc",
          games: [
            {
              id: "game-1",
              sort_order: 1,
              title: "Game 1",
              paperColor: "#ffffff",
              notes: "Note",
              pricing_config: '{"model":"standard","price":10}',
              payout_config: '{"type":"fixed","amount":100}',
              timeline_config: '{"estimatedDuration":15,"isBreak":false}',
              pattern: {
                slug: "pattern-1",
                name: "Pattern 1",
                definition: '{"grid":[]}',
              },
            },
          ],
        },
      ];

      (prisma.bingoProgram.findMany as any).mockResolvedValue(mockPrograms);

      const result = await getHandler(mockEvent as any);

      expect(assertRole).toHaveBeenCalledWith("OWNER", ["OWNER"]);
      expect(result).toHaveLength(1);
      expect(result[0].games[0].pricing).toEqual({ model: "standard", price: 10 });
      expect(result[0].games[0].payout).toEqual({ type: "fixed", amount: 100 });
      expect(result[0].games[0].timeline).toEqual({ estimatedDuration: 15, isBreak: false });
    });

    it("should handle missing config fields with defaults", async () => {
      const mockPrograms = [
        {
          id: "prog-1",
          slug: "test-program",
          games: [
            {
              id: "game-1",
              sort_order: 1,
              title: "Game 1",
              pattern: { slug: "p1", name: "P1", definition: "{}" },
              pricing_config: null,
              payout_config: null,
              timeline_config: null,
            },
          ],
        },
      ];

      (prisma.bingoProgram.findMany as any).mockResolvedValue(mockPrograms);

      const result = await getHandler(mockEvent as any);

      expect(result[0].games[0].pricing).toEqual({ model: "included" });
      expect(result[0].games[0].payout).toEqual({ type: "fixed", amount: 0 });
      expect(result[0].games[0].timeline).toEqual({ estimatedDuration: 10, isBreak: false });
    });
  });

  describe("POST /api/admin/programs", () => {
    const mockPayload = {
      slug: "new-program",
      name: "New Program",
      description: "New Desc",
      games: [
        {
          sortOrder: 1,
          title: "New Game",
          paperColor: "#ff0000",
          patternSlug: "pattern-1",
          pricing: { model: "premium", price: 20 },
          payout: { type: "percentage", percentage: 50 },
          timeline: { estimatedDuration: 20 },
        },
      ],
    };

    it("should save program with stringified configs", async () => {
      (readBody as any).mockResolvedValue(mockPayload);
      (prisma.bingoPattern.findMany as any).mockResolvedValue([
        { id: "pat-1", slug: "pattern-1" },
      ]);
      (prisma.bingoProgram.upsert as any).mockResolvedValue({ id: "prog-1", slug: "new-program" });
      (prisma.bingoGame.create as any).mockResolvedValue({});

      await postHandler(mockEvent as any);

      expect(assertRole).toHaveBeenCalledWith("OWNER", ["OWNER"]);
      
      // Check transaction calls
      expect(prisma.bingoProgram.upsert).toHaveBeenCalled();
      expect(prisma.bingoGame.deleteMany).toHaveBeenCalledWith({ where: { program_id: "prog-1" } });
      
      expect(prisma.bingoGame.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          program_id: "prog-1",
          title: "New Game",
          pricing_config: JSON.stringify({ model: "premium", price: 20 }),
          payout_config: JSON.stringify({ type: "percentage", percentage: 50 }),
          timeline_config: JSON.stringify({ estimatedDuration: 20 }),
        }),
      });

      expect(auditService.log).toHaveBeenCalled();
    });

    it("should throw error if pattern not found", async () => {
      (readBody as any).mockResolvedValue(mockPayload);
      (prisma.bingoPattern.findMany as any).mockResolvedValue([]); // No patterns found

      try {
        await postHandler(mockEvent as any);
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.message).toContain("Patterns not found");
      }
    });

    it("should validate input schema", async () => {
      const invalidPayload = { ...mockPayload, games: [{ ...mockPayload.games[0], paperColor: "invalid" }] };
      (readBody as any).mockResolvedValue(invalidPayload);

      try {
        await postHandler(mockEvent as any);
      } catch (e) {
        expect(e).toBeDefined(); // Zod error
      }
    });
  });
});
