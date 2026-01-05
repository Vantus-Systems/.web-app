<template>
  <PricingPageContent :pricing="pricing" :schedule="schedule" />
</template>

<script setup lang="ts">
import { useBusiness } from "~/composables/useBusiness";
import PricingPageContent from "~/components/pricing/PricingPageContent.vue";

const { fetchSchedule, schedule, fetchPricing, pricing } = useBusiness();

// Fetch data on load
await fetchSchedule();
await fetchPricing();

useSeoMeta({
  title: "Pricing & Sessions | Mary Esther Bingo",
  description:
    "Clear, transparent pricing for all bingo sessions. From  pay-as-you-go to premium evening sessions with jackpots.",
});
</script>
