<template>
  <div>
    <TodayStrip />
    <PricingPageContent :pricing="pricing" :schedule="sessions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onMounted, onUnmounted } from "vue";
import { useBusiness, useAutoRefresh } from "~/composables/useBusiness";
import PricingPageContent from "~/components/pricing/PricingPageContent.vue";
import TodayStrip from "~/components/public/TodayStrip.vue";

const { fetchSchedule, schedule, fetchPricing, pricing } = useBusiness();
const { startPolling, stopPolling } = useAutoRefresh(30);

// Fetch data on load
await fetchSchedule();
await fetchPricing();

onMounted(() => {
  startPolling(false);
});

onUnmounted(() => {
  stopPolling();
});

// Handle { sessions, meta } vs Session[]
const sessions = computed(() => {
  if (Array.isArray(schedule.value)) return schedule.value;
  return schedule.value?.sessions || [];
});

useSeoMeta({
  title: "Pricing & Sessions | Mary Esther Bingo",
  description:
    "Clear, transparent pricing for all bingo sessions. From  pay-as-you-go to premium evening sessions with jackpots.",
});
</script>
