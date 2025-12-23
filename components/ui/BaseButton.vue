<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'primary' ? 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-600' : '',
      variant === 'gold' ? 'bg-gold text-slate-900 hover:bg-gold-400 focus:ring-gold-400' : '',
      variant === 'outline' ? 'border-2 border-primary-700 text-primary-700 hover:bg-primary-50 focus:ring-primary-600' : '',
      className
    )"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

interface Props {
  variant?: 'primary' | 'gold' | 'outline';
  className?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  className: '',
});
</script>
