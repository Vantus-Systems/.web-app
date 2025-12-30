<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
            :class="column.headerClass"
          >
            <button
              v-if="column.sortable"
              class="flex items-center gap-2 hover:text-primary-900 transition-colors group"
              @click="handleSort(column.key)"
            >
              <span>{{ column.label }}</span>
              <svg
                class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                :class="{
                  'opacity-100 text-primary-900':
                    sortKey === column.key,
                  'rotate-180': sortKey === column.key && sortDirection === 'desc',
                }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <span v-else>{{ column.label }}</span>
          </th>
          <th
            v-if="$slots.actions"
            scope="col"
            class="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-200">
        <tr
          v-for="(row, index) in sortedData"
          :key="index"
          class="hover:bg-slate-50 transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-slate-900"
            :class="column.cellClass"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ row[column.key] }}
            </slot>
          </td>
          <td
            v-if="$slots.actions"
            class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
          >
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="sortedData.length === 0">
          <td
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
            class="px-6 py-12 text-center text-slate-500"
          >
            <div class="flex flex-col items-center gap-3">
              <svg
                class="w-12 h-12 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p class="text-sm font-medium">{{ emptyMessage }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  headerClass?: string;
  cellClass?: string;
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    data: any[];
    emptyMessage?: string;
  }>(),
  {
    emptyMessage: "No data available",
  },
);

const sortKey = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
};

const sortedData = computed(() => {
  if (!sortKey.value) return props.data;

  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value!];
    const bVal = b[sortKey.value!];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return sortDirection.value === "asc" ? comparison : -comparison;
  });
});
</script>
