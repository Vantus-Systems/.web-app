<template>
  <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_320px] h-[720px]">
    <div class="h-full flex flex-col bg-white border-r border-slate-200">
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
            >
              Library
            </p>
            <h3 class="text-lg font-black text-primary-900">Programs</h3>
          </div>
          <button
            class="text-xs font-bold text-primary-700 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50"
            :disabled="!patternsReady"
            @click="startEdit()"
          >
            + New
          </button>
        </div>
        <input
          v-model="programSearch"
          type="text"
          placeholder="Search programs..."
          class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-xs"
        />
        <div
          v-if="!patternsReady"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700"
        >
          Add patterns before creating programs.
        </div>
      </div>
      <div class="px-4 pb-4 space-y-2 overflow-y-auto">
        <button
          v-for="p in filteredPrograms"
          :key="p.slug"
          class="w-full text-left rounded-xl border px-3 py-2"
          :class="
            editingProgram?.slug === p.slug
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          "
          @click="startEdit(p)"
        >
          <div class="text-sm font-bold text-slate-900">{{ p.name }}</div>
          <div class="text-[10px] uppercase tracking-widest text-slate-400">
            {{ p.games.length }} games
          </div>
          <button
            class="mt-2 text-[10px] font-bold text-rose-500"
            @click.stop="deleteProgram(p.slug)"
          >
            Delete
          </button>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Program Orchestrator
          </p>
          <h3 class="text-xl font-black text-primary-900">
            {{ form.name || "Select a Program" }}
          </h3>
        </div>
        <div class="text-xs text-slate-500 font-bold">
          Total Payout: ${{ totalPayout }}
        </div>
      </div>

      <div
        class="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Name
          <input
            v-model="form.name"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Slug
          <input
            v-model="form.slug"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            :disabled="!editingProgram?.isNew"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Description
          <input
            v-model="form.description"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div
            class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400"
          >
            Setlist
          </div>
          <div class="flex gap-2">
            <button
              class="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1"
              @click="addGame"
            >
              + Game
            </button>
            <button
              class="text-xs font-bold border border-dashed border-slate-300 rounded-lg px-2 py-1"
              @click="addBreak"
            >
              + Break
            </button>
          </div>
        </div>

        <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          <div
            v-for="(game, idx) in form.games"
            :key="`${game.title}-${idx}`"
            class="flex items-center gap-3 rounded-lg border px-3 py-2"
            :class="
              isBreak(game)
                ? 'border-dashed border-slate-300 bg-slate-50'
                : 'border-slate-200 bg-white'
            "
            draggable="true"
            @dragstart="dragIndex = idx"
            @dragover.prevent
            @drop="reorder(idx)"
            @click="selectGame(idx)"
          >
            <div class="text-xs font-bold text-slate-500 w-6 text-center">
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="text-sm font-bold text-slate-900">
                {{ game.title }}
              </div>
              <div class="text-[10px] uppercase tracking-widest text-slate-400">
                {{ game.patternSlug || "No Pattern" }}
              </div>
            </div>
            <button
              class="text-xs font-bold text-rose-500"
              @click.stop="removeGame(idx)"
            >
              Remove
            </button>
          </div>

          <div
            v-if="form.games.length === 0"
            class="text-center text-xs text-slate-400 py-8"
          >
            No games yet. Add a game to start building.
          </div>
        </div>
      </div>
    </div>

    <div class="h-full bg-white border-l border-slate-200 p-4 space-y-4">
      <div>
        <p
          class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
        >
          Inspector
        </p>
        <h3 class="text-lg font-black text-primary-900">
          {{ selectedGame ? selectedGame.title : "No Game Selected" }}
        </h3>
      </div>

      <div v-if="selectedGame" class="space-y-3">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Title
          <input
            v-model="selectedGame.title"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Paper Color
          <input
            :value="selectedGame.paperColor || '#ffffff'"
            type="color"
            class="mt-1 w-12 h-10 border-0 bg-transparent"
            @input="
              selectedGame.paperColor = (
                $event.target as HTMLInputElement
              ).value
            "
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Notes
          <input
            v-model="selectedGame.notes"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>

        <div class="border-t border-slate-100 pt-3">
          <div
            class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-2"
          >
            Pattern Picker
          </div>
          <input
            v-model="patternSearch"
            type="text"
            placeholder="Search patterns..."
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-xs"
          />
          <select
            v-model="patternCategory"
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-xs mt-2"
          >
            <option
              v-for="category in patternCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <div
            class="mt-2 grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto"
          >
            <button
              v-for="pattern in filteredPatterns"
              :key="pattern.slug"
              class="border rounded-lg p-2 text-left"
              :class="
                pattern.slug === selectedGame.patternSlug
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200'
              "
              @click="selectedGame.patternSlug = pattern.slug"
            >
              <div class="text-xs font-bold text-slate-800">
                {{ pattern.name }}
              </div>
              <BingoPatternGrid
                :name="pattern.name"
                :definition="pattern.definition"
                :fill-color="selectedGame.paperColor"
                size="xs"
              />
            </button>
          </div>
        </div>
      </div>

      <div class="pt-4">
        <button
          class="w-full bg-gold text-primary-900 text-xs font-bold uppercase tracking-[0.3em] py-2 rounded-lg"
          @click="saveProgram"
        >
          Save Program
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BingoPatternGrid from "~/components/bingo/BingoPatternGrid.vue";

