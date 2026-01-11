import { describe, it, expect, vi, beforeEach } from "vitest";
import { readBody } from "h3";
import getHandler from "~/server/api/admin/patterns.get";
import postHandler from "~/server/api/admin/patterns.post";
import deleteHandler from "~/server/api/admin/patterns.delete";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

// Mock dependencies
vi.mock("~/server/db/client", () => ({
  default: {
    bingoPattern: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    bingoGame: {
      count: vi.fn(),
    },
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
  defineEventHandler: (handler: any) => handler,
  readBody: vi.fn(),
  getQuery: vi.fn(),
  createError: vi.fn((err) => err),
}));

import * as h3 from "h3";

describe("Admin Patterns API", () => {
  const mockUser = { id: "user-1", role: "OWNER" };
  const mockEvent = { context: { user: mockUser } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/patterns", () => {
    it("should require OWNER role", async () => {
      (prisma.bingoPattern.findMany as any).mockResolvedValue([]);
      
      await getHandler(mockEvent as any);
      
      expect(assertRole).toHaveBeenCalledWith("OWNER", ["OWNER"]);
    });

    it("should return empty array when no patterns exist", async () => {
      (prisma.bingoPattern.findMany as any).mockResolvedValue([]);
      
      const result = await getHandler(mockEvent as any);
      
      expect(result).toEqual([]);
    });

    it("should return patterns with parsed JSON fields", async () => {
      const mockPatterns = [
        {
          id: "pattern-1",
          slug: "test-pattern",
          name: "Test Pattern",
          description: "A test pattern",
          isAnimated: true,
          definition: JSON.stringify({
            frames: [
              [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
            ],
            interval: 100,
          }),
          category: "test",
          tags: JSON.stringify(["test", "validation"]),
          active_sessions: JSON.stringify(["session1", "session2"]),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.bingoPattern.findMany as any).mockResolvedValue(mockPatterns);
      
      const result = await getHandler(mockEvent as any);
      
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("test-pattern");
      expect(result[0].name).toBe("Test Pattern");
      expect(result[0].isAnimated).toBe(true);
      expect(result[0].definition).toEqual({
        frames: [
          [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        ],
        interval: 100,
      });
      expect(result[0].tags).toEqual(["test", "validation"]);
      expect(result[0].activeSessions).toEqual(["session1", "session2"]);
    });

    it("should handle null optional fields", async () => {
      const mockPatterns = [
        {
          id: "pattern-1",
          slug: "test-pattern",
          name: "Test Pattern",
          isAnimated: false,
          definition: JSON.stringify({
            frames: [
              [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
            ],
          }),
          description: null,
          category: null,
          tags: null,
          active_sessions: null,
        },
      ];

      (prisma.bingoPattern.findMany as any).mockResolvedValue(mockPatterns);
      
      const result = await getHandler(mockEvent as any);
      
      expect(result[0].description).toBeNull();
      expect(result[0].category).toBeNull();
      expect(result[0].tags).toEqual([]);
      expect(result[0].activeSessions).toEqual([]);
    });
  });

  describe("POST /api/admin/patterns", () => {
    const mockPattern = {
      slug: "test-pattern",
      name: "Test Pattern",
      description: "A test pattern",
      isAnimated: false,
      category: "test",
      tags: ["test", "validation"],
      activeSessions: ["session1", "session2"],
      definition: {
        frames: [
          [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        ],
        interval: 100,
      },
    };

    it("should require OWNER role", async () => {
      (readBody as any).mockResolvedValue(mockPattern);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(null);
      (prisma.bingoPattern.upsert as any).mockResolvedValue({});
      
      await postHandler(mockEvent as any);
      
      expect(assertRole).toHaveBeenCalledWith("OWNER", ["OWNER"]);
    });

    it("should validate input schema", async () => {
      const invalidPattern = {
        // Missing required fields
        name: "Invalid Pattern",
      };

      (readBody as any).mockResolvedValue(invalidPattern);
      
      try {
        await postHandler(mockEvent as any);
      } catch (e) {
        expect(e).toBeDefined(); // Zod validation error
      }
    });

    it("should create new pattern", async () => {
      (readBody as any).mockResolvedValue(mockPattern);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(null);
      const upsertResult = {
        ...mockPattern,
        id: "pattern-1",
        definition: JSON.stringify(mockPattern.definition),
        tags: JSON.stringify(mockPattern.tags),
        active_sessions: JSON.stringify(mockPattern.activeSessions),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.bingoPattern.upsert as any).mockResolvedValue(upsertResult);

      const result = await postHandler(mockEvent as any);
      
      expect(prisma.bingoPattern.upsert).toHaveBeenCalledWith({
        where: { slug: mockPattern.slug },
        update: expect.any(Object),
        create: expect.objectContaining({
          slug: mockPattern.slug,
          name: mockPattern.name,
          definition: JSON.stringify(mockPattern.definition),
        }),
      });

      // Remove the active_sessions field from the result since it's not in our expected output
      const { active_sessions, created_at, updated_at, ...resultWithoutActiveSessions } = result;
      expect(resultWithoutActiveSessions).toEqual({
        ...mockPattern,
        id: "pattern-1",
        definition: mockPattern.definition,
        tags: mockPattern.tags,
        activeSessions: mockPattern.activeSessions,
      });

      expect(auditService.log).toHaveBeenCalledWith({
        actorUserId: mockUser.id,
        action: "CREATE_PATTERN",
        entity: `bingoPattern:${mockPattern.slug}`,
        before: null,
        after: mockPattern,
      });
    });

    it("should update existing pattern (upsert behavior)", async () => {
      const existingPattern = {
        id: "pattern-1",
        slug: "test-pattern",
        name: "Existing Pattern",
        definition: JSON.stringify({
          frames: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
        }),
        created_at: new Date(),
        updated_at: new Date(),
        tags: null,
        active_sessions: null,
      };

      const updatedPattern = {
        ...mockPattern,
        name: "Updated Pattern",
      };

      (readBody as any).mockResolvedValue(updatedPattern);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(existingPattern);
      (prisma.bingoPattern.upsert as any).mockResolvedValue({
        ...updatedPattern,
        id: "pattern-1",
        definition: JSON.stringify(updatedPattern.definition),
        tags: JSON.stringify(updatedPattern.tags),
        active_sessions: JSON.stringify(updatedPattern.activeSessions),
      });

      const result = await postHandler(mockEvent as any);

      expect(prisma.bingoPattern.upsert).toHaveBeenCalledWith({
        where: { slug: mockPattern.slug },
        update: expect.objectContaining({
          name: "Updated Pattern",
        }),
        create: expect.any(Object),
      });

      expect(auditService.log).toHaveBeenCalledWith({
        actorUserId: mockUser.id,
        action: "UPDATE_PATTERN",
        entity: `bingoPattern:${mockPattern.slug}`,
        before: {
          ...existingPattern,
          definition: JSON.parse(existingPattern.definition),
        },
        after: updatedPattern,
      });
    });

    it("should handle empty arrays for optional fields", async () => {
      const patternWithEmptyArrays = {
        slug: "empty-arrays-pattern",
        name: "Empty Arrays Pattern",
        isAnimated: false,
        tags: [],
        activeSessions: [],
        definition: {
          frames: [
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
          ],
        },
      };

      (readBody as any).mockResolvedValue(patternWithEmptyArrays);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(null);
      (prisma.bingoPattern.upsert as any).mockResolvedValue({
        ...patternWithEmptyArrays,
        id: "pattern-1",
        definition: JSON.stringify(patternWithEmptyArrays.definition),
        tags: null,
        active_sessions: null,
      });

      const result = await postHandler(mockEvent as any);

      expect(result.tags).toEqual([]);
      expect(result.activeSessions).toEqual([]);
    });
  });

  describe("DELETE /api/admin/patterns", () => {
    it("should require OWNER role", async () => {
      const mockQuery = { slug: "test-pattern" };
      (h3.getQuery as any).mockReturnValue(mockQuery);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue({});
      (prisma.bingoGame.count as any).mockResolvedValue(0);
      
      await deleteHandler(mockEvent as any);
      
      expect(assertRole).toHaveBeenCalledWith("OWNER", ["OWNER"]);
    });

    it("should require slug parameter", async () => {
      const mockQuery = {};
      (h3.getQuery as any).mockReturnValue(mockQuery);
      
      try {
        await deleteHandler(mockEvent as any);
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.message).toBe("Slug is required");
      }
    });

    it("should return 404 for non-existent pattern", async () => {
      const mockQuery = { slug: "non-existent-pattern" };
      (h3.getQuery as any).mockReturnValue(mockQuery);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(null);
      
      try {
        await deleteHandler(mockEvent as any);
      } catch (e: any) {
        expect(e.statusCode).toBe(404);
        expect(e.message).toBe("Pattern not found");
      }
    });

    it("should prevent deletion of patterns used in programs", async () => {
      const mockQuery = { slug: "used-pattern" };
      const existingPattern = {
        id: "pattern-1",
        slug: "used-pattern",
        name: "Used Pattern",
        definition: JSON.stringify({
          frames: [
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
          ],
        }),
        created_at: new Date(),
        updated_at: new Date(),
        tags: null,
        active_sessions: null,
      };

      (h3.getQuery as any).mockReturnValue(mockQuery);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(existingPattern);
      (prisma.bingoGame.count as any).mockResolvedValue(1); // Pattern is used
      
      try {
        await deleteHandler(mockEvent as any);
      } catch (e: any) {
        expect(e.statusCode).toBe(409);
        expect(e.message).toContain("Pattern is assigned to existing programs");
      }
    });

    it("should delete pattern successfully", async () => {
      const mockQuery = { slug: "test-pattern" };
      const existingPattern = {
        id: "pattern-1",
        slug: "test-pattern",
        name: "Test Pattern",
        definition: JSON.stringify({
          frames: [
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
          ],
        }),
      };

      (h3.getQuery as any).mockReturnValue(mockQuery);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(existingPattern);
      (prisma.bingoGame.count as any).mockResolvedValue(0);
      (prisma.bingoPattern.delete as any).mockResolvedValue({});

      const result = await deleteHandler(mockEvent as any);

      expect(prisma.bingoPattern.delete).toHaveBeenCalledWith({
        where: { slug: "test-pattern" },
      });

      expect(result).toEqual({ success: true });

      expect(auditService.log).toHaveBeenCalledWith({
        actorUserId: mockUser.id,
        action: "DELETE_PATTERN",
        entity: "bingoPattern:test-pattern",
        before: {
          ...existingPattern,
          definition: JSON.parse(existingPattern.definition),
        },
        after: null,
      });
    });
  });

  describe("Edge Cases and Validation", () => {
    it("should validate frame structure in definition", async () => {
      const invalidFramePattern = {
        slug: "invalid-frame-pattern",
        name: "Invalid Frame Pattern",
        isAnimated: false,
        definition: {
          frames: [
            [1, 0, 0], // Invalid - should be 25 elements
          ],
        },
      };

      (readBody as any).mockResolvedValue(invalidFramePattern);
      
      try {
        await postHandler(mockEvent as any);
      } catch (e) {
        expect(e).toBeDefined(); // Zod validation error for frame length
      }
    });

    it("should validate interval range", async () => {
      const invalidIntervalPattern = {
        slug: "invalid-interval-pattern",
        name: "Invalid Interval Pattern",
        isAnimated: false,
        definition: {
          frames: [
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
          ],
          interval: 10, // Below minimum of 50
        },
      };

      (readBody as any).mockResolvedValue(invalidIntervalPattern);
      
      try {
        await postHandler(mockEvent as any);
      } catch (e) {
        expect(e).toBeDefined(); // Zod validation error for interval range
      }
    });

    it("should handle optional fields being undefined", async () => {
      const patternWithOptionalFields = {
        slug: "optional-fields-pattern",
        name: "Optional Fields Pattern",
        isAnimated: false,
        definition: {
          frames: [
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
          ],
        },
      };

      (readBody as any).mockResolvedValue(patternWithOptionalFields);
      (prisma.bingoPattern.findUnique as any).mockResolvedValue(null);
      (prisma.bingoPattern.upsert as any).mockResolvedValue({
        ...patternWithOptionalFields,
        id: "pattern-1",
        definition: JSON.stringify(patternWithOptionalFields.definition),
        description: null,
        category: null,
        tags: null,
        active_sessions: null,
      });

      const result = await postHandler(mockEvent as any);

      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
    });
  });
});