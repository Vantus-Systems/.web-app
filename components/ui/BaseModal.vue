<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { X } from "lucide-vue-next";

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
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="modelValue"
        ref="modalRef"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        @click="handleBackdropClick"
      >
        <div
          class="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-charcoal border-2 border-zinc-800 shadow-[0_50px_100px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
          @click.stop
        >
          <!-- Background Texture -->
          <div class="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="relative z-10 flex items-center justify-between border-b border-zinc-800/50 px-8 py-6 bg-black/20"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(78,221,97,0.8)]"></div>
              <h3
                v-if="title"
                id="modal-title"
                class="text-xl font-black text-white uppercase tracking-tighter"
              >
                {{ title }}
              </h3>
            </div>
            
            <slot name="header" />
            
            <button
              class="ml-auto rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-zinc-800"
              aria-label="Close"
              @click="close"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <!-- Body -->
          <div class="relative z-10 px-8 py-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="relative z-10 bg-black/40 border-t border-zinc-800/50 px-8 py-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.zinc.800');
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: theme('colors.primary.500');
}
</style>
