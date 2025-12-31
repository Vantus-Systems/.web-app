<template>
  <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] h-full">
    <!-- Library Sidebar -->
    <div class="h-full flex flex-col bg-surface border border-divider rounded-xl overflow-hidden shadow-sm">
      <div class="p-4 space-y-3 border-b border-divider bg-base/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">Library</p>
            <h3 class="text-lg font-bold text-primary">Patterns</h3>
          </div>
          <button
            class="text-xs font-bold text-accent-primary border border-divider bg-surface hover:bg-base rounded-lg px-3 py-1.5 transition-colors"
            @click="startEdit()"
          >
            + New
          </button>
        </div>
        <div class="relative">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search patterns..."
            class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
          />
        </div>
        <select
          v-model="activeCategory"
          class="w-full rounded-lg border-divider bg-base px-2 py-1.5 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none"
        >
          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      <div class="flex-1 p-2 space-y-1 overflow-y-auto">
        <button
          v-for="p in filteredPatterns"
          :key="p.id"
          class="w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-200 group"
          :class="
            editingPattern?.slug === p.slug
              ? 'border-accent-primary bg-accent-primary/5 shadow-sm'
              : 'border-transparent hover:bg-base hover:border-divider'
          "
          @click="startEdit(p)"
        >
          <div class="flex justify-between items-start">
            <div class="text-sm font-bold text-primary group-hover:text-accent-primary transition-colors">{{ p.name }}</div>
            <div v-if="p.isAnimated" class="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">ANIM</div>
          </div>
          <div class="text-[10px] uppercase tracking-widest text-secondary mt-1">
            {{ p.category || "Uncategorized" }}
          </div>
        </button>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="flex flex-col gap-4 h-full overflow-y-auto">
      <div class="flex items-center justify-between shrink-0">
        <div>
          <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">Pattern Studio</p>
          <h3 class="text-xl font-bold text-primary">
            {{ form.name || "Select a Pattern" }}
          </h3>
        </div>
        <div class="flex gap-2">
          <button
            class="text-xs font-bold uppercase tracking-wider border border-divider bg-surface hover:bg-base text-secondary hover:text-primary rounded-lg px-3 py-2 transition-colors"
            :disabled="!editingPattern"
            @click="duplicatePattern"
          >
            Duplicate
          </button>
          <button
            class="text-xs font-bold uppercase tracking-wider border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg px-3 py-2 transition-colors"
            :disabled="!editingPattern || editingPattern?.isNew"
            @click="deletePattern"
          >
            Delete
          </button>
        </div>
      </div>

      <div class="bg-surface border border-divider rounded-xl p-8 flex flex-col items-center gap-6 shadow-sm flex-1 min-h-[400px] justify-center relative">
        <div class="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div class="text-xs font-bold uppercase tracking-widest text-secondary">Canvas</div>
          <div class="flex items-center gap-2 bg-base rounded-lg p-1">
            <button class="p-1 hover:bg-white rounded text-secondary hover:text-primary transition-colors" @click="prevFrame">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span class="text-xs font-mono font-bold text-primary w-16 text-center">
              {{ currentFrameIndex + 1 }} / {{ form.definition.frames.length }}
            </span>
            <button class="p-1 hover:bg-white rounded text-secondary hover:text-primary transition-colors" @click="nextFrame">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-5 gap-2 bg-base p-3 rounded-xl shadow-inner">
          <div
            v-for="(val, idx) in activeFrame"
            :key="idx"
            class="w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 shadow-sm border border-divider/50"
            :class="[
              val === 1 && idx !== 12 ? 'bg-accent-primary scale-105 border-accent-primary' : 'bg-surface hover:bg-gray-50',
              idx === 12 ? 'bg-base cursor-not-allowed opacity-50' : ''
            ]"
            @click="toggleCell(idx)"
          >
            <span v-if="idx === 12" class="text-[10px] font-bold text-secondary">FREE</span>
          </div>
        </div>

        <!-- Timeline -->
        <div v-if="form.definition.frames.length > 1" class="w-full overflow-x-auto pb-2 flex justify-center">
          <div class="flex gap-2 p-2 bg-base rounded-xl">
            <button
              v-for="(_, idx) in form.definition.frames"
              :key="idx"
              class="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
              :class="
                currentFrameIndex === idx
                  ? 'bg-accent-primary text-white shadow-md scale-110'
                  : 'bg-surface text-secondary hover:bg-white'
              "
              @click="currentFrameIndex = idx"
            >
              {{ idx + 1 }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="text-xs font-bold text-accent-primary hover:text-accent-primary/80 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-accent-primary/5 transition-colors"
            :disabled="!form.isAnimated"
            @click="addFrame"
          >
            <span>+ Add Frame</span>
          </button>
          <button
            class="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            :disabled="form.definition.frames.length <= 1"
            @click="removeFrame(currentFrameIndex)"
          >
            <span>Remove Frame</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Inspector Panel -->
    <div class="h-full bg-surface border border-divider rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div class="p-4 border-b border-divider bg-base/30">
        <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">Inspector</p>
        <h3 class="text-lg font-bold text-primary">Details</h3>
      </div>

      <div class="p-4 space-y-6 overflow-y-auto flex-1">
        <div class="space-y-4">
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
              :disabled="!editingPattern?.isNew"
            />
          </label>
          <label class="block">
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">Category</span>
            <input
              v-model="form.category"
              class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
            />
          </label>
          <label class="block">
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">Tags</span>
            <input
              v-model="tagsInput"
              class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              placeholder="Comma separated"
            />
          </label>
          <label class="flex items-center gap-3 p-3 rounded-lg border border-divider bg-base/50 cursor-pointer hover:bg-base transition-colors">
            <input v-model="form.isAnimated" type="checkbox" class="rounded text-accent-primary focus:ring-accent-primary" />
            <span class="text-xs font-bold text-primary uppercase tracking-wider">Animated Pattern</span>
          </label>
        </div>

        <div class="border-t border-divider pt-6 space-y-4">
          <div class="text-xs font-bold uppercase tracking-widest text-secondary">Generators</div>
          <label class="flex items-center gap-3">
            <input v-model="rotationEnabled" type="checkbox" class="rounded text-accent-primary focus:ring-accent-primary" />
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">Rotational Symmetry</span>
          </label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="permutationLines"
              type="number"
              min="1"
              max="12"
              class="w-20 rounded-lg border-divider bg-base text-sm px-3 py-2 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none"
            />
            <span class="text-xs text-secondary">Lines Required</span>
          </div>
          <button
            class="w-full text-xs font-bold uppercase tracking-widest border border-divider hover:border-accent-primary hover:text-accent-primary py-2.5 rounded-lg transition-all bg-surface hover:bg-base"
            @click="generatePermutations"
          >
            Generate
          </button>
          <p v-if="error" class="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">{{ error }}</p>
        </div>

        <div class="border-t border-divider pt-6 space-y-4">
          <div class="text-xs font-bold uppercase tracking-widest text-secondary">Preview</div>
          <div class="flex items-center gap-2 bg-base p-1 rounded-lg">
            <button class="flex-1 py-1.5 text-xs font-bold text-secondary hover:text-primary hover:bg-white rounded transition-colors" @click="togglePlay">
              {{ isPlaying ? "Pause" : "Play Animation" }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-divider bg-base/30">
        <button
          class="w-full bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg shadow-sm transition-all transform active:scale-[0.98]"
          @click="savePattern"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
type Cell = 0 | 1;
type Frame = Cell[];
import {
  generateLinePermutations,
  rotatePatternCells,
} from "~/utils/pattern.utils";

const props = defineProps<{
  patterns: any[];
}>();

const emit = defineEmits<{
  (e: "save", pattern: any): void;
  (e: "delete", slug: string): void;
}>();

const editingPattern = ref<any>(null);
const searchTerm = ref("");
const activeCategory = ref("All");
const error = ref("");

const form = ref({
  slug: "",
  name: "",
  description: "",
  isAnimated: false,
  category: "",
  tags: [] as string[],
  activeSessions: [] as string[],
  definition: {
    frames: [
      Array(25)
        .fill(0)
        .map((_, i) => (i === 12 ? 1 : 0)),
    ],
    interval: 500,
  },
});

const currentFrameIndex = ref(0);
const rotationEnabled = ref(false);
const permutationLines = ref(3);
const isPlaying = ref(false);
let playInterval: number | null = null;

const normalizeFrame = (frame: any): Frame => {
  let arr: number[] = [];
  if (!frame) {
    arr = Array.from({ length: 25 }, (_, i) => (i === 12 ? 1 : 0));
  } else if (frame.length === 5 && Array.isArray(frame[0])) {
    arr = (frame.flat() as any[]).map((v: any) => (v ? 1 : 0));
  } else if (Array.isArray(frame)) {
    arr = (frame as any[]).map((v: any) => (v ? 1 : 0));
  } else {
    arr = Array(25).fill(0);
  }
  if (arr.length < 25) {
    arr = [...arr, ...Array(25 - arr.length).fill(0)];
  } else if (arr.length > 25) {
    arr = arr.slice(0, 25);
  }
  arr[12] = 1;
  return arr as Frame;
};

const startEdit = (p?: any) => {
  if (p) {
    const def = JSON.parse(JSON.stringify(p.definition));
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

const duplicatePattern = () => {
  if (!editingPattern.value) return;
  const copy = JSON.parse(JSON.stringify(form.value));
  copy.slug = `${copy.slug || "pattern"}-copy`;
  copy.name = `${copy.name || "Pattern"} (Copy)`;
  editingPattern.value = { isNew: true };
  form.value = copy;
};

const deletePattern = () => {
  if (!editingPattern.value?.slug) return;
  emit("delete", editingPattern.value.slug);
  editingPattern.value = null;
};

const savePattern = () => {
  emit("save", form.value);
};

const categories = computed(() => {
  const defaults = [
    "All",
    "Regular",
    "Standard",
    "Sunday",
    "Double Action",
    "Jackpot",
  ];
  const dynamic = props.patterns
    .map((p) => p.category)
    .filter((c) => c && typeof c === "string") as string[];
  return Array.from(new Set([...defaults, ...dynamic]));
});

const filteredPatterns = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return props.patterns.filter((p) => {
    const matchesCategory =
      activeCategory.value === "All" ||
      (p.category && p.category === activeCategory.value);
    const matchesSearch =
      !term ||
      p.name?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
});

const activeFrame = computed<Frame>(() => {
  return normalizeFrame(form.value.definition.frames?.[currentFrameIndex.value]);
});

const toggleCell = (idx: number) => {
  if (idx === 12) return;
  const frame = [...activeFrame.value];
  frame[idx] = frame[idx] === 1 ? 0 : 1;
  frame[12] = 1;
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

const prevFrame = () => {
  currentFrameIndex.value =
    (currentFrameIndex.value - 1 + form.value.definition.frames.length) %
    form.value.definition.frames.length;
};

const nextFrame = () => {
  currentFrameIndex.value =
    (currentFrameIndex.value + 1) % form.value.definition.frames.length;
};

const tagsInput = computed({
  get: () => form.value.tags.join(", "),
  set: (value: string) => {
    form.value.tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  },
});

const generatePermutations = () => {
  if (permutationLines.value <= 0 || permutationLines.value > 12) {
    error.value = "Lines required must be between 1 and 12.";
    return;
  }
  const base = activeFrame.value;
  const permutations = generateLinePermutations(base, permutationLines.value);
  form.value.definition.frames = rotationEnabled.value
    ? permutations.map((frame) => rotatePatternCells(frame))
    : permutations;
  form.value.isAnimated = form.value.definition.frames.length > 1;
  currentFrameIndex.value = 0;
  error.value = "";
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
};

watch(
  () => rotationEnabled.value,
  (enabled) => {
    if (!enabled) {
      form.value.definition.frames = [activeFrame.value];
      currentFrameIndex.value = 0;
      return;
    }
    const base = activeFrame.value;
    const rot90 = rotatePatternCells(base);
    const rot180 = rotatePatternCells(rot90);
    const rot270 = rotatePatternCells(rot180);
    const frames = [base, rot90, rot180, rot270].filter(
      (frame, index, self) =>
        self.findIndex((item) => item.join("") === frame.join("")) === index,
    );
    form.value.definition.frames = frames;
    form.value.isAnimated = frames.length > 1;
    currentFrameIndex.value = 0;
  },
);

watch(
  () => isPlaying.value,
  (playing) => {
    if (playing) {
      playInterval = window.setInterval(() => {
        nextFrame();
      }, form.value.definition.interval);
    } else if (playInterval) {
      window.clearInterval(playInterval);
      playInterval = null;
    }
  },
);

onBeforeUnmount(() => {
  if (playInterval) window.clearInterval(playInterval);
});
</script>
