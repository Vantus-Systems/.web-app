<template>
  <div
    class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase"
    :class="badgeClasses"
  >
    <span
      class="w-1.5 h-1.5 rounded-full mr-1.5"
      :class="dotClasses"
      aria-hidden="true"
    ></span>
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    environment?: "production" | "staging" | "development";
  }>(),
  {
    environment: "development",
  },
);

const label = computed(() => {
  switch (props.environment) {
    case "production":
      return "Production";
    case "staging":
      return "Staging";
    default:
      return "Development";
  }
});

const badgeClasses = computed(() => {
  switch (props.environment) {
    case "production":
      return "bg-red-900/20 border border-red-700/30 text-red-400";
    case "staging":
      return "bg-yellow-900/20 border border-yellow-700/30 text-yellow-400";
    default:
      return "bg-blue-900/20 border border-blue-700/30 text-blue-400";
  }
});

const dotClasses = computed(() => {
  switch (props.environment) {
    case "production":
      return "bg-red-500 animate-pulse";
    case "staging":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
  }
});
</script>
