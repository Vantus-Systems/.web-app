<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isVisible"
        class="fixed top-4 right-4 z-50 max-w-md w-full"
        role="alert"
        :aria-live="variant === 'error' ? 'assertive' : 'polite'"
      >
        <div
          class="bg-white rounded-lg shadow-xl border-l-4 overflow-hidden"
          :class="borderColorClass"
        >
          <div class="p-4 flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <svg
                v-if="variant === 'success'"
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="variant === 'error'"
                class="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="variant === 'warning'"
                class="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p v-if="title" class="text-sm font-bold text-slate-900">
                {{ title }}
              </p>
              <p class="text-sm text-slate-700 mt-0.5">{{ message }}</p>
            </div>

            <!-- Close Button -->
            <button
              class="flex-shrink-0 p-1 rounded hover:bg-slate-100 transition-colors"
              @click="close"
              aria-label="Close notification"
            >
              <svg
                class="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Progress Bar -->
          <div
            v-if="duration > 0"
            class="h-1 bg-slate-200"
            :class="progressColorClass"
          >
            <div
              class="h-full transition-all ease-linear"
              :class="progressBgClass"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    message: string;
    variant?: "success" | "error" | "warning" | "info";
    duration?: number; // milliseconds, 0 = no auto-close
  }>(),
  {
    title: "",
    variant: "info",
    duration: 5000,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const progress = ref(100);
let timer: ReturnType<typeof setInterval> | null = null;

const borderColorClass = computed(() => {
  switch (props.variant) {
    case "success":
      return "border-green-500";
    case "error":
      return "border-red-500";
    case "warning":
      return "border-yellow-500";
    default:
      return "border-blue-500";
  }
});

const progressColorClass = computed(() => {
  switch (props.variant) {
    case "success":
      return "bg-green-100";
    case "error":
      return "bg-red-100";
    case "warning":
      return "bg-yellow-100";
    default:
      return "bg-blue-100";
  }
});

const progressBgClass = computed(() => {
  switch (props.variant) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
  }
});

const close = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isVisible.value = false;
  progress.value = 100;
};

watch(isVisible, (visible) => {
  if (visible && props.duration > 0) {
    progress.value = 100;
    const interval = 50;
    const decrement = (interval / props.duration) * 100;

    timer = setInterval(() => {
      progress.value -= decrement;
      if (progress.value <= 0) {
        close();
      }
    }, interval);
  }
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>
