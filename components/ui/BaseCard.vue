<template>
  <div :class="cn('bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden', className)">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-slate-100">
      <slot name="header" />
    </div>
    <div class="p-6">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 bg-slate-50 border-t border-slate-100">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

interface Props {
  className?: string;
}

withDefaults(defineProps<Props>(), {
  className: '',
});
</script>
