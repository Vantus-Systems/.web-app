<template>
  <div class="space-y-6 p-6">
    <div>
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold mb-2">
        Operating Days
      </p>
      <h3 class="text-xl font-black text-primary-900 mb-4">
        Configure Which Days You're Open
      </h3>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <label
        v-for="day in days"
        :key="day"
        class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors"
        :class="
          operatingDays[day]
            ? 'bg-primary-50 border-primary-200'
            : 'bg-white border-slate-200'
        "
      >
        <input
          type="checkbox"
          :checked="operatingDays[day]"
          @change="toggleDay(day)"
          class="rounded"
        />
        <span class="font-semibold text-sm">{{ day }}</span>
      </label>
    </div>

    <div class="bg-slate-50 p-4 rounded-lg space-y-3">
      <p class="text-sm font-bold text-slate-700">Timezone & Currency</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-xs font-bold text-slate-600 block mb-2">
            Timezone
          </span>
          <select
            v-model="localForm.timezone"
            class="w-full rounded-lg border-slate-200 bg-white text-sm"
          >
            <option value="America/Chicago">Central Time (Chicago)</option>
            <option value="America/New_York">Eastern Time (New York)</option>
            <option value="America/Denver">Mountain Time (Denver)</option>
            <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs font-bold text-slate-600 block mb-2">
            Currency
          </span>
          <select
            v-model="localForm.currency"
            class="w-full rounded-lg border-slate-200 bg-white text-sm"
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </label>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-900">
        <strong>Tip:</strong> Operating days control which days appear in your
        schedule. You can override closure on specific days as needed.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface DaysStepForm {
  timezone: string;
  currency: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const props = defineProps<{
  timezone: string;
  currency: string;
  operatingDays: Record<string, boolean>;
}>();

const emit = defineEmits<{
  update: [payload: { timezone: string; currency: string; operatingDays: Record<string, boolean> }];
}>();

const localForm = ref<DaysStepForm>({
  timezone: props.timezone,
  currency: props.currency,
});

const operatingDays = ref<Record<string, boolean>>({ ...props.operatingDays });

const toggleDay = (day: string) => {
  operatingDays.value[day] = !operatingDays.value[day];
  emitUpdate();
};

const emitUpdate = () => {
  emit("update", {
    timezone: localForm.value.timezone,
    currency: localForm.value.currency,
    operatingDays: operatingDays.value,
  });
};

watch(() => localForm.value, emitUpdate, { deep: true });
</script>
