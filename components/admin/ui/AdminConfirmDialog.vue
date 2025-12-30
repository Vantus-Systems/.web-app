<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        @click.self="handleBackdropClick"
      >
        <div
          class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-200">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div
                  v-if="variant === 'danger'"
                  class="p-2 bg-red-100 rounded-lg"
                >
                  <svg
                    class="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div
                  v-else-if="variant === 'warning'"
                  class="p-2 bg-yellow-100 rounded-lg"
                >
                  <svg
                    class="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    :id="titleId"
                    class="text-lg font-bold text-primary-950"
                  >
                    {{ title }}
                  </h3>
                </div>
              </div>
              <button
                v-if="!persistent"
                class="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                @click="cancel"
                aria-label="Close dialog"
              >
                <svg
                  class="w-5 h-5 text-slate-500"
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
          </div>

          <!-- Body -->
          <div class="px-6 py-4">
            <p class="text-slate-700 leading-relaxed">{{ message }}</p>
            <slot />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
            <button
              v-if="showCancel"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              @click="cancel"
            >
              {{ cancelText }}
            </button>
            <button
              class="px-4 py-2 text-sm font-bold rounded-lg transition-colors"
              :class="confirmButtonClass"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "danger" | "warning";
    showCancel?: boolean;
    persistent?: boolean;
  }>(),
  {
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    showCancel: true,
    persistent: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const titleId = computed(
  () => `dialog-title-${Math.random().toString(36).substring(2, 9)}`,
);

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case "danger":
      return "bg-red-600 text-white hover:bg-red-700";
    case "warning":
      return "bg-yellow-600 text-white hover:bg-yellow-700";
    default:
      return "bg-primary-900 text-white hover:bg-primary-800";
  }
});

const confirm = () => {
  emit("confirm");
  isOpen.value = false;
};

const cancel = () => {
  emit("cancel");
  isOpen.value = false;
};

const handleBackdropClick = () => {
  if (!props.persistent) {
    cancel();
  }
};
</script>
