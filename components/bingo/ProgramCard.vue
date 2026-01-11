<script setup lang="ts">
import { Box, ArrowRight } from "lucide-vue-next";
import BaseButtonUpdated from "~/components/ui/BaseButtonUpdated.vue";
import { ref } from "vue";

const props = defineProps<{
  program: {
    slug: string;
    name: string;
    description?: string | null;
    gameCount: number;
  };
}>();

const isLoading = ref(false);
const isHovered = ref(false);
const prefetchError = ref(false);

// Prefetch program data on hover for better perceived performance
const handleMouseEnter = async () => {
  isHovered.value = true;
  try {
    await $fetch(`/api/programs/${props.program.slug}`, {
      method: 'GET',
      headers: {
        'X-Prefetch': 'true'
      }
    });
  } catch (error) {
    prefetchError.value = true;
    console.error('Prefetch failed:', error);
  }
};

const handleMouseLeave = () => {
  isHovered.value = false;
};

const handleClick = async (navigate: () => void) => {
  isLoading.value = true;
  try {
    navigate();
  } catch (error) {
    console.error('Navigation failed:', error);
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="group relative bg-charcoal border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 hover:border-primary/50 overflow-hidden"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Hover Glow -->
    <div
      class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <div class="relative z-10">
      <div class="flex items-center justify-between mb-8">
        <div
          class="w-12 h-12 bg-black rounded-xl border border-zinc-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500"
        >
          <Box class="w-6 h-6" />
        </div>
        <span
          class="bg-black text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20"
        >
          {{ props.program.gameCount }} Patterns
        </span>
      </div>

      <h3
        class="text-4xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tighter mb-4"
      >
        {{ props.program.name }}
      </h3>

      <p class="text-zinc-500 mb-10 font-bold leading-tight line-clamp-2">
        {{ props.program.description || "Full session breakdown and prize structure." }}
      </p>

      <!-- View Program Button -->
      <div class="mt-auto">
        <NuxtLink
          :to="{ name: 'programs-slug', params: { slug: props.program.slug } }"
          custom
          aria-label="View program details"
        >
          <template #default="{ navigate }">
            <BaseButtonUpdated
              variant="primary"
              size="medium"
              label="View Program"
              class="w-full justify-center"
              aria-label="View program details"
              role="link"
              :loading="isLoading"
              :disabled="isLoading"
              @click="() => handleClick(navigate)"
            >
              <template #default>
                <span class="inline-flex items-center gap-2">
                  View Program
                  <ArrowRight class="w-4 h-4" />
                </span>
              </template>
            </BaseButtonUpdated>
          </template>
        </NuxtLink>
        <!-- Prefetch error indicator -->
        <div v-if="prefetchError" class="mt-2 text-xs text-red-400 text-center">
          Prefetch failed - click to retry
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  ProgramCard
  - Purpose: Display a single Program with a CTA to view the full program details.
  - Notes: Uses NuxtLink in custom mode so the BaseButtonUpdated handles click and remains accessible.
  - Mobile: Tailwind classes ensure good scaling on small screens; button is full width and touch-friendly.
  - Optimizations: Added prefetching on hover, loading state, and error handling.
-->
