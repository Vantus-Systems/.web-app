import { describe, it, expect, vi } from "vitest";
import indexHandler from "~/server/api/programs/index.get.ts";
import slugHandler from "~/server/api/programs/[slug].get.ts";

// Mock prisma client used by server handlers
vi.mock("~/server/db/client", () => {
  return {
    default: {
      bingoProgram: {
        findMany: vi.fn(async () => [
          {
            slug: "evening-session",
            name: "Evening Session",
            description: "Fun and prizes",
            _count: { games: 10 },
          },
        ]),
        findUnique: vi.fn(async ({ where: { slug } }: any) => {
          if (slug === "not-found") return null;
          return {
            slug,
            name: "Evening Session",
            description: "Fun and prizes",
            games: [
              {
                sort_order: 1,
                title: "Game 1",
                paperColor: "Blue",
                notes: "",
                pattern: {
                  slug: "x-pattern",
                  name: "X Pattern",
                  description: "Cross shape",
                  isAnimated: false,
                  definition: JSON.stringify([[1]]),
                },
              },
            ],
          };
        }),
      },
    },
  };
});

function makeEvent(params: Record<string, string> = {}) {
  return { context: { params } } as any;
}

describe("Programs API", () => {
  it("index.get returns program summary", async () => {
    const result = await (indexHandler as any)(makeEvent());
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({
      slug: "evening-session",
      name: "Evening Session",
      description: "Fun and prizes",
      gameCount: 10,
    });
  });

  it("[slug].get returns program details", async () => {
    const result = await (slugHandler as any)(makeEvent({ slug: "evening-session" }));
    expect(result).toMatchObject({
      slug: "evening-session",
      name: "Evening Session",
    });
    expect(Array.isArray(result.games)).toBe(true);
    expect(result.games[0]).toMatchObject({ sortOrder: 1, title: "Game 1" });
    expect(result.games[0].pattern).toMatchObject({ name: "X Pattern" });
  });

  it("[slug].get 404 when missing", async () => {
    try {
      await (slugHandler as any)(makeEvent({ slug: "not-found" }));
      // Should not reach here
      expect(false).toBe(true);
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }
  });
});
