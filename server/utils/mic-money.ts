/**
 * MIC Dashboard Money Calculations
 * Server-side computation of cash totals, checks, variance, and reconciliation
 */

import type {
  DenominationCount,
  CheckLogInput,
} from "~/server/schemas/micShift.zod";

const DENOMINATION_VALUES: Record<keyof DenominationCount, number> = {
  denom_100_count: 100,
  denom_50_count: 50,
  denom_20_count: 20,
  denom_10_count: 10,
  denom_5_count: 5,
  denom_1_count: 1,
  denom_quarters: 0.25,
  denom_dimes: 0.1,
  denom_nickels: 0.05,
  denom_pennies: 0.01,
};

/**
 * Calculate total cash from denomination counts
 */
export function calculateCashTotal(denominations: DenominationCount): number {
  let total = 0;
  for (const [key, value] of Object.entries(DENOMINATION_VALUES)) {
    const count = denominations[key as keyof DenominationCount];
    total += count * value;
  }
  // Round to 2 decimal places to avoid floating-point errors
  return Math.round(total * 100) / 100;
}

/**
 * Calculate total from check logs
 */
export function calculateChecksTotal(checkLogs: CheckLogInput[]): number {
  return checkLogs.reduce((sum, check) => sum + check.amount, 0);
}

/**
 * Calculate variance and reconciliation status
 * Tolerance: abs(variance) <= $1.00 is considered "balanced"
 */
export interface ReconciliationResult {
  cashTotal: number;
  checksTotal: number;
  salesTotal: number;
  variance: number;
  isBalanced: boolean;
  varianceTolerance: number;
}

export function reconcile(
  cashTotal: number,
  checksTotal: number,
  salesTotal: number,
  varianceTolerance: number = 1.0,
): ReconciliationResult {
  const variance =
    Math.round((cashTotal + checksTotal - salesTotal) * 100) / 100;
  const isBalanced = Math.abs(variance) <= varianceTolerance;

  return {
    cashTotal,
    checksTotal,
    salesTotal,
    variance,
    isBalanced,
    varianceTolerance,
  };
}
