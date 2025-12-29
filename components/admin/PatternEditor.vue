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
  definition: {
    frames: [] as number[][][],
    interval: 500,
  },
});

const currentFrameIndex = ref(0);

const startEdit = (p?: any) => {
  if (p) {
    form.value = JSON.parse(
      JSON.stringify({
        slug: p.slug,
        name: p.name,
        description: p.description,
        isAnimated: p.isAnimated,
        definition: p.definition,
      }),
    );
  } else {
    // New
    form.value = {
      slug: "",
      name: "",
      description: "",
      isAnimated: false,
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="p in patterns"
          :key="p.id"
          class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-bold text-slate-900">{{ p.name }}</h3>
            <button
              class="text-red-400 hover:text-red-600"
              @click="deletePattern(p.slug)"
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

          <div class="flex items-center justify-between text-xs text-slate-500">
            <span>{{ p.slug }}</span>
            <span
              v-if="p.isAnimated"
              class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
              >Animated</span
            >
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
