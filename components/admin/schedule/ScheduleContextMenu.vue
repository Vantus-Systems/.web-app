<template>
  <div
    class="fixed z-50 min-w-[180px] bg-surface rounded-lg shadow-xl border border-divider py-1 overflow-hidden"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
  >
    <div class="px-3 py-2 border-b border-divider bg-base/50">
      <div class="text-xs font-bold text-primary">{{ dateLabel }}</div>
    </div>

    <button
      class="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-base hover:text-accent-primary flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!clipboard || isLocked"
      @click="emitAction('paste')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path
          d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        />
      </svg>
      Paste Profile
    </button>

    <button
      class="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-base hover:text-accent-primary flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isLocked"
      @click="emitAction('clear')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      Clear Schedule
    </button>

    <div class="h-px bg-divider my-1"></div>

    <button
      class="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-base hover:text-accent-primary flex items-center gap-2 transition-colors"
      @click="emitAction('lock')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      {{ isLocked ? "Unlock Day" : "Lock Day" }}
    </button>

    <button
      class="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-base hover:text-accent-primary flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isLocked"
      @click="emitAction('close')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
      Close Day
    </button>

    <div class="h-px bg-divider my-1"></div>

    <button
      class="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-base hover:text-accent-primary flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isLocked"
      @click="emitAction('doors_open')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 3v18" />
        <path d="M16 3v18" />
        <path d="M3 3h18" />
      </svg>
      Set Doors Open
    </button>

    <button
      class="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-base hover:text-accent-primary flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isLocked"
      @click="emitAction('close_early')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      Close Early
    </button>
  </div>

  <!-- Backdrop to close -->
  <div class="fixed inset-0 z-40" @click="$emit('close')"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EffectiveAssignment } from "~/utils/schedule-calendar";

const props = defineProps<{
  position: { x: number; y: number };
  date: string;
  assignment?: EffectiveAssignment;
  clipboard?: string | null;
}>();

const emit = defineEmits(["close", "action"]);

const dateLabel = computed(() => {
  return new Date(props.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
});

const isLocked = computed(() => props.assignment?.isLocked);

const emitAction = (action: string) => {
  emit("action", action);
  emit("close");
};
</script>
