import { describe, it, expect, vi, beforeEach } from "vitest";
import { readBody, getQuery } from "h3";
import deleteHandler from "~/server/api/admin/programs.delete";
import postHandler from "~/server/api/admin/programs.post";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

// Mock dependencies
vi.mock("~/server/db/client", () => ({
  default: {
    bingoProgram: {
      findUnique: vi.fn(),
      delete: vi.fn(),
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
  getQuery: vi.fn(),
  createError: vi.fn((err) => err),
}));

describe("Admin Programs Security & DELETE API", () => {
  const mockUser = { id: "user-1", role: "OWNER" };
  const mockEvent = { context: { user: mockUser } };

  beforeEach(() => {
    vi.clearAllMocks();
    (assertRole as any).mockImplementation(() => {}); // Default success
  });

  describe("Authorization Enforcement", () => {
    it("should fail if assertRole throws an error (Simulating non-OWNER access)", async () => {
      // Simulate assertRole throwing an error (as it would for non-OWNER)
      (assertRole as any).mockImplementation(() => {
        throw new Error("Insufficient permissions");
      });

      // Test DELETE
      (getQuery as any).mockReturnValue({ slug: "test-program" });
      await expect(deleteHandler(mockEvent as any)).rejects.toThrow("Insufficient permissions");

      // Test POST
      (readBody as any).mockResolvedValue({});
      await expect(postHandler(mockEvent as any)).rejects.toThrow("Insufficient permissions");
    });
  });

  describe("DELETE /api/admin/programs", () => {
    it("should delete program successfully and log audit", async () => {
      const mockProgram = {
        id: "prog-1",
        slug: "test-program",
        name: "Test Program",
        games: [],
      };

      (getQuery as any).mockReturnValue({ slug: "test-program" });
      (prisma.bingoProgram.findUnique as any).mockResolvedValue(mockProgram);
      (prisma.bingoProgram.delete as any).mockResolvedValue(mockProgram);

      const result = await deleteHandler(mockEvent as any);

      expect(assertRole).toHaveBeenCalledWith("OWNER", ["OWNER"]);
      expect(prisma.bingoProgram.findUnique).toHaveBeenCalledWith({
        where: { slug: "test-program" },
        include: { games: true },
      });
      expect(prisma.bingoProgram.delete).toHaveBeenCalledWith({
        where: { slug: "test-program" },
      });
      expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
        action: "DELETE_PROGRAM",
        entity: "bingoProgram:test-program",
        before: mockProgram,
        after: null,
      }));
      expect(result.success).toBe(true);
    });

    it("should throw 404 if program not found", async () => {
      (getQuery as any).mockReturnValue({ slug: "non-existent" });
      (prisma.bingoProgram.findUnique as any).mockResolvedValue(null);

      try {
        await deleteHandler(mockEvent as any);
      } catch (e: any) {
        expect(e.statusCode).toBe(404);
        expect(e.message).toBe("Program not found");
      }
    });

    it("should throw 400 if slug is invalid", async () => {
      (getQuery as any).mockReturnValue({ slug: "" }); // Invalid empty slug

      try {
        await deleteHandler(mockEvent as any);
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.message).toBe("Invalid slug parameter");
      }
    });
  });

  describe("Input Sanitization / XSS Checks", () => {
    it("should allow storing special characters (XSS payloads) but validated by schema", async () => {
      // The API relies on Schema validation. 
      // It should NOT strip special chars blindly, but store them. 
      // Frontend is responsible for escaping.
      // However, we want to ensure basic strings are allowed.
      
      const payloadWithXSS = {
        slug: "xss-test",
        name: "<script>alert('xss')</script>",
        description: "<b>Bold</b>",
        games: [],
      };

      (readBody as any).mockResolvedValue(payloadWithXSS);
      (prisma.bingoPattern.findMany as any).mockResolvedValue([]);
      (prisma.bingoProgram.upsert as any).mockResolvedValue({ slug: "xss-test" });

      await postHandler(mockEvent as any);

      // Verify that the data passed to DB includes the tags (it's not sanitized at API level)
      // This is expected behavior for modern apps where frontend handles escaping.
      // We just want to confirm the API doesn't crash or behave unexpectedly.
      expect(prisma.bingoProgram.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({
          name: "<script>alert('xss')</script>",
        }),
      }));
    });
  });
});
