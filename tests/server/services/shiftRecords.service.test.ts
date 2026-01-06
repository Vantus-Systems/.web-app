import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeShiftTotals } from "~/server/services/shiftRecords.service";
import prisma from "~/server/db/client";

// Mock Prisma
vi.mock("~/server/db/client", () => ({
  default: {
    shiftRecord: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock h3 createError
vi.mock("h3", () => ({
  createError: (err: any) => err,
}));

describe("Shift Records Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("computeShiftTotals", () => {
    it("should calculate totals for a standard normal shift with balanced box", async () => {
      const input = {
        date: "2023-01-01",
        shift: "AM" as const,
        pulltabs_total: 1000,
        deposit_total: 1500,
        workflow_type: "NORMAL" as const,
        beginning_box: 4000,
        ending_box: 4000,
      };

      const result = await computeShiftTotals(input);

      // Deposit (1500) - Pulltabs (1000) = Bingo Deposited (500)
      // Box Delta = 0
      // Bingo Actual = 500 + 0 = 500
      expect(result.depositTotal).toBe(1500);
      expect(result.bingoTotal).toBe(500);
      expect(result.bingoActual).toBe(500);
      expect(result.depositActual).toBe(1500);
    });

    it("should calculate totals when box is short (Normal workflow)", async () => {
      const input = {
        date: "2023-01-01",
        shift: "AM" as const,
        pulltabs_total: 1000,
        deposit_total: 1500,
        workflow_type: "NORMAL" as const,
        beginning_box: 4000,
        ending_box: 3900,
      };

      const result = await computeShiftTotals(input);

      // Deposit (1500) - Pulltabs (1000) = Bingo Deposited (500)
      // Box Delta = -100
      // Bingo Actual = 500 + (-100) = 400
      // Deposit Actual = 1500 + (-100) = 1400
      // Bingo Total (for records) stays as deposited (500) for NORMAL workflow
      expect(result.depositTotal).toBe(1500);
      expect(result.bingoTotal).toBe(500);
      expect(result.bingoActual).toBe(400);
      expect(result.depositActual).toBe(1400);
    });

    it("should handle NEGATIVE_BINGO_BOX workflow correctly", async () => {
      const input = {
        date: "2023-01-01",
        shift: "AM" as const,
        pulltabs_total: 1000,
        deposit_total: 1000, // No bingo deposit
        workflow_type: "NEGATIVE_BINGO_BOX" as const,
        beginning_box: 4000,
        ending_box: 3500,
      };

      const result = await computeShiftTotals(input);

      // Deposit (1000) - Pulltabs (1000) = Bingo Deposited (0)
      // Box Delta = -500
      // Bingo Actual = 0 + (-500) = -500
      // Bingo Total for NEGATIVE_BINGO_BOX is set to Box Delta (-500)
      expect(result.depositTotal).toBe(1000);
      expect(result.bingoTotal).toBe(-500);
      expect(result.bingoActual).toBe(-500);
    });

    it("should default deposit_total to pulltabs_total if missing", async () => {
      const input = {
        date: "2023-01-01",
        shift: "AM" as const,
        pulltabs_total: 1200,
        workflow_type: "NORMAL" as const,
        beginning_box: 4000,
        ending_box: 4000,
      };

      const result = await computeShiftTotals(input);

      expect(result.depositTotal).toBe(1200);
      expect(result.bingoTotal).toBe(0);
    });

    it("should throw error if ending box exceeds 4000", async () => {
      const input = {
        date: "2023-01-01",
        shift: "AM" as const,
        pulltabs_total: 1000,
        workflow_type: "NORMAL" as const,
        ending_box: 4001,
      };

      await expect(computeShiftTotals(input)).rejects.toMatchObject({
        statusCode: 400,
        message: "Ending box cannot exceed 4000.",
      });
    });

    it("should use previous shift ending box for recuperation if current start missing", async () => {
      // Mock previous shift finding
      (prisma.shiftRecord.findFirst as any).mockResolvedValue({
        id: "prev-1",
        ending_box: 3800,
      });

      const input = {
        date: "2023-01-01",
        shift: "AM" as const,
        pulltabs_total: 1000,
        workflow_type: "RECUPERATION_BOX_RETURN" as const,
        // beginning_box missing
        ending_box: 4000,
      };

      const result = await computeShiftTotals(input);

      // Should pick up 3800 from prev shift
      expect(result.beginningBox).toBe(3800);
      // Box Delta = 4000 - 3800 = 200
      expect(result.bingoActual).toBe(200); // 0 deposited + 200 delta
    });
  });
});
