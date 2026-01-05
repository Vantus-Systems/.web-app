<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-bold text-slate-700">
        {{ selectedCount }} selected
      </span>
      <div class="flex items-center gap-2">
        <button
          v-if="selectedCount > 0"
          type="button"
          class="py-2 px-3 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs hover:bg-emerald-200 transition-colors"
          @click="bulkApprove"
        >
          Bulk Approve
        </button>
        <button
          v-if="selectedCount > 0"
          type="button"
          class="py-2 px-3 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs hover:bg-amber-200 transition-colors"
          @click="bulkDeactivate"
        >
          Bulk Deactivate
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  selected: string[];
}>();

const emit = defineEmits<{
  bulkApprove: [];
  bulkDeactivate: [];
}>();

const selectedCount = computed(() => props.selected.length);

const bulkApprove = () => {
  emit("bulkApprove");
};

const bulkDeactivate = () => {
  emit("bulkDeactivate");
};
</script>
