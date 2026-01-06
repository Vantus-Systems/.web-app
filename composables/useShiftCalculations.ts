import { computed, type Ref } from "vue";

export type ShiftState = {
  workflow_type: string;
  beginning_box: number;
  ending_box: number;
  pulltabs_total: number;
  deposit_total: number;
  bingo_total_input: number; // Editable bingo total
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
  const calculate = (triggerSource: "bingo" | "deposit" | "pulltabs" | "box") => {
    const workflow = form.value.workflow_type || detectedWorkflow.value;
    const pulltabs = form.value.pulltabs_total || 0;
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
