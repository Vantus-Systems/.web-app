import { computed, type Ref } from "vue";

export type ShiftState = {
  workflow_type: string;
  beginning_box: number;
  ending_box: number;
  pulltabs_total: number;
  deposit_total: number;
  bingo_total_input: number; // Editable bingo total
  cash_count?: number; // Total cash in drawer (for recursive calc)
  date?: string;
  shift?: "AM" | "PM";
};

export const useShiftCalculations = (
  form: Ref<ShiftState>,
  pinnedField: Ref<"bingo" | "deposit">, // Tracks which total is 'anchored'
) => {
  // 1. Auto-classify workflow strictly based on boxes
  const detectedWorkflow = computed(() => {
    const start = form.value.beginning_box !== undefined ? form.value.beginning_box : 4000;
    const end = form.value.ending_box !== undefined ? form.value.ending_box : 4000;
    
    if (end < start) {
      return "NEGATIVE_BINGO_BOX";
    }
    if (start < 4000 && end >= 4000) {
      return "RECUPERATION_BOX_RETURN";
    }
    return "NORMAL";
  });

  // 2. Computed values
  const boxDelta = computed(() => {
    return (form.value.ending_box || 0) - (form.value.beginning_box || 0);
  });

  // 3. Calculation Logic
  // Should be called on @input events
  const calculate = (triggerSource: "bingo" | "deposit" | "pulltabs" | "box" | "cash_count") => {
    const workflow = form.value.workflow_type || detectedWorkflow.value;
    const pulltabs = form.value.pulltabs_total || 0;
    
    // NEW: Recursive Logic Implementation
    // If trigger is 'cash_count', we drive the entire state from Top-Down
    if (triggerSource === 'cash_count') {
        const startBox = form.value.beginning_box || 4000;
        const cashCount = form.value.cash_count || 0;
        const TARGET_BOX = 4000;
        
        // Step 1: Net Bingo
        // Bi_Net = Cash Count - B_Start
        // Note: Cash Count here implies "Total Cash in Drawer before Pulltabs removed?" 
        // User def: "Bi_Net = Cash Count of Drawer - B_Start"
        // And "Pulltabs are treated as a separate revenue stream".
        // If Pulltabs are in the drawer, we must subtract them?
        // "Cash Count of Drawer - B_Start" -> This assumes Drawer contains Bingo + Box.
        // If the drawer ALSO contains Pulltab money, then Net Bingo = Total Cash - Pulltabs - Start Box.
        
        // Assumption: The "Cash Count" input by user is the TOTAL cash in the drawer (Bingo + Box).
        // Pulltab money is usually kept separate or accounted for separately.
        // If user enters Pulltabs separately, we assume they are separate.
        
        const netBingo = cashCount - startBox;
        
        // Step 2: Ending Box State
        // The Box acts as a buffer. It attempts to return to 4000.
        let calculatedEndBox = startBox + netBingo;
        if (calculatedEndBox >= TARGET_BOX) {
            calculatedEndBox = TARGET_BOX;
        }
        // If < 4000, it stays as is.
        
        form.value.ending_box = calculatedEndBox;
        
        // Step 3: Calculate Deposit
        // Scenario A: Box Full (EndBox = 4000)
        // D = (Bi_Net - (4000 - B_Start)) + P_Net
        // Note: Bi_Net - (4000 - B_Start) = (CashCount - Start) - (4000 - Start) = CashCount - 4000.
        // So Deposit = (CashCount - 4000) + Pulltabs.
        
        // Scenario B: Box Short (EndBox < 4000)
        // D = P_Net
        
        if (calculatedEndBox === TARGET_BOX) {
            // User formula: (Bi_Net - (4000 - B_Start)) + P_Net
            // Simplifies to: (CashCount - 4000) + P_Net
            const bingoDeposit = Math.max(0, cashCount - TARGET_BOX);
            form.value.deposit_total = bingoDeposit + pulltabs;
            form.value.bingo_total_input = bingoDeposit;
        } else {
            // Box Short
            form.value.deposit_total = pulltabs;
            form.value.bingo_total_input = 0;
        }
        
        return;
    }

    let deposit = form.value.deposit_total || 0;
    let bingoInput = form.value.bingo_total_input || 0;
    
    // Workflow-specific behavior
    if (workflow === "NEGATIVE_BINGO_BOX") {
        // In Negative mode:
        // Bingo Total is locked to Box Delta.
        // Deposit is independent (real bank deposit).
        form.value.bingo_total_input = boxDelta.value; 
        
        // If pulltabs changed, deposit might default to pulltabs if cleared, but usually we just leave it.
        // If box changed -> bingo update.
        return;
    }

    // NORMAL / RECUPERATION
    // Equation: Deposit = Bingo + Pulltabs
    
    // Update the anchor
    if (triggerSource === 'bingo') pinnedField.value = 'bingo';
    if (triggerSource === 'deposit') pinnedField.value = 'deposit';
    
    if (triggerSource === 'bingo') {
        // User changed Bingo -> Calc Deposit
        form.value.deposit_total = bingoInput + pulltabs;
    } else if (triggerSource === 'deposit') {
        // User changed Deposit -> Calc Bingo
        form.value.bingo_total_input = deposit - pulltabs;
    } else if (triggerSource === 'pulltabs') {
        // User changed Pulltabs -> Check anchor
        if (pinnedField.value === 'bingo') {
             // Anchor Bingo -> Update Deposit
             form.value.deposit_total = bingoInput + pulltabs;
        } else {
            // Anchor Deposit -> Update Bingo
            form.value.bingo_total_input = deposit - pulltabs;
        }
    }
  };

  // 4. Actuals (Read-only helpers)
  const bingoActual = computed(() => {
    // bingo_actual = bingo_deposited + box_delta
    // bingo_deposited = deposit - pulltabs
    const deposit = form.value.deposit_total || 0;
    const pulltabs = form.value.pulltabs_total || 0;
    const bingoDeposited = deposit - pulltabs;
    return bingoDeposited + boxDelta.value;
  });

  const depositActual = computed(() => {
    // deposit_actual = deposit_total + box_delta
    const deposit = form.value.deposit_total || 0;
    return deposit + boxDelta.value;
  });

  return {
    detectedWorkflow,
    boxDelta,
    bingoActual,
    depositActual,
    calculate
  };
};
