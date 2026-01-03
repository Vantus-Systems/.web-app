<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-surface rounded-xl shadow-2xl border border-divider w-full max-w-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-divider bg-base/50">
        <h3 class="font-bold text-primary">{{ title }}</h3>
        <p class="text-xs text-secondary mt-1">{{ description }}</p>
      </div>
      
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold text-tertiary uppercase mb-2">Select Time</label>
          <input 
            type="time" 
            v-model="timeValue"
            class="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent-primary/20"
            autofocus
          />
        </div>
      </div>
      
      <div class="px-6 py-4 bg-base/50 border-t border-divider flex justify-end gap-2">
        <button 
          class="px-4 py-2 text-xs font-bold text-secondary hover:bg-surface rounded-lg transition-colors"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button 
          class="px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors"
          @click="confirm"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  initialTime?: string;
}>();

const emit = defineEmits(['confirm', 'cancel']);

const timeValue = ref(props.initialTime || "12:00");

const confirm = () => {
  emit('confirm', timeValue.value);
};
</script>
