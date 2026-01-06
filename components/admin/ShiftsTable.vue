<template>
  <div
    class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full text-xs">
        <thead
          class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200"
        >
          <tr>
            <th class="px-4 py-3 text-left whitespace-nowrap">Date / Shift</th>
            <th class="px-4 py-3 text-left whitespace-nowrap">MIC</th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Deposit to Bank
                <HelpTip text="The amount physically deposited to the bank (legacy: Deposit Total)." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Actual Revenue
                <HelpTip text="Deposit to Bank + Box Change. The true profit/loss." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Pulltabs Net
                <HelpTip text="Net pulltab sales." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Bingo (Deposited)
                <HelpTip text="Deposit to Bank - Pulltabs Net." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Bingo (Actual)
                <HelpTip text="Bingo (Deposited) + Box Change." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Box Start
                <HelpTip text="Beginning box count." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Box End
                <HelpTip text="Ending box count." />
              </div>
            </th>
            <th class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                Box Change
                <HelpTip text="Ending Box - Beginning Box." />
              </div>
            </th>
            <th class="px-4 py-3 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1">
                Players
                <HelpTip text="Number of players (PM only)." />
              </div>
            </th>
            <th class="px-4 py-3 text-left whitespace-nowrap">
              <div class="flex items-center gap-1">
                Workflow
                <HelpTip text="Type of shift workflow used." />
              </div>
            </th>
            <th class="px-4 py-3 text-left whitespace-nowrap">Notes</th>
            <th class="px-4 py-3 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="shift in shifts"
            :key="shift.id"
            class="hover:bg-slate-50 transition-colors"
          >
            <!-- Date / Shift -->
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="font-bold text-slate-900">
                {{ formatDate(shift.date) }}
              </div>
              <div
                class="text-[10px] inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                :class="
                  shift.shift === 'AM'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-indigo-100 text-indigo-700'
                "
              >
                {{ shift.shift }}
              </div>
            </td>

            <!-- MIC -->
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="font-semibold text-slate-700">
                {{ shift.created_by?.first_name }}
                {{ shift.created_by?.last_name }}
              </div>
              <div class="text-slate-400 text-[10px] font-mono">
                @{{ shift.created_by?.username }}
              </div>
            </td>

            <!-- Deposit to Bank -->
            <td class="px-4 py-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
              {{ formatCurrency(shift.deposit_bank_total ?? shift.deposit_total) }}
            </td>

            <!-- Actual Revenue -->
            <td class="px-4 py-4 text-right font-mono font-bold whitespace-nowrap" :class="(shift.actual_revenue || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ shift.actual_revenue !== null && shift.actual_revenue !== undefined ? formatCurrency(shift.actual_revenue) : '-' }}
            </td>

            <!-- Pulltabs Net -->
            <td class="px-4 py-4 text-right font-mono text-slate-600 whitespace-nowrap">
              {{ formatCurrency(shift.pulltabs_total) }}
            </td>

            <!-- Bingo (Deposited) -->
            <td class="px-4 py-4 text-right font-mono text-slate-600 whitespace-nowrap">
              {{ formatCurrency(shift.bingo_deposited ?? (shift.deposit_total - shift.pulltabs_total)) }}
            </td>

            <!-- Bingo (Actual) -->
            <td class="px-4 py-4 text-right font-mono whitespace-nowrap" :class="(shift.bingo_actual || 0) >= 0 ? 'text-slate-600' : 'text-red-600'">
              {{ shift.bingo_actual !== null && shift.bingo_actual !== undefined ? formatCurrency(shift.bingo_actual) : '-' }}
            </td>

            <!-- Box Start -->
            <td class="px-4 py-4 text-right font-mono text-slate-500 whitespace-nowrap">
              {{ shift.beginning_box !== null ? formatCurrency(shift.beginning_box) : '-' }}
            </td>

            <!-- Box End -->
            <td class="px-4 py-4 text-right font-mono text-slate-500 whitespace-nowrap">
              {{ shift.ending_box !== null ? formatCurrency(shift.ending_box) : '-' }}
            </td>

            <!-- Box Change -->
            <td class="px-4 py-4 text-right font-mono whitespace-nowrap" :class="(shift.box_delta || 0) >= 0 ? 'text-slate-600' : 'text-red-600'">
              {{ shift.box_delta !== null && shift.box_delta !== undefined ? formatCurrency(shift.box_delta) : '-' }}
            </td>

            <!-- Players -->
            <td class="px-4 py-4 text-center font-mono text-slate-600 whitespace-nowrap">
              {{ shift.shift === 'PM' && shift.players !== null ? shift.players : '-' }}
            </td>

            <!-- Workflow -->
            <td class="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
              {{ shift.workflow_type }}
            </td>

            <!-- Notes -->
            <td class="px-4 py-4 whitespace-nowrap">
              <p
                v-if="shift.notes"
                class="truncate max-w-[150px] text-slate-500 italic"
                :title="shift.notes"
              >
                {{ shift.notes }}
              </p>
              <span v-else class="text-slate-300">-</span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-4 text-right whitespace-nowrap">
              <NuxtLink
                :to="`/admin/mic/shifts/${shift.id}`"
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                title="Edit Shift"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                  ></path>
                </svg>
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="shifts.length === 0">
            <td
              colspan="14"
              class="px-6 py-12 text-center text-slate-400 italic"
            >
              No shift records found for this period.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShiftRecord } from "~/types/admin";
import { formatCurrency } from "~/utils/format";
import HelpTip from "~/components/ui/HelpTip.vue";

const props = defineProps<{
  shifts: ShiftRecord[];
}>();

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC", // Important since backend sends YYYY-MM-DD
  });
};
</script>
