<script setup lang="ts">
import { ref, computed } from "vue";
import BingoPatternGrid from "~/components/bingo/BingoPatternGrid.vue";

const props = defineProps<{
  patterns: any[];
}>();

const emit = defineEmits<{
  (e: "save", pattern: any): void;
  (e: "delete", slug: string): void;
}>();

const editingPattern = ref<any>(null); // null means list view, object means edit mode

// Editor State
const form = ref({
  slug: "",
  name: "",
  description: "",
  isAnimated: false,
  category: "",
  tags: [] as string[],
  activeSessions: [] as string[],
  definition: {
    frames: [] as number[][][],
    interval: 500,
  },
});

const currentFrameIndex = ref(0);
const searchTerm = ref("");
const activeFilter = ref("All");

// Helper to normalize frame data (handle legacy 5x5 or flat)
const normalizeFrame = (frame: any): number[] => {
  if (!frame) return Array(25).fill(0);
  if (frame.length === 5 && Array.isArray(frame[0])) {
    return frame.flat() as number[];
  }
  if (Array.isArray(frame)) {
    return frame as number[];
  }
  return Array(25).fill(0);
};

const startEdit = (p?: any) => {
  if (p) {
    const def = JSON.parse(JSON.stringify(p.definition));
    // Normalize frames to ensure they are flat arrays
    if (def.frames && Array.isArray(def.frames)) {
      def.frames = def.frames.map((f: any) => normalizeFrame(f));
    }

    form.value = {
      slug: p.slug,
      name: p.name,
      description: p.description,
      isAnimated: p.isAnimated,
      category: p.category || "",
      tags: p.tags || [],
      activeSessions: p.activeSessions || [],
      definition: def,
    };
  } else {
    // New
    form.value = {
      slug: "",
      name: "",
      description: "",
      isAnimated: false,
      category: "",
      tags: [],
      activeSessions: [],
      definition: {
        frames: [
          Array(25)
            .fill(0)
            .map((_, i) => (i === 12 ? 1 : 0)),
        ],
        interval: 500,
      },
    };
  }
  currentFrameIndex.value = 0;
  editingPattern.value = p || { isNew: true };
};

const cancelEdit = () => {
  editingPattern.value = null;
};

const savePattern = () => {
  emit("save", form.value);
  editingPattern.value = null;
};

const deletePattern = (slug: string) => {
  if (!confirm("Are you sure? This may break programs using this pattern."))
    return;
  emit("delete", slug);
};

const duplicatePattern = (pattern: any) => {
  startEdit(pattern);
  form.value.slug = `${pattern.slug}-copy`;
  form.value.name = `${pattern.name} (Copy)`;
  editingPattern.value = { isNew: true };
};

// Frame Editor
const activeFrame = computed(() => {
  if (!form.value.definition.frames[currentFrameIndex.value]) {
    return Array(25).fill(0);
  }
  return form.value.definition.frames[currentFrameIndex.value];
});

const toggleCell = (idx: number) => {
  const frame = [...activeFrame.value];
  frame[idx] = frame[idx] === 1 ? 0 : 1;
  form.value.definition.frames[currentFrameIndex.value] = frame;
};

const addFrame = () => {
  form.value.definition.frames.push(Array(25).fill(0));
  currentFrameIndex.value = form.value.definition.frames.length - 1;
};

const removeFrame = (idx: number) => {
  if (form.value.definition.frames.length <= 1) return;
  form.value.definition.frames.splice(idx, 1);
  if (currentFrameIndex.value >= form.value.definition.frames.length) {
    currentFrameIndex.value = form.value.definition.frames.length - 1;
  }
};

const getPatternFrame = (p: any) => {
  if (!p.definition.frames || !p.definition.frames[0]) return Array(25).fill(0);
  const f = p.definition.frames[0];
  if (f.length === 5 && Array.isArray(f[0])) {
    return f.flat();
  }
  return f;
};

const categories = computed(() => {
  const defaults = ["All", "Regular", "Standard", "Sunday", "Double Action", "Jackpot"];
  const dynamic = props.patterns
    .map((p) => p.category)
    .filter((c) => c && typeof c === "string") as string[];
  return Array.from(new Set([...defaults, ...dynamic]));
});

const filteredPatterns = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return props.patterns.filter((p) => {
    const matchesCategory =
      activeFilter.value === "All" ||
      (p.category && p.category === activeFilter.value);
    const matchesSearch =
      !term ||
      p.name?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term) ||
      (p.tags || []).some((tag: string) => tag.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });
});

const tagsInput = computed({
  get: () => form.value.tags.join(", "),
  set: (value: string) => {
    form.value.tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  },
});

const activeSessionsInput = computed({
  get: () => form.value.activeSessions.join(", "),
  set: (value: string) => {
    form.value.activeSessions = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  },
});
</script>

