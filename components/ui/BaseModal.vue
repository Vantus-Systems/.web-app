<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  title?: string;
}>();

const emit = defineEmits(["update:modelValue", "close"]);

const modalRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    close();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    close();
  }

  // Focus trap: Tab key handling
  if (e.key === "Tab" && modalRef.value) {
    const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }
};

// Watch for modal open/close to manage focus
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      // Save currently focused element
      previousActiveElement.value = document.activeElement as HTMLElement;
      
      // Wait for next tick to ensure modal is rendered
      await nextTick();
      
      // Focus first focusable element in modal
      if (modalRef.value) {
        const firstFocusable = modalRef.value.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
      
      // Restore focus to previous element
      previousActiveElement.value?.focus();
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  // Ensure body scroll is restored on unmount
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        ref="modalRef"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        @click="handleBackdropClick"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-emerald-900/5"
          @click.stop
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between border-b border-neutral-100 px-6 py-4"
          >
            <h3
              v-if="title"
              id="modal-title"
              class="text-lg font-semibold text-emerald-900"
            >
              {{ title }}
            </h3>
            <slot name="header" />
            <button
              class="ml-auto rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500"
              aria-label="Close"
              @click="close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="bg-neutral-50 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
