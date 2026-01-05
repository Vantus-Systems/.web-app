<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4"
  >
    <div
      class="bg-surface border border-divider rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <div class="p-6">
        <h3 class="text-lg font-bold text-primary mb-2">{{ title }}</h3>
        <p class="text-sm text-secondary mb-6">{{ description }}</p>

        <div class="space-y-4">
          <label class="block">
            <span class="text-xs font-bold text-tertiary uppercase mb-1 block"
              >Time</span
            >
            <input
              ref="timeInput"
              v-model="time"
              type="time"
              class="w-full bg-base border border-divider rounded-lg px-3 py-2 text-primary focus:ring-2 focus:ring-accent-primary/20 outline-none"
              @keyup.enter="confirm"
              @keyup.esc="cancel"
            />
          </label>
        </div>
      </div>

      <div
        class="flex items-center justify-end gap-3 p-4 bg-base/50 border-t border-divider"
      >
        <button
          class="px-4 py-2 text-sm font-medium text-secondary hover:text-primary hover:bg-base rounded-lg transition-colors"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-bold text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg shadow-sm transition-all"
          @click="confirm"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  title: string;
  description: string;
  initialTime?: string;
}>();

const emit = defineEmits(["confirm", "cancel"]);

const time = ref(props.initialTime || "12:00");
const timeInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (timeInput.value) {
    timeInput.value.focus();
  }
});

const confirm = () => {
  emit("confirm", time.value);
};

const cancel = () => {
  emit("cancel");
};
</script>
