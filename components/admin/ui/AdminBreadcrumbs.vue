<template>
  <nav aria-label="Breadcrumb" class="flex items-center space-x-2 text-sm">
    <NuxtLink
      v-for="(crumb, index) in breadcrumbs"
      :key="crumb.path"
      :to="crumb.path"
      class="flex items-center hover:text-gold transition-colors"
      :class="
        index === breadcrumbs.length - 1
          ? 'text-white font-semibold'
          : 'text-slate-400'
      "
    >
      <span>{{ crumb.label }}</span>
      <svg
        v-if="index < breadcrumbs.length - 1"
        class="w-4 h-4 mx-2 text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
interface Breadcrumb {
  label: string;
  path: string;
}

defineProps<{
  breadcrumbs: Breadcrumb[];
}>();
</script>