<template>
  <div>
    <!-- List View -->
    <div v-if="!editingPattern" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-slate-900">Bingo Patterns</h2>
        <button
          class="bg-gold text-primary-900 px-4 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors"
          @click="startEdit()"
        >
          New Pattern
        </button>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category"
            class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
            :class="
              activeFilter === category
                ? 'bg-primary-900 text-white border-primary-900'
                : 'bg-white text-slate-500 border-slate-200'
            "
            @click="activeFilter = category"
          >
            {{ category }}
          </button>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search patterns..."
          class="w-full lg:w-64 rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="p in filteredPatterns"
          :key="p.id"
          class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-bold text-slate-900">{{ p.name }}</h3>
            <details class="relative">
              <summary class="list-none cursor-pointer text-slate-400 hover:text-slate-600">
                •••
              </summary>
              <div class="absolute right-0 mt-2 w-36 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                <button
                  class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                  @click="startEdit(p)"
                >
                  Edit
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                  @click="duplicatePattern(p)"
                >
                  Duplicate
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  @click="deletePattern(p.slug)"
                >
                  Delete
                </button>
              </div>
            </details>
          </div>

          <div
            class="flex justify-center mb-4 cursor-pointer"
            @click="startEdit(p)"
          >
            <BingoPatternGrid
              :name="p.name"
              :definition="{ ...p.definition, frames: [getPatternFrame(p)] }"
              size="sm"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{{ p.slug }}</span>
            <span
              v-if="p.category"
              class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
              >{{ p.category }}</span
            >
            <span
              v-if="p.isAnimated"
              class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
              >Animated</span
            >
            <span
              v-for="tag in (p.tags || []).slice(0, 2)"
              :key="`${p.slug}-${tag}`"
              class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit View -->
    <div
      v-else
      class="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
    >
      <h2 class="text-2xl font-bold mb-6">
        {{ form.slug ? "Edit Pattern" : "Create Pattern" }}
      </h2>

      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Name</label
          >
          <input
            v-model="form.name"
            type="text"
            class="w-full border-slate-300 rounded-lg p-2"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1"
              >Slug</label
            >
            <input
              v-model="form.slug"
              type="text"
              class="w-full border-slate-300 rounded-lg p-2"
              :disabled="!editingPattern.isNew"
            />
          </div>
          <div class="flex items-center mt-6">
            <input
              id="anim"
              v-model="form.isAnimated"
              type="checkbox"
              class="rounded text-gold focus:ring-gold"
            />
            <label for="anim" class="ml-2 text-sm font-bold text-slate-700"
              >Animated Pattern</label
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Description</label
          >
          <textarea
            v-model="form.description"
            class="w-full border-slate-300 rounded-lg p-2"
            rows="2"
          ></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1"
              >Category</label
            >
            <input
              v-model="form.category"
              type="text"
              class="w-full border-slate-300 rounded-lg p-2"
              placeholder="e.g. Sunday"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1"
              >Tags (comma separated)</label
            >
            <input
              v-model="tagsInput"
              type="text"
              class="w-full border-slate-300 rounded-lg p-2"
              placeholder="animated, high-stakes"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Active Sessions (comma separated)</label
          >
          <input
            v-model="activeSessionsInput"
            type="text"
            class="w-full border-slate-300 rounded-lg p-2"
            placeholder="Morning, Sunday Premier"
          />
        </div>

        <div v-if="form.isAnimated">
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Interval (ms)</label
          >
          <input
            v-model="form.definition.interval"
            type="number"
            step="50"
            min="50"
            max="5000"
            class="w-full border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>

      <!-- Grid Editor -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-bold text-slate-700"
            >Frames ({{ form.definition.frames.length }})</label
          >
          <div class="space-x-2">
            <button
              v-if="form.isAnimated"
              class="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
              @click="addFrame"
            >
              + Add Frame
            </button>
          </div>
        </div>

        <div
          v-if="form.definition.frames.length > 1"
          class="flex gap-2 overflow-x-auto mb-4 pb-2"
        >
          <button
            v-for="(_, idx) in form.definition.frames"
            :key="idx"
            class="px-3 py-1 rounded text-xs font-bold shrink-0"
            :class="
              currentFrameIndex === idx
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600'
            "
            @click="currentFrameIndex = idx"
          >
            Frame {{ idx + 1 }}
          </button>
        </div>

        <div class="flex flex-col items-center">
          <div
            class="grid grid-cols-5 gap-1 bg-slate-200 p-1 rounded mb-4 w-64 h-64"
          >
            <div
              v-for="(val, idx) in activeFrame"
              :key="idx"
              class="bg-white flex items-center justify-center rounded cursor-pointer hover:bg-slate-50 transition-colors"
              :style="
                val === 1 || idx === 12
                  ? { backgroundColor: idx === 12 ? undefined : '#eab308' }
                  : {}
              "
              @click="toggleCell(idx)"
            >
              <span v-if="idx === 12" class="text-xs font-bold text-slate-400"
                >FREE</span
              >
            </div>
          </div>

          <button
            v-if="form.definition.frames.length > 1"
            class="text-red-500 text-xs hover:underline"
            @click="removeFrame(currentFrameIndex)"
          >
            Delete Current Frame
          </button>
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
          class="px-6 py-2 bg-gold text-primary-900 font-bold rounded-lg shadow hover:bg-gold-400"
          @click="savePattern"
        >
          Save Pattern
        </button>
      </div>
    </div>
  </div>
</template>
