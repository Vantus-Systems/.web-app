export interface ShiftInput {
  beginning_box: number | null | undefined;
  ending_box: number | null | undefined;
  pulltabs_total: number | null | undefined;
  deposit_bank_total: number | null | undefined; // This is the physical deposit (legacy deposit_total)
}

export interface ShiftDerived {
  box_delta: number | null;
  bingo_deposited: number;
  bingo_actual: number | null;
  actual_revenue: number | null;
  warnings: string[];
}

export const calculateShiftDerived = (input: ShiftInput): ShiftDerived => {
  const { beginning_box, ending_box, pulltabs_total, deposit_bank_total } = input;

  // Ensure safe numbers for calculations (treat null/undefined as 0 for non-box fields if needed, 
  // but for boxes we need strict null checks)
  const safePulltabs = Number.isNaN(Number(pulltabs_total)) ? 0 : Number(pulltabs_total) || 0;
  const safeDeposit = Number.isNaN(Number(deposit_bank_total)) ? 0 : Number(deposit_bank_total) || 0;

  const warnings: string[] = [];

  // 1. Calculate Bingo Deposited
  // bingo_deposited = deposit_bank_total - pulltabs_total
  const bingo_deposited = safeDeposit - safePulltabs;

  // Check for unusual deposit
  if (safeDeposit < safePulltabs) {
    warnings.push("Deposit is less than pulltab income. This is unusual.");
  }

  // 2. Calculate Box Delta
  // If either box count is missing, we cannot calculate delta or actuals
  let box_delta: number | null = null;
  if (
    beginning_box !== null &&
    beginning_box !== undefined &&
    ending_box !== null &&
    ending_box !== undefined &&
    !Number.isNaN(Number(beginning_box)) &&
    !Number.isNaN(Number(ending_box))
  ) {
    box_delta = Number(ending_box) - Number(beginning_box);
  }

  // 3. Calculate Bingo Actual & Actual Revenue
  let bingo_actual: number | null = null;
  let actual_revenue: number | null = null;

  if (box_delta !== null) {
    // bingo_actual = bingo_deposited + box_delta
    bingo_actual = bingo_deposited + box_delta;

    // actual_revenue = deposit_bank_total + box_delta
    // (equivalent to pulltabs_total + bingo_actual)
    actual_revenue = safeDeposit + box_delta;
  }

  return {
    box_delta,
    bingo_deposited, // Always calculated, assumes 0 if inputs missing
    bingo_actual,
    actual_revenue,
    warnings,
  };
};
