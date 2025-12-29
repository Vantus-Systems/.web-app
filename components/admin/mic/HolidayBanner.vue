<template>
  <div v-if="holiday" class="rounded-xl border px-4 py-3 text-xs font-semibold" :class="bannerClass">
    <div class="flex items-center justify-between">
      <span>{{ holiday.name }}</span>
      <span v-if="holiday.closureType === 'CLOSE_EARLY'">Close at {{ holiday.closeTime }}</span>
      <span v-else>Closed</span>
    </div>
    <p class="mt-2 text-[11px] font-normal text-slate-600">
      {{ holidayMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  holiday?: { name: string; closureType: "CLOSED" | "CLOSE_EARLY"; closeTime?: string | null } | null;
}>();

const bannerClass = computed(() =>
  props.holiday?.closureType === "CLOSE_EARLY"
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-rose-200 bg-rose-50 text-rose-700",
);

const holidayMessage = computed(() => {
  if (!props.holiday) return "";
  if (props.holiday.closureType === "CLOSE_EARLY") {
    return "Plan for an early close. PM shift ends early.";
  }
  return "No shifts are scheduled unless manually overridden.";
});
</script>
