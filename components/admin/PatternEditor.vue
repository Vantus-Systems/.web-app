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
            <h3 class="text-lg font-black text-primary-900">Patterns</h3>
          </div>
          <button
            class="text-xs font-bold text-primary-700 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50"
            @click="startEdit()"
          >
            + New
          </button>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search patterns..."
          class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-xs"
        />
        <select
          v-model="activeCategory"
          class="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-xs"
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
      <div class="px-4 pb-4 space-y-2 overflow-y-auto">
        <button
          v-for="p in filteredPatterns"
          :key="p.id"
          class="w-full text-left rounded-xl border px-3 py-2"
          :class="
            editingPattern?.slug === p.slug
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          "
          @click="startEdit(p)"
        >
          <div class="text-sm font-bold text-slate-900">{{ p.name }}</div>
          <div class="text-[10px] uppercase tracking-widest text-slate-400">
            {{ p.category || "Uncategorized" }}
          </div>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Pattern Studio
          </p>
          <h3 class="text-xl font-black text-primary-900">
            {{ form.name || "Select a Pattern" }}
          </h3>
        </div>
        <div class="flex gap-2">
          <button
            class="text-xs font-bold uppercase tracking-[0.2em] border border-slate-200 rounded-lg px-3 py-2"
            :disabled="!editingPattern"
            @click="duplicatePattern"
          >
            Duplicate
          </button>
          <button
            class="text-xs font-bold uppercase tracking-[0.2em] border border-rose-200 text-rose-600 rounded-lg px-3 py-2"
            :disabled="!editingPattern || editingPattern?.isNew"
            @click="deletePattern"
          >
            Delete
          </button>
        </div>
      </div>

      <div
        class="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center gap-4"
      >
        <div class="flex items-center justify-between w-full">
          <div
            class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400"
          >
            Canvas
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs font-bold text-slate-500" @click="prevFrame">
              Prev
            </button>
            <span class="text-xs font-bold text-slate-600"
              >Frame {{ currentFrameIndex + 1 }}</span
            >
            <button class="text-xs font-bold text-slate-500" @click="nextFrame">
              Next
            </button>
          </div>
        </div>
        <div
          class="grid grid-cols-5 gap-1 bg-slate-200 p-1 rounded-lg w-64 h-64"
        >
          <div
            v-for="(val, idx) in activeFrame"
            :key="idx"
            class="bg-white flex items-center justify-center rounded cursor-pointer hover:bg-slate-50 transition-colors"
            :style="
              val === 1 && idx !== 12 ? { backgroundColor: '#eab308' } : {}
            "
            @click="toggleCell(idx)"
          >
            <span v-if="idx === 12" class="text-[10px] font-bold text-slate-400"
              >FREE</span
            >
          </div>
        </div>
        <div
          v-if="form.definition.frames.length > 1"
          class="flex gap-2 overflow-x-auto pb-2"
        >
          <button
            v-for="(_, idx) in form.definition.frames"
            :key="idx"
            class="px-3 py-1 rounded text-xs font-bold"
            :class="
              currentFrameIndex === idx
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600'
            "
            @click="currentFrameIndex = idx"
          >
            {{ idx + 1 }}
          </button>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="text-xs font-bold text-slate-600"
            :disabled="!form.isAnimated"
            @click="addFrame"
          >
            + Frame
          </button>
          <button
            class="text-xs font-bold text-rose-500"
            :disabled="form.definition.frames.length <= 1"
            @click="removeFrame(currentFrameIndex)"
          >
            Remove Frame
          </button>
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
        <h3 class="text-lg font-black text-primary-900">Pattern Details</h3>
      </div>

      <div class="space-y-3">
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
            :disabled="!editingPattern?.isNew"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Category
          <input
            v-model="form.category"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Tags
          <input
            v-model="tagsInput"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
        <label
          class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <input v-model="form.isAnimated" type="checkbox" class="rounded" />
          Animated
        </label>
      </div>

      <div class="border-t border-slate-100 pt-4 space-y-3">
        <div
          class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400"
        >
          Rotation & Permutations
        </div>
        <label
          class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <input v-model="rotationEnabled" type="checkbox" class="rounded" />
          Rotational Symmetry
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="permutationLines"
            type="number"
            min="1"
            max="12"
            class="w-16 rounded-lg border-slate-200 bg-slate-50 text-xs px-2 py-1"
          />
          <span class="text-xs text-slate-500">Lines Required</span>
        </div>
        <button
          class="w-full text-xs font-bold uppercase tracking-[0.3em] border border-slate-200 py-2 rounded-lg"
          @click="generatePermutations"
        >
          Calculate Permutations
        </button>
        <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
      </div>

      <div class="border-t border-slate-100 pt-4 space-y-2">
        <div
          class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400"
        >
          Preview Player
        </div>
        <div class="flex items-center gap-2">
          <button class="text-xs font-bold text-slate-600" @click="togglePlay">
            {{ isPlaying ? "Pause" : "Play" }}
          </button>
          <button class="text-xs font-bold text-slate-600" @click="nextFrame">
            Next
          </button>
        </div>
      </div>

      <div class="pt-4">
        <button
          class="w-full bg-gold text-primary-900 text-xs font-bold uppercase tracking-[0.3em] py-2 rounded-lg"
          @click="savePattern"
        >
          Save Pattern
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
