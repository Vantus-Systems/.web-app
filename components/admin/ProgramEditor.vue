<template>
  <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] h-full">
    <!-- Library Sidebar -->
    <div class="h-full flex flex-col bg-surface border border-divider rounded-xl overflow-hidden shadow-sm">
      <div class="p-4 space-y-3 border-b border-divider bg-base/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">Library</p>
            <h3 class="text-lg font-bold text-primary">Programs</h3>
          </div>
          <button
            class="text-xs font-bold text-accent-primary border border-divider bg-surface hover:bg-base rounded-lg px-3 py-1.5 transition-colors"
            :disabled="!patternsReady"
            @click="startEdit()"
          >
            + New
          </button>
        </div>
        <div class="relative">
          <input
            v-model="programSearch"
            type="text"
            placeholder="Search programs..."
            class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
          />
        </div>
        <div
          v-if="!patternsReady"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700 flex items-center gap-2"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Add patterns before creating programs.
        </div>
      </div>
      <div class="flex-1 p-2 space-y-1 overflow-y-auto">
        <button
          v-for="p in filteredPrograms"
          :key="p.slug"
          class="w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-200 group"
          :class="
            editingProgram?.slug === p.slug
              ? 'border-accent-primary bg-accent-primary/5 shadow-sm'
              : 'border-transparent hover:bg-base hover:border-divider'
          "
          @click="startEdit(p)"
        >
          <div class="flex justify-between items-start">
            <div class="text-sm font-bold text-primary group-hover:text-accent-primary transition-colors">{{ p.name }}</div>
            <button
              class="text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-700"
              @click.stop="deleteProgram(p.slug)"
            >
              Delete
            </button>
          </div>
          <div class="text-[10px] uppercase tracking-widest text-secondary mt-1">
            {{ p.games.length }} games
          </div>
        </button>
      </div>
    </div>

    <!-- Orchestrator Area -->
    <div class="flex flex-col gap-4 h-full overflow-y-auto">
      <div class="flex items-center justify-between shrink-0">
        <div>
          <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">Program Orchestrator</p>
          <h3 class="text-xl font-bold text-primary">
            {{ form.name || "Select a Program" }}
          </h3>
        </div>
        <div class="text-xs text-secondary font-bold bg-surface px-3 py-1.5 rounded-lg border border-divider">
          Total Payout: ${{ totalPayout }}
        </div>
      </div>

      <div class="bg-surface border border-divider rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
        <label class="block">
          <span class="text-xs font-bold text-secondary uppercase tracking-wider">Name</span>
          <input
            v-model="form.name"
            class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
          />
        </label>
        <label class="block">
          <span class="text-xs font-bold text-secondary uppercase tracking-wider">Slug</span>
          <input
            v-model="form.slug"
            class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all disabled:opacity-50"
            :disabled="!editingProgram?.isNew"
          />
        </label>
        <label class="block">
          <span class="text-xs font-bold text-secondary uppercase tracking-wider">Description</span>
          <input
            v-model="form.description"
            class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
          />
        </label>
      </div>

      <div class="bg-surface border border-divider rounded-xl flex flex-col shadow-sm flex-1 min-h-[400px]">
        <div class="p-4 border-b border-divider flex items-center justify-between bg-base/30">
          <div class="text-xs font-bold uppercase tracking-widest text-secondary">Setlist</div>
          <div class="flex gap-2">
            <button
              class="text-xs font-bold border border-divider bg-surface hover:bg-base text-primary rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
              @click="addGame"
            >
              <span>+ Game</span>
            </button>
            <button
              class="text-xs font-bold border border-dashed border-divider hover:border-secondary text-secondary hover:text-primary rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
              @click="addBreak"
            >
              <span>+ Break</span>
            </button>
          </div>
        </div>

        <div class="flex-1 p-4 space-y-2 overflow-y-auto">
          <div
            v-for="(game, idx) in form.games"
            :key="`${game.title}-${idx}`"
            class="flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 cursor-move group"
            :class="[
              isBreak(game)
                ? 'border-dashed border-divider bg-base/50'
                : 'border-divider bg-surface hover:border-accent-primary/50',
              selectedGameIndex === idx ? 'ring-2 ring-accent-primary border-transparent' : ''
            ]"
            draggable="true"
            @dragstart="dragIndex = idx"
            @dragover.prevent
            @drop="reorder(idx)"
            @click="selectGame(idx)"
          >
            <div class="text-xs font-bold text-secondary w-6 text-center select-none cursor-grab active:cursor-grabbing">
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="text-sm font-bold text-primary">
                {{ game.title }}
              </div>
              <div class="text-[10px] uppercase tracking-widest text-secondary mt-0.5">
                {{ game.patternSlug || "No Pattern" }}
              </div>
            </div>
            <button
              class="text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
              @click.stop="removeGame(idx)"
            >
              Remove
            </button>
          </div>

          <div
            v-if="form.games.length === 0"
            class="flex flex-col items-center justify-center h-40 text-secondary border-2 border-dashed border-divider rounded-xl bg-base/30"
          >
            <p class="text-sm font-medium">No games yet</p>
            <p class="text-xs mt-1">Add a game or break to start building the program.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspector Panel -->
    <div class="h-full bg-surface border border-divider rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div class="p-4 border-b border-divider bg-base/30">
        <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">Inspector</p>
        <h3 class="text-lg font-bold text-primary truncate">
          {{ selectedGame ? selectedGame.title : "No Selection" }}
        </h3>
      </div>

      <div v-if="selectedGame" class="p-4 space-y-6 overflow-y-auto flex-1">
        <div class="space-y-4">
          <label class="block">
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">Title</span>
            <input
              v-model="selectedGame.title"
              class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
            />
          </label>
          <label class="block">
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">Paper Color</span>
            <div class="flex items-center gap-2 mt-1.5">
              <input
                :value="selectedGame.paperColor || '#ffffff'"
                type="color"
                class="w-10 h-10 rounded cursor-pointer border border-divider p-1 bg-white"
                @input="
                  selectedGame.paperColor = (
                    $event.target as HTMLInputElement
                  ).value
                "
              />
              <span class="text-xs font-mono text-secondary">{{ selectedGame.paperColor || '#ffffff' }}</span>
            </div>
          </label>
          <label class="block">
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">Notes</span>
            <textarea
              v-model="selectedGame.notes"
              rows="3"
              class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all resize-none"
            ></textarea>
          </label>
        </div>

        <div class="border-t border-divider pt-6 space-y-4">
          <div class="text-xs font-bold uppercase tracking-widest text-secondary">Pattern Picker</div>
          <div class="space-y-2">
            <input
              v-model="patternSearch"
              type="text"
              placeholder="Search patterns..."
              class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
            />
            <select
              v-model="patternCategory"
              class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
            >
              <option
                v-for="category in patternCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
            <button
              v-for="pattern in filteredPatterns"
              :key="pattern.slug"
              class="border rounded-lg p-2 text-left transition-all duration-200 hover:shadow-sm"
              :class="
                pattern.slug === selectedGame.patternSlug
                  ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary'
                  : 'border-divider bg-surface hover:border-secondary/50'
              "
              @click="selectedGame.patternSlug = pattern.slug"
            >
              <div class="text-xs font-bold text-primary mb-2 truncate">
                {{ pattern.name }}
              </div>
              <div class="aspect-square bg-white rounded border border-divider/50 overflow-hidden">
                <BingoPatternGrid
                  :name="pattern.name"
                  :definition="pattern.definition"
                  :fill-color="selectedGame.paperColor"
                  size="xs"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="flex-1 flex items-center justify-center text-secondary p-8 text-center">
        <div>
          <p class="text-sm font-medium">No Game Selected</p>
          <p class="text-xs mt-1">Select a game from the setlist to edit its details.</p>
        </div>
      </div>

      <div class="p-4 border-t border-divider bg-base/30">
        <button
          class="w-full bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg shadow-sm transition-all transform active:scale-[0.98]"
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
