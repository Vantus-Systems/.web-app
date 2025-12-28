<script setup lang="ts">
import { ref, onMounted, computed, inject } from "vue";
import BingoPatternGrid from "~/components/bingo/BingoPatternGrid.vue";

const programs = ref<any[]>([]);
const patterns = ref<any[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const editingProgram = ref<any>(null);
const setAdminTab = inject<((tabId: string) => void) | null>(
  "setAdminTab",
  null,
);
const refreshAdminCounts = inject<(() => Promise<void>) | null>(
  "refreshAdminCounts",
  null,
);
const patternsReady = computed(() => patterns.value.length > 0);

const fetchPrograms = async () => {
  isLoading.value = true;
  try {
    const [progs, pats] = await Promise.all([
      $fetch("/api/admin/programs"),
      $fetch("/api/admin/patterns"),
    ]);
    programs.value = progs;
    patterns.value = pats;
    await refreshAdminCounts?.();
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPrograms);

const form = ref({
  slug: "",
  name: "",
  description: "",
  games: [] as any[],
});

const startEdit = (p?: any) => {
  if (p) {
    form.value = JSON.parse(
      JSON.stringify({
        slug: p.slug,
        name: p.name,
        description: p.description,
        games: p.games.map((g: any) => ({
          ...g,
          sortOrder: g.sortOrder,
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
  editingProgram.value = p || { isNew: true };
};

const cancelEdit = () => {
  editingProgram.value = null;
};

const saveProgram = async () => {
  isSaving.value = true;
  try {
    // Re-index sort order just in case
    form.value.games.forEach((g, i) => (g.sortOrder = i + 1));

    await $fetch("/api/admin/programs", {
      method: "POST",
      body: form.value,
    });
    await fetchPrograms();
    editingProgram.value = null;
    await refreshAdminCounts?.();
  } catch (e: any) {
    alert(e.data?.message || "Failed to save program");
  } finally {
    isSaving.value = false;
  }
};

const deleteProgram = async (slug: string) => {
  if (!confirm("Are you sure?")) return;
  try {
    await $fetch(`/api/admin/programs?slug=${slug}`, { method: "DELETE" });
    await fetchPrograms();
    await refreshAdminCounts?.();
  } catch (e: any) {
    alert(e.data?.message || "Failed to delete");
  }
};

// Game Management
const addGame = () => {
  form.value.games.push({
    sortOrder: form.value.games.length + 1,
    title: "New Game",
    paperColor: "#ffffff",
    notes: "",
    patternSlug: patterns.value.length > 0 ? patterns.value[0].slug : "",
  });
};

const removeGame = (idx: number) => {
  form.value.games.splice(idx, 1);
};

const moveGame = (idx: number, dir: number) => {
  if (idx + dir < 0 || idx + dir >= form.value.games.length) return;
  const temp = form.value.games[idx];
  form.value.games[idx] = form.value.games[idx + dir];
  form.value.games[idx + dir] = temp;
};

const getPattern = (slug: string) =>
  patterns.value.find((p) => p.slug === slug);
</script>

<template>
  <div>
    <div v-if="!patternsReady" class="mb-6">
      <div
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800"
      >
        Patterns are required before you can build programs. Add at least one
        pattern to unlock program creation.
      </div>
      <div class="mt-3 flex flex-wrap gap-3">
        <button
          class="bg-gold text-primary-900 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.3em] hover:bg-gold-400 transition-colors"
          @click="setAdminTab?.('patterns')"
        >
          Create Patterns
        </button>
      </div>
    </div>

    <!-- List View -->
    <div v-if="!editingProgram" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-slate-900">Bingo Programs</h2>
        <button
          class="bg-gold text-primary-900 px-4 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="startEdit()"
          :disabled="!patternsReady"
        >
          New Program
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="p in programs"
          :key="p.slug"
          class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-lg text-slate-900">{{ p.name }}</h3>
              <p class="text-xs text-slate-500">{{ p.description }}</p>
            </div>
            <button
              class="text-red-400 hover:text-red-600"
              @click="deleteProgram(p.slug)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            </button>
          </div>

          <div class="space-y-2 mb-6 max-h-48 overflow-y-auto">
            <div
              v-for="g in p.games"
              :key="g.id"
              class="flex items-center gap-2 text-sm border-b border-slate-50 py-1"
            >
              <div
                class="w-3 h-3 rounded-full border border-black/10"
                :style="{ backgroundColor: g.paperColor }"
              ></div>
              <span class="flex-1 truncate">{{ g.title }}</span>
              <span class="text-xs text-slate-400">{{ g.pattern.name }}</span>
            </div>
          </div>

          <button
            class="w-full py-2 rounded-lg border border-primary-100 text-primary-700 font-bold hover:bg-primary-50 transition-colors"
            @click="startEdit(p)"
          >
            Edit Program
          </button>
        </div>
      </div>
    </div>

    <!-- Edit View -->
    <div
      v-else
      class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
    >
      <h2 class="text-2xl font-bold mb-6">
        {{ form.slug ? "Edit Program" : "Create Program" }}
      </h2>

      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="col-span-2 md:col-span-1">
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Name</label
          >
          <input
            v-model="form.name"
            type="text"
            class="w-full border-slate-300 rounded-lg p-2"
          />
        </div>
        <div class="col-span-2 md:col-span-1">
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Slug</label
          >
          <input
            v-model="form.slug"
            type="text"
            class="w-full border-slate-300 rounded-lg p-2"
            :disabled="!editingProgram.isNew"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Description</label
          >
          <input
            v-model="form.description"
            type="text"
            class="w-full border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>

      <!-- Games Editor -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg text-slate-900">Games Sequence</h3>
          <button
            class="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-700"
            @click="addGame"
          >
            + Add Game
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(game, idx) in form.games"
            :key="idx"
            class="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 items-start md:items-center"
          >
            <div class="flex flex-col gap-1">
              <button
                :disabled="idx === 0"
                class="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                @click="moveGame(idx, -1)"
              >
                ▲
              </button>
              <span class="text-center font-bold text-xs text-slate-500">{{
                idx + 1
              }}</span>
              <button
                :disabled="idx === form.games.length - 1"
                class="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                @click="moveGame(idx, 1)"
              >
                ▼
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full">
              <div class="col-span-1">
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
                  >Title</label
                >
                <input
                  v-model="game.title"
                  type="text"
                  class="w-full border-slate-300 rounded p-1.5 text-sm"
                />
              </div>

              <div class="col-span-1">
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
                  >Paper Color</label
                >
                <div class="flex gap-2">
                  <input
                    v-model="game.paperColor"
                    type="color"
                    class="h-8 w-10 p-0 border-0 rounded"
                  />
                  <input
                    v-model="game.paperColor"
                    type="text"
                    class="w-full border-slate-300 rounded p-1.5 text-sm"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>

              <div class="col-span-1">
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
                  >Pattern</label
                >
                <select
                  v-model="game.patternSlug"
                  class="w-full border-slate-300 rounded p-1.5 text-sm"
                >
                  <option v-for="p in patterns" :key="p.slug" :value="p.slug">
                    {{ p.name }}
                  </option>
                </select>
              </div>

              <div class="col-span-1">
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
                  >Notes</label
                >
                <input
                  v-model="game.notes"
                  type="text"
                  class="w-full border-slate-300 rounded p-1.5 text-sm"
                  placeholder="Optional..."
                />
              </div>
            </div>

            <div class="flex flex-col items-center">
              <div v-if="game.patternSlug" class="mb-2">
                <!-- Small Preview -->
                <BingoPatternGrid
                  v-if="getPattern(game.patternSlug)"
                  :name="getPattern(game.patternSlug).name"
                  :definition="getPattern(game.patternSlug).definition"
                  :fill-color="game.paperColor"
                  size="xs"
                />
              </div>
              <button
                class="text-red-400 hover:text-red-600 text-xs font-bold"
                @click="removeGame(idx)"
              >
                Remove
              </button>
            </div>
          </div>

          <div
            v-if="form.games.length === 0"
            class="text-center py-8 text-slate-400 italic"
          >
            No games added yet.
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button
          class="px-6 py-2 text-slate-500 font-bold hover:text-slate-700"
          @click="cancelEdit"
        >
          Cancel
        </button>
        <button
          :disabled="isSaving"
          class="px-6 py-2 bg-gold text-primary-900 font-bold rounded-lg shadow hover:bg-gold-400 disabled:opacity-50"
          @click="saveProgram"
        >
          {{ isSaving ? "Saving..." : "Save Program" }}
        </button>
      </div>
    </div>
  </div>
</template>
