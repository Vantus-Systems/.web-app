<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    description?: string;
  }>(),
  {
    modelValue: false,
    title: "",
    description: "",
  },
);

const emit = defineEmits(["update:modelValue", "close"]);

const containerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleBackdropClick = () => {
  close();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.modelValue) {
    close();
  }
};

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previousActiveElement.value = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      await nextTick();
      // Focus the panel or first button for accessibility
      panelRef.value?.focus();
    } else {
      document.body.style.overflow = "";
      // Allow transition to finish before focusing back?
      // Actually usually safe to focus back immediately or after tick.
      // But if we focus back immediately, scroll position might jump if body is still locked?
      // Body unlock happens immediately above.
      previousActiveElement.value?.focus();
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <!-- Container -->
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 pointer-events-none"
    >
      <!-- Backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="modelValue"
          class="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          @click="handleBackdropClick"
        />
      </Transition>

      <!-- Panel -->
      <Transition
        enter-active-class="transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
        enter-from-class="translate-y-full sm:translate-y-0 sm:opacity-0 sm:scale-95"
        enter-to-class="translate-y-0 sm:opacity-100 sm:scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 sm:opacity-100 sm:scale-100"
        leave-to-class="translate-y-full sm:translate-y-0 sm:opacity-0 sm:scale-95"
      >
        <div
          v-if="modelValue"
          ref="panelRef"
          class="relative w-full bg-white shadow-xl pointer-events-auto
                 rounded-t-2xl sm:rounded-2xl
                 max-h-[85vh] sm:max-h-[85vh]
                 max-w-2xl
                 flex flex-col
                 focus:outline-none"
          tabindex="-1"
          role="dialog"
          :aria-modal="true"
          :aria-label="title"
        >
          <!-- Drag Handle (Mobile only) -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden">
            <div class="h-1.5 w-12 rounded-full bg-neutral-200"></div>
          </div>

          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0"
          >
            <div>
              <h3 v-if="title" class="text-xl font-bold text-slate-900">
                {{ title }}
              </h3>
              <p v-if="description" class="text-sm text-slate-500 mt-1">
                {{ description }}
              </p>
            </div>
            <slot name="header">
              <!-- Default Close Button -->
              <button
                class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors -mr-2"
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
            </slot>
          </div>

          <!-- Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto min-h-0 px-6 py-4 overscroll-contain">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="border-t border-neutral-100 bg-neutral-50 px-6 py-4 rounded-b-2xl shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <slot name="footer" />
          </div>
          <div v-else class="pb-[env(safe-area-inset-bottom)] sm:pb-0"></div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
