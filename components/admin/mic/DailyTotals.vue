<template>
  <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p
          class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
        >
          Daily Totals
        </p>
        <h3 class="text-lg font-black text-primary-900">{{ dateLabel }}</h3>
      </div>
      <button
        class="text-xs font-bold text-slate-500 border border-slate-200 rounded-lg px-2 py-1"
        disabled
        title="Coming soon"
      >
        Export
      </button>
    </div>

    <div class="overflow-hidden border border-slate-200 rounded-lg">
      <table class="min-w-full text-xs">
        <thead class="bg-slate-50 text-slate-500 uppercase tracking-widest">
          <tr>
            <th class="px-3 py-2 text-left">Shift</th>
            <th class="px-3 py-2 text-right">Pull Tabs</th>
            <th class="px-3 py-2 text-right">Deposit</th>
            <th class="px-3 py-2 text-right">Bingo</th>
            <th class="px-3 py-2 text-right">Players</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.shift"
            class="border-t border-slate-200"
          >
            <td class="px-3 py-2 font-semibold text-slate-700">
              {{ row.shift }}
            </td>
            <td class="px-3 py-2 text-right">${{ row.pulltabs.toFixed(2) }}</td>
            <td class="px-3 py-2 text-right">${{ row.deposit.toFixed(2) }}</td>
            <td class="px-3 py-2 text-right">{{ row.bingo.toFixed(2) }}</td>
            <td class="px-3 py-2 text-right">{{ row.players }}</td>
          </tr>
          <tr
            class="border-t border-slate-200 bg-slate-50 font-bold text-slate-700"
          >
            <td class="px-3 py-2">Total</td>
            <td class="px-3 py-2 text-right">
              ${{ totals.pulltabs.toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-right">
              ${{ totals.deposit.toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-right">{{ totals.bingo.toFixed(2) }}</td>
            <td class="px-3 py-2 text-right">{{ totals.players }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  dateLabel: string;
  shifts: Array<{
    shift: string;
    pulltabs_total: number;
    deposit_total: number;
    bingo_total: number;
    players?: number | null;
  }>;
}>();

const rows = computed(() =>
  ["AM", "PM"].map((shift) => {
    const record = props.shifts.find((item) => item.shift === shift);
    return {
      shift,
      pulltabs: record?.pulltabs_total ?? 0,
      deposit: record?.deposit_total ?? 0,
      bingo: record?.bingo_total ?? 0,
      players: record?.players ?? 0,
    };
  }),
);

const totals = computed(() => ({
  pulltabs: rows.value.reduce((sum, row) => sum + row.pulltabs, 0),
  deposit: rows.value.reduce((sum, row) => sum + row.deposit, 0),
  bingo: rows.value.reduce((sum, row) => sum + row.bingo, 0),
  players: rows.value.reduce((sum, row) => sum + row.players, 0),
}));
</script>
