import { describe, it, expect, vi, beforeEach } from "vitest";

// Import handler after mocking
import handlerModule from "../server/api/jackpot.get";
import { settingsService } from "../server/services/settings.service";

// Mock settingsService before importing the handler
vi.mock("../server/services/settings.service", () => ({
  settingsService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe("/api/jackpot GET handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns default structure when no data present", async () => {
    (settingsService.get as any).mockResolvedValue(null);
    const result = await (handlerModule as any)({} as any);

    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(settingsService.set as any).not.toHaveBeenCalled();
  });

  it("migrates legacy object structure (babes/hornet) to items and persists", async () => {
    const legacy = {
      babes: { current: 111, backup: 0 },
      hornet: { current: 222, backup: 0 },
      lastUpdated: "2020-01-01T00:00:00.000Z",
    };
    (settingsService.get as any).mockResolvedValue(legacy);

    const result = await (handlerModule as any)({} as any);

    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBe(2);
    expect(result.items[0].current).toBe(111);
    expect(result.items[1].current).toBe(222);

    // Should have created babes/hornet shortcuts
    expect(result.babes?.current).toBe(111);
    expect(result.hornet?.current).toBe(222);

    // Persist called because migration happened
    expect(settingsService.set as any).toHaveBeenCalled();
  });

  it("keeps existing items structure and adds legacy shortcuts", async () => {
    const existing = {
      items: [
        { id: "a", label: "Bingo Babes Progressive", current: 500 },
        { id: "b", label: "Hornet Progressive", current: 750 },
      ],
      lastUpdated: "2025-01-01T00:00:00.000Z",
    };
    (settingsService.get as any).mockResolvedValue(existing);

    const result = await (handlerModule as any)({} as any);

    expect(result.items).toBeDefined();
    expect(result.items[0].id).toBe("a");
    expect(result.babes?.current).toBe(500);
    expect(result.hornet?.current).toBe(750);

    // No migration needed, but ensure we didn't overwrite unexpectedly
  });
});
