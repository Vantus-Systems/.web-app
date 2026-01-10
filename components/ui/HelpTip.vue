<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import BaseModal from "~/components/ui/BaseModal.vue";

defineProps<{
  title?: string;
  text: string;
}>();

const isOpen = ref(false);
const isMobile = ref(false);
const isPinned = ref(false);
const isHovered = ref(false);

onMounted(() => {
  // Simple mobile detection based on screen width
  isMobile.value = window.matchMedia("(max-width: 768px)").matches;
  window.matchMedia("(max-width: 768px)").addEventListener("change", (e) => {
    isMobile.value = e.matches;
  });
});

const toggle = () => {
  if (isMobile.value) {
    isOpen.value = true;
  } else {
    isPinned.value = !isPinned.value;
  }
};

const showPopover = computed(
  () => !isMobile.value && (isHovered.value || isPinned.value),
);
const showModal = computed({
  get: () => isMobile.value && isOpen.value,
  set: (val) => (isOpen.value = val),
});
</script>

<template>
  <div
    class="inline-flex items-center ml-1 relative"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <button
      type="button"
      class="text-slate-400 hover:text-slate-600 focus:text-slate-600 transition-colors rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500"
      :class="{ 'text-primary-600 bg-primary-50': isPinned }"
      :aria-label="title || 'Help info'"
      @click="toggle"
      @focus="isHovered = true"
      @blur="isHovered = false"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-4 h-4"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Desktop Popover -->
    <div
      v-if="showPopover"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 z-50"
      role="tooltip"
    >
      <div v-if="title" class="font-bold mb-1 border-b border-slate-700 pb-1">
        {{ title }}
      </div>
      <div class="leading-relaxed opacity-90">{{ text }}</div>
      <!-- Arrow -->
      <div
        class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"
      ></div>
    </div>

    <!-- Mobile Modal -->
    <BaseModal v-model="showModal" :title="title || 'Help'">
      <div class="text-sm text-slate-600 leading-relaxed">
        {{ text }}
      </div>
      <template #footer>
        <div class="flex justify-end">
          <button
            class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm"
            @click="showModal = false"
          >
            Close
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
