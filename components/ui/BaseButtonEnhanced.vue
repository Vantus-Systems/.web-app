<template>
  <button
    :class="computedClass"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="loading" class="inline-flex items-center gap-2">
      <span
        class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
      ></span>
      <span v-if="label">{{ label }}</span>
      <slot v-else />
    </span>
    <span v-else class="inline-flex items-center gap-2">
      <span v-if="icon" :class="icon" />
      <span v-if="label">{{ label }}</span>
      <slot v-else />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  label?: string;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "medium",
  loading: false,
  disabled: false,
  fullWidth: false,
  className: "",
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit("click", event);
  }
};

const computedClass = computed(() => {
  const baseClasses = [
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    props.fullWidth ? "w-full" : "",
    props.className,
  ];

  // Size classes
  const sizeClasses = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  }[props.size];

  // Variant classes (Aurora tokens)
  const variantClasses = {
    primary: [
      "bg-accent-primary text-white",
      "hover:bg-blue-600", // Slightly darker for hover
      "focus:ring-accent-primary",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    secondary: [
      "bg-surface border border-divider text-primary",
      "hover:bg-base",
      "focus:ring-accent-primary",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    tertiary: [
      "bg-transparent text-accent-primary",
      "hover:underline",
      "focus:ring-accent-primary",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    danger: [
      "bg-accent-error text-white",
      "hover:bg-red-600",
      "focus:ring-accent-error",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    success: [
      "bg-accent-success text-white",
      "hover:bg-green-600",
      "focus:ring-accent-success",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
  }[props.variant];

  return [...baseClasses, sizeClasses, ...variantClasses]
    .filter(Boolean)
    .join(" ");
});
</script>
