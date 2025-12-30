<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="inputId"
      class="block text-xs font-bold text-slate-700 uppercase tracking-wider"
    >
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
    </label>
    <p v-if="hint" class="text-xs text-slate-500 leading-relaxed">
      {{ hint }}
    </p>
    <slot />
    <p
      v-if="error"
      class="text-xs text-red-600 font-medium flex items-center gap-1"
      role="alert"
    >
      <svg
        class="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    id?: string;
  }>(),
  {
    label: "",
    hint: "",
    error: "",
    required: false,
    id: "",
  },
);

const inputId = computed(
  () => props.id || `field-${Math.random().toString(36).substring(2, 9)}`,
);
</script>
