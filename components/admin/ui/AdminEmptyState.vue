<template>
  <div class="text-center py-12 px-4">
    <div
      class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4"
    >
      <svg
        class="w-8 h-8 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="iconPath"
        />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-slate-600 max-w-sm mx-auto mb-6">
      {{ description }}
    </p>
    <slot name="action">
      <button
        v-if="actionLabel"
        class="inline-flex items-center px-4 py-2 bg-primary-900 text-white text-sm font-bold rounded-lg hover:bg-primary-800 transition-colors"
        @click="$emit('action')"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ actionLabel }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    icon?: "inbox" | "folder" | "document" | "users" | "chart";
    actionLabel?: string;
  }>(),
  {
    icon: "inbox",
    actionLabel: "",
  },
);

defineEmits<{
  (e: "action"): void;
}>();

const iconPath = computed(() => {
  switch (props.icon) {
    case "folder":
      return "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z";
    case "document":
      return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
    case "users":
      return "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z";
    case "chart":
      return "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z";
    default: // inbox
      return "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4";
  }
});
</script>