const props = defineProps<{
  programs: any[];
  patterns: any[];
}>();

const emit = defineEmits<{
  (e: "save", program: any): void;
  (e: "delete", slug: string): void;
  (e: "navigate", step: string): void;
}>();

const editingProgram = ref<any>(null);
const programSearch = ref("");
const patternSearch = ref("");
const patternCategory = ref("All");
const dragIndex = ref<number | null>(null);
const selectedGameIndex = ref<number | null>(null);

const patternsReady = computed(() => props.patterns.length > 0);

const form = ref({
  slug: "",
  name: "",
  description: "",
  games: [] as any[],
});

const filteredPrograms = computed(() => {
  const term = programSearch.value.trim().toLowerCase();
  return props.programs.filter((program) => {
    if (!term) return true;
    return (
      program.name?.toLowerCase().includes(term) ||
      program.slug?.toLowerCase().includes(term)
    );
  });
});

const patternCategories = computed(() => {
  const categories = props.patterns
    .map((pattern) => pattern.category)
    .filter((c) => c && typeof c === "string") as string[];
  return Array.from(new Set(["All", ...categories]));
});

const filteredPatterns = computed(() => {
  const term = patternSearch.value.trim().toLowerCase();
  const allowed = patternCategories.value.includes(patternCategory.value)
    ? patternCategory.value
    : "All";
  return props.patterns.filter((pattern) => {
    const matchesCategory =
      allowed === "All" || (pattern.category && pattern.category === allowed);
    if (!term) return true;
    return (
      matchesCategory &&
      (pattern.name?.toLowerCase().includes(term) ||
        pattern.slug?.toLowerCase().includes(term))
    );
  });
});

const startEdit = (program?: any) => {
  if (program) {
    form.value = JSON.parse(
      JSON.stringify({
        slug: program.slug,
        name: program.name,
        description: program.description,
        games: program.games.map((game: any) => ({
          ...game,
          sortOrder: game.sortOrder,
        })),
      }),
    );
  } else {
    form.value = {
      slug: "",
      name: "",
      description: "",
      games: [],
    };
  }
  editingProgram.value = program || { isNew: true };
  selectedGameIndex.value = form.value.games.length ? 0 : null;
};

const addGame = () => {
  if (!patternsReady.value) return;
  form.value.games.push({
    sortOrder: form.value.games.length + 1,
    title: "New Game",
    paperColor: "#ffffff",
    notes: "",
    patternSlug: props.patterns[0]?.slug || "",
  });
  selectedGameIndex.value = form.value.games.length - 1;
};

const addBreak = () => {
  form.value.games.push({
    sortOrder: form.value.games.length + 1,
    title: "Break",
    paperColor: "#f8fafc",
    notes: "Break",
    patternSlug: props.patterns[0]?.slug || "",
  });
  selectedGameIndex.value = form.value.games.length - 1;
};

const removeGame = (idx: number) => {
  form.value.games.splice(idx, 1);
  if (selectedGameIndex.value === idx) {
    selectedGameIndex.value = null;
  }
};

const reorder = (targetIndex: number) => {
  if (dragIndex.value === null) return;
  const [moved] = form.value.games.splice(dragIndex.value, 1);
  form.value.games.splice(targetIndex, 0, moved);
  form.value.games.forEach((game, i) => (game.sortOrder = i + 1));
  dragIndex.value = null;
};

const selectGame = (idx: number) => {
  selectedGameIndex.value = idx;
};

const selectedGame = computed(() =>
  selectedGameIndex.value !== null
    ? form.value.games[selectedGameIndex.value]
    : null,
);

const saveProgram = () => {
  form.value.games.forEach((game, i) => (game.sortOrder = i + 1));
  emit("save", form.value);
};

const deleteProgram = (slug: string) => {
  emit("delete", slug);
};

const isBreak = (game: any) => game.title.toLowerCase().includes("break");

const totalPayout = computed(() => form.value.games.length * 0);
</script>
