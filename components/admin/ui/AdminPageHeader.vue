<template>
  <header class="mb-8">
    <!-- Subtitle / Section Label -->
    <p
      v-if="subtitle"
      class="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-2"
    >
      {{ subtitle }}
    </p>

    <!-- Title & Actions -->
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex-1">
        <h1 class="text-4xl font-black text-primary-950 tracking-tight">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="mt-2 text-slate-600 text-sm leading-relaxed"
        >
          {{ description }}
        </p>
      </div>

      <!-- Primary Action -->
      <slot name="actions" />
    </div>

    <!-- How to Use This Page (Collapsible) -->
    <div
      v-if="instructions"
      class="mt-6 border border-primary-200 bg-primary-50/50 rounded-lg overflow-hidden"
    >
      <button
        class="w-full flex items-center justify-between p-4 text-left hover:bg-primary-100/50 transition-colors"
        @click="instructionsOpen = !instructionsOpen"
      >
        <div class="flex items-center gap-3">
          <svg
            class="w-5 h-5 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm font-semibold text-primary-900">
            How to use this page
          </span>
        </div>
        <svg
          class="w-5 h-5 text-primary-600 transition-transform"
          :class="{ 'rotate-180': instructionsOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <Transition
        enter-active-class="transition-all duration-200"
        leave-active-class="transition-all duration-200"
        enter-from-class="max-h-0 opacity-0"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="instructionsOpen" class="px-4 pb-4">
          <div
            class="prose prose-sm max-w-none text-slate-700"
            v-text="instructions"
          ></div>
        </div>
      </Transition>
    </div>

    <!-- Contextual Warnings/Info -->
    <slot name="notices" />
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    description?: string;
    instructions?: string;
  }>(),
  {
    subtitle: "",
    description: "",
    instructions: "",
  },
);

const instructionsOpen = ref(false);
</script>
