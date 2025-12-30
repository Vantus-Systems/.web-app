<template>
  <section class="space-y-4">
    <div v-if="title || description" class="border-b border-slate-200 pb-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h2 class="text-xl font-bold text-primary-950">{{ title }}</h2>
          <p v-if="description" class="mt-1 text-sm text-slate-600">
            {{ description }}
          </p>
        </div>
        <slot name="actions" />
      </div>
    </div>
    <div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>
