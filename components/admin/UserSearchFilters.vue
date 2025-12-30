<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <label class="block">
        <span class="text-xs font-bold text-slate-600 block mb-2">
          Search Users
        </span>
        <input
          v-model="localSearch"
          type="text"
          placeholder="Username, email, name..."
          class="w-full rounded-lg border-slate-200 bg-white text-sm"
          @input="emitFilters"
        />
      </label>

      <label class="block">
        <span class="text-xs font-bold text-slate-600 block mb-2">
          Role
        </span>
        <select
          v-model="localFilters.role"
          class="w-full rounded-lg border-slate-200 bg-white text-sm"
          @change="emitFilters"
        >
          <option value="">All Roles</option>
          <option value="OWNER">Owner</option>
          <option value="MIC">MIC</option>
          <option value="CHARITY">Charity</option>
        </select>
      </label>

      <label class="block">
        <span class="text-xs font-bold text-slate-600 block mb-2">
          Status
        </span>
        <select
          v-model="localFilters.status"
          class="w-full rounded-lg border-slate-200 bg-white text-sm"
          @change="emitFilters"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <div class="flex items-end gap-2">
        <button
          type="button"
          @click="resetFilters"
          class="flex-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Filters {
  role: string;
  status: string;
}

const props = defineProps<{
  search: string;
  filters: Filters;
}>();

const emit = defineEmits<{
  update: [payload: { search: string; filters: Filters }];
}>();

const localSearch = ref(props.search);
const localFilters = ref<Filters>({ ...props.filters });

const emitFilters = () => {
  emit("update", {
    search: localSearch.value,
    filters: localFilters.value,
  });
};

const resetFilters = () => {
  localSearch.value = "";
  localFilters.value = { role: "", status: "" };
  emitFilters();
};

watch(() => props.search, (newVal) => {
  localSearch.value = newVal;
});
</script>
