<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full text-xs">
        <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left">Date / Shift</th>
            <th class="px-6 py-3 text-left">MIC</th>
            <th class="px-6 py-3 text-right">Bingo Sales</th>
            <th class="px-6 py-3 text-right">Pulltab Sales</th>
            <th class="px-6 py-3 text-right">Total Deposit</th>
            <th class="px-6 py-3 text-right">Actual Deposit</th>
            <th class="px-6 py-3 text-right">Variance</th>
            <th class="px-6 py-3 text-left">Notes</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="shift in shifts"
            :key="shift.id"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="font-bold text-slate-900">
                {{ formatDate(shift.date) }}
              </div>
              <div class="text-[10px] inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                :class="shift.shift === 'AM' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'"
              >
                {{ shift.shift }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-semibold text-slate-700">
                {{ shift.created_by?.first_name }} {{ shift.created_by?.last_name }}
              </div>
              <div class="text-slate-400 text-[10px] font-mono">
                @{{ shift.created_by?.username }}
              </div>
            </td>
            <td class="px-6 py-4 text-right font-mono text-slate-600">
              {{ formatCurrency(shift.bingo_total) }}
            </td>
            <td class="px-6 py-4 text-right font-mono text-slate-600">
              {{ formatCurrency(shift.pulltabs_total) }}
            </td>
            <td class="px-6 py-4 text-right font-mono font-bold text-slate-900">
              {{ formatCurrency(shift.deposit_total) }}
            </td>
            <td class="px-6 py-4 text-right font-mono text-slate-600">
              {{ shift.deposit_actual ? formatCurrency(shift.deposit_actual) : '-' }}
            </td>
            <td class="px-6 py-4 text-right font-mono font-bold"
              :class="getVarianceClass(shift)"
            >
              {{ calculateVariance(shift) }}
            </td>
            <td class="px-6 py-4">
              <p v-if="shift.notes" class="truncate max-w-[200px] text-slate-500 italic" :title="shift.notes">
                {{ shift.notes }}
              </p>
              <span v-else class="text-slate-300">-</span>
            </td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/admin/mic/shifts/${shift.id}`" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-primary-100 hover:text-primary-600 transition-colors" title="Edit Shift">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="shifts.length === 0">
            <td colspan="8" class="px-6 py-12 text-center text-slate-400 italic">
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

const props = defineProps<{
  shifts: ShiftRecord[];
}>();

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC" // Important since backend sends YYYY-MM-DD
  });
};

const calculateVariance = (shift: ShiftRecord) => {
  if (shift.deposit_actual === null || shift.deposit_actual === undefined) return "-";
  const variance = shift.deposit_actual - shift.deposit_total;
  return formatCurrency(variance);
};

const getVarianceClass = (shift: ShiftRecord) => {
  if (shift.deposit_actual === null || shift.deposit_actual === undefined) return "text-slate-300";
  const variance = shift.deposit_actual - shift.deposit_total;
  if (variance > 0) return "text-green-600";
  if (variance < 0) return "text-red-600";
  return "text-slate-400";
};
</script>
