<template>
  <div class="space-y-6 p-6">
    <div>
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold mb-2">
        Bingo Configuration
      </p>
      <h3 class="text-xl font-black text-primary-900 mb-4">
        Link Patterns, Pricing & Programs
      </h3>
    </div>

    <div class="space-y-4">
      <div class="bg-slate-50 p-4 rounded-lg">
        <p class="text-sm font-bold text-slate-700 mb-3">
          Select Bingo Patterns
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label
            v-for="pattern in availablePatterns"
            :key="pattern.id"
            class="flex items-center gap-2 p-2 cursor-pointer hover:bg-white rounded transition-colors"
          >
            <input
              type="checkbox"
              :checked="selectedPatterns.includes(pattern.id)"
              @change="togglePattern(pattern.id)"
              class="rounded"
            />
            <span class="text-sm font-semibold text-slate-700">
              {{ pattern.name }}
            </span>
          </label>
        </div>
      </div>

      <div class="bg-slate-50 p-4 rounded-lg">
        <p class="text-sm font-bold text-slate-700 mb-3">
          Select Programs
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label
            v-for="program in availablePrograms"
            :key="program.id"
            class="flex items-center gap-2 p-2 cursor-pointer hover:bg-white rounded transition-colors"
          >
            <input
              type="checkbox"
              :checked="selectedPrograms.includes(program.id)"
              @change="toggleProgram(program.id)"
              class="rounded"
            />
            <span class="text-sm font-semibold text-slate-700">
              {{ program.name }}
            </span>
          </label>
        </div>
      </div>

      <div class="bg-slate-50 p-4 rounded-lg">
        <label class="block">
          <span class="text-sm font-bold text-slate-700 block mb-2">
            Primary Rate Card
          </span>
          <select
            v-model="primaryRateCard"
            class="w-full rounded-lg border-slate-200 bg-white text-sm"
          >
            <option value="">Select Rate Card...</option>
            <option
              v-for="card in availableRateCards"
              :key="card.id"
              :value="card.id"
            >
              {{ card.name }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-sm text-green-900">
        <strong>Summary:</strong>
        {{ selectedPatterns.length }} pattern(s),
        {{ selectedPrograms.length }} program(s),
        {{ primaryRateCard ? "1" : "0" }} rate card selected.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Pattern {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

interface RateCard {
  id: string;
  name: string;
}

const props = defineProps<{
  selectedPatterns: string[];
  selectedPrograms: string[];
  primaryRateCard: string;
  availablePatterns: Pattern[];
  availablePrograms: Program[];
  availableRateCards: RateCard[];
}>();

const emit = defineEmits<{
  update: [payload: {
    selectedPatterns: string[];
    selectedPrograms: string[];
    primaryRateCard: string;
  }];
}>();

const selectedPatterns = ref<string[]>([...props.selectedPatterns]);
const selectedPrograms = ref<string[]>([...props.selectedPrograms]);
const primaryRateCard = ref(props.primaryRateCard);

const togglePattern = (patternId: string) => {
  const idx = selectedPatterns.value.indexOf(patternId);
  if (idx > -1) {
    selectedPatterns.value.splice(idx, 1);
  } else {
    selectedPatterns.value.push(patternId);
  }
  emitUpdate();
};

const toggleProgram = (programId: string) => {
  const idx = selectedPrograms.value.indexOf(programId);
  if (idx > -1) {
    selectedPrograms.value.splice(idx, 1);
  } else {
    selectedPrograms.value.push(programId);
  }
  emitUpdate();
};

const emitUpdate = () => {
  emit("update", {
    selectedPatterns: selectedPatterns.value,
    selectedPrograms: selectedPrograms.value,
    primaryRateCard: primaryRateCard.value,
  });
};

watch(primaryRateCard, emitUpdate);
watch(() => props.selectedPatterns, (newVal) => {
  selectedPatterns.value = [...newVal];
}, { deep: true });
</script>
