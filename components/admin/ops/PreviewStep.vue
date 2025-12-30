<template>
  <div class="space-y-6 p-6">
    <div>
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold mb-2">
        Preview & Validation
      </p>
      <h3 class="text-xl font-black text-primary-900 mb-4">
        Review Your Operations Schema
      </h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
          Configuration Summary
        </p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-600">Operating Days:</span>
            <span class="font-semibold">{{ operatingDaysCount }}/7</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Sessions:</span>
            <span class="font-semibold">{{ sessionCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Patterns:</span>
            <span class="font-semibold">{{ patternCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Programs:</span>
            <span class="font-semibold">{{ programCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Timezone:</span>
            <span class="font-semibold">{{ timezone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Currency:</span>
            <span class="font-semibold">{{ currency }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-if="!hasErrors"
          class="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <p class="text-sm font-bold text-green-900">✓ Ready to Publish</p>
          <p class="text-xs text-green-700 mt-1">
            Your configuration is complete and valid. You can proceed to publish.
          </p>
        </div>

        <div v-else class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm font-bold text-red-900">⚠ Validation Errors</p>
          <ul class="text-xs text-red-700 mt-2 list-disc list-inside space-y-1">
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-900">
        <strong>Next Step:</strong> Review the summary above. If everything looks
        correct, proceed to publish your operations schema.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  operatingDays: Record<string, boolean>;
  sessions: string[];
  selectedPatterns: string[];
  selectedPrograms: string[];
  timezone: string;
  currency: string;
}>();

const operatingDaysCount = computed(() => {
  return Object.values(props.operatingDays).filter(Boolean).length;
});

const sessionCount = computed(() => props.sessions.length);
const patternCount = computed(() => props.selectedPatterns.length);
const programCount = computed(() => props.selectedPrograms.length);

const errors = computed(() => {
  const errs: string[] = [];
  if (operatingDaysCount.value === 0) {
    errs.push("Select at least one operating day");
  }
  if (sessionCount.value === 0) {
    errs.push("Add at least one session");
  }
  if (patternCount.value === 0) {
    errs.push("Select at least one bingo pattern");
  }
  if (programCount.value === 0) {
    errs.push("Select at least one program");
  }
  return errs;
});

const hasErrors = computed(() => errors.value.length > 0);
</script>
