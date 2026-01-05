<template>
  <div
    class="sticky top-0 bg-white border-l border-slate-200 rounded-xl p-6 space-y-4 h-fit"
  >
    <div>
      <p
        class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
      >
        Daily Totals
      </p>
      <h3 class="text-lg font-black text-primary-900">{{ formattedDate }}</h3>
    </div>

    <div class="space-y-3 border-t border-slate-200 pt-4">
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">Pull Tabs:</span>
        <span class="text-lg font-bold text-slate-900">
          ${{ formatCurrency(totals.pullTabs) }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">Deposits:</span>
        <span class="text-lg font-bold text-slate-900">
          ${{ formatCurrency(totals.deposits) }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">Bingo:</span>
        <span class="text-lg font-bold text-slate-900">
          {{ formatCurrency(totals.bingo, 2) }}
        </span>
      </div>
    </div>

    <div class="border-t border-slate-200 pt-4">
      <div
        class="flex justify-between items-center p-3 rounded-lg bg-primary-50 border border-primary-100"
      >
        <span class="font-bold text-slate-900">Grand Total:</span>
        <span class="text-xl font-black text-primary-900">
          ${{ formatCurrency(totals.grandTotal) }}
        </span>
      </div>
    </div>

    <div
      v-if="needsApproval"
      class="bg-amber-50 border border-amber-200 rounded-lg p-3"
    >
      <p class="text-xs font-bold text-amber-900">⚠ Approval Required</p>
      <p class="text-xs text-amber-700 mt-1">
        {{ pendingApprovalCount }} shift(s) awaiting approval
      </p>
    </div>

    <div
      v-if="allApproved"
      class="bg-green-50 border border-green-200 rounded-lg p-3"
    >
      <p class="text-xs font-bold text-green-900">✓ All Approved</p>
      <p class="text-xs text-green-700 mt-1">
        All {{ approvedCount }} shift(s) have been approved
      </p>
    </div>

    <button
      v-if="showSaveButton"
      type="button"
      class="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg transition-colors"
      @click="$emit('save')"
    >
      Save Changes
    </button>

    <button
      v-if="showSubmitButton"
      type="button"
      class="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors"
      @click="$emit('submit')"
    >
      Submit for Approval
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatCurrency } from "~/utils/format";

interface Totals {
  pullTabs: number;
  deposits: number;
  bingo: number;
  grandTotal: number;
}

interface ShiftStatus {
  approved: boolean;
  rejectionReason?: string;
}

const props = defineProps<{
  date: string;
  totals: Totals;
  shifts: Array<{ id: string; status: ShiftStatus }>;
  isDirty: boolean;
  isSubmitting: boolean;
}>();

defineEmits<{
  save: [];
  submit: [];
}>();

const formattedDate = computed(() => {
  try {
    return new Date(props.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return props.date;
  }
});

const approvedCount = computed(
  () => props.shifts.filter((s) => s.status.approved).length,
);

const pendingApprovalCount = computed(
  () => props.shifts.filter((s) => !s.status.approved).length,
);

const needsApproval = computed(() => pendingApprovalCount.value > 0);
const allApproved = computed(
  () => approvedCount.value > 0 && pendingApprovalCount.value === 0,
);

const showSaveButton = computed(() => props.isDirty && !props.isSubmitting);
const showSubmitButton = computed(
  () => allApproved.value && !props.isSubmitting && props.shifts.length > 0,
);
</script>
