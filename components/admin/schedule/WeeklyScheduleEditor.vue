<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useScheduleStore } from "~/stores/schedule";
import { useOpsStore } from "~/stores/ops";
import { useToast } from "~/composables/useToast";
import {
  Trash2,
  AlertCircle,
  Save,
  UploadCloud,
  Search,
  GripVertical,
} from "lucide-vue-next";
import { DAYS_OF_WEEK, type WeeklyScheduleSlot } from "~/types/schedule";

const scheduleStore = useScheduleStore();
const opsStore = useOpsStore();
const toast = useToast();

const selectedSlotId = ref<string | null>(null);
const searchQuery = ref("");
const draggingProgram = ref<string | null>(null);

onMounted(async () => {
  await Promise.all([
    scheduleStore.fetchDraft(),
    scheduleStore.fetchVersions(),
    opsStore.refreshPrograms(),
  ]);
});

const slots = computed(() => scheduleStore.draft?.slots || []);
const programs = computed(() => opsStore.programs || []);

const filteredPrograms = computed(() => {
  if (!searchQuery.value) return programs.value;
  const q = searchQuery.value.toLowerCase();
  return programs.value.filter(
    (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
  );
});

// Grid Generation
const START_HOUR = 9;
const END_HOUR = 27; // 3 AM next day
const INTERVAL = 30;

const timeSlots = computed(() => {
  const times = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += INTERVAL) {
      const hour = h % 24;
      const timeString = `${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      times.push({
        label: timeString,
        value: h * 60 + m,
      });
    }
  }
  return times;
});

const getSlotsForDay = (dayIndex: number) => {
  return slots.value.filter((s) => s.day_of_week === dayIndex);
};

const getSlotStyle = (slot: WeeklyScheduleSlot) => {
  const [h, m] = slot.start_time.split(":").map(Number);
  // Adjust for next day (hours < START_HOUR are next day)
  let minutes = h * 60 + m;
  if (h < START_HOUR) minutes += 24 * 60;

  const startMinutes = START_HOUR * 60;
  const top = ((minutes - startMinutes) / INTERVAL) * 40; // 40px per 30min
  const height = (slot.duration_minutes / INTERVAL) * 40;

  return {
    top: `${top}px`,
    height: `${height}px`,
    position: "absolute" as const,
    left: "4px",
    right: "4px",
  };
};

const handleDragStart = (event: DragEvent, programSlug: string) => {
  draggingProgram.value = programSlug;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", programSlug);
  }
};

const handleDrop = (event: DragEvent, dayIndex: number, timeVal: number) => {
  const programSlug =
    draggingProgram.value || event.dataTransfer?.getData("text/plain");
  if (!programSlug) return;

  // Calculate time string
  let h = Math.floor(timeVal / 60);
  const m = timeVal % 60;
  if (h >= 24) h -= 24;
  const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  const newSlot: WeeklyScheduleSlot = {
    id: crypto.randomUUID(),
    day_of_week: dayIndex,
    start_time: timeString,
    duration_minutes: 60, // Default 1 hour
    program_slug: programSlug,
  };

  addSlot(newSlot);
  draggingProgram.value = null;
};

const addSlot = (slot: WeeklyScheduleSlot) => {
  const newSlots = [...slots.value, slot];
  scheduleStore.updateDraftLocal(newSlots);
  selectedSlotId.value = slot.id!;
};

const updateSelectedSlot = (updates: Partial<WeeklyScheduleSlot>) => {
  if (!selectedSlotId.value) return;
  const index = slots.value.findIndex((s) => s.id === selectedSlotId.value);
  if (index === -1) return;

  const updatedSlots = [...slots.value];
  updatedSlots[index] = { ...updatedSlots[index], ...updates };
  scheduleStore.updateDraftLocal(updatedSlots);
};

const deleteSelectedSlot = () => {
  if (!selectedSlotId.value) return;
  const newSlots = slots.value.filter((s) => s.id !== selectedSlotId.value);
  scheduleStore.updateDraftLocal(newSlots);
  selectedSlotId.value = null;
};

const selectedSlot = computed(() =>
  slots.value.find((s) => s.id === selectedSlotId.value),
);

const getProgram = (slug: string) =>
  programs.value.find((p) => p.slug === slug);

const saveDraft = async () => {
  const result = await scheduleStore.saveDraft(slots.value);
  if (result?.success) {
    toast.success("Schedule draft saved");
  } else {
    toast.error(result?.error || "Failed to save draft");
  }
};

defineExpose({
  triggerSave: async () => {
    await saveDraft();
  },
});

const publish = async () => {
  if (
    !confirm(
      "Are you sure you want to publish this schedule? This will update the live public schedule.",
    )
  )
    return;
  const result = await scheduleStore.publish();
  if (result?.success) {
    toast.success("Schedule published successfully");
  } else {
    toast.error(result?.error || "Failed to publish");
  }
};

const onGridClick = (dayIndex: number, timeVal: number) => {
  // Check if clicked on existing slot handled by div click
  // Here we handle clicking on empty space

  // Calculate time string
  let h = Math.floor(timeVal / 60);
  const m = timeVal % 60;
  if (h >= 24) h -= 24;
  const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  // If we have a selected program in clipboard or something... but for now just add a placeholder or ask
  // User requirement: "Add slot by clicking grid cell"
  // Let's add a default slot if programs exist
  if (programs.value.length === 0) {
    toast.error("Create a program first");
    return;
  }

  const newSlot: WeeklyScheduleSlot = {
    id: crypto.randomUUID(),
    day_of_week: dayIndex,
    start_time: timeString,
    duration_minutes: 60,
    program_slug: programs.value[0].slug,
  };
  addSlot(newSlot);
};
</script>

<template>
  <div class="flex h-full bg-base overflow-hidden">
    <!-- Left Pane: Program Library -->
    <div class="w-64 bg-surface border-r border-divider flex flex-col shrink-0">
      <div class="p-4 border-b border-divider">
        <h3
          class="font-bold text-sm text-secondary uppercase tracking-wider mb-2"
        >
          Programs
        </h3>
        <div class="relative">
          <Search
            class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search programs..."
            class="w-full bg-base border border-input rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        <div
          v-for="program in filteredPrograms"
          :key="program.slug"
          draggable="true"
          class="p-3 bg-base border border-divider rounded-lg hover:border-primary/50 cursor-grab active:cursor-grabbing group transition-all"
          @dragstart="handleDragStart($event, program.slug)"
        >
          <div class="flex items-center gap-2">
            <GripVertical class="w-4 h-4 text-muted group-hover:text-primary" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ program.name }}</div>
              <div class="text-xs text-secondary truncate">
                {{ program.slug }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="programs.length === 0"
          class="p-4 text-center text-sm text-secondary"
        >
          No programs found. Go to Programs tab to create one.
        </div>
      </div>
    </div>

    <!-- Center Pane: Schedule Grid -->
    <div class="flex-1 flex flex-col min-w-0 bg-base">
      <!-- Toolbar -->
      <div
        class="h-14 border-b border-divider flex items-center justify-between px-4 bg-surface shrink-0"
      >
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-primary">Weekly Schedule</h2>
          <div
            v-if="scheduleStore.dirty"
            class="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase"
          >
            <AlertCircle class="w-4 h-4" />
            Unsaved Changes
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary bg-base border border-divider rounded-lg hover:bg-surface transition-colors"
            :disabled="scheduleStore.saving"
            @click="saveDraft"
          >
            <Save
              class="w-4 h-4"
              :class="{ 'animate-pulse': scheduleStore.saving }"
            />
            Save
          </button>

          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg shadow-sm transition-colors"
            :disabled="scheduleStore.publishing"
            @click="publish"
          >
            <UploadCloud
              class="w-4 h-4"
              :class="{ 'animate-pulse': scheduleStore.publishing }"
            />
            Publish
          </button>
        </div>
      </div>

      <!-- Grid Content -->
      <div class="flex-1 overflow-auto relative">
        <div class="min-w-[800px] flex">
          <!-- Time Labels -->
          <div
            class="w-16 flex-shrink-0 bg-surface border-r border-divider z-10 sticky left-0"
          >
            <div class="h-10 border-b border-divider"></div>
            <!-- Header spacer -->
            <div
              v-for="slot in timeSlots"
              :key="slot.value"
              class="h-[40px] text-xs text-right pr-2 pt-1 text-secondary border-b border-divider/30"
            >
              {{ slot.label }}
            </div>
          </div>

          <!-- Days Columns -->
          <div class="flex-1 flex">
            <div
              v-for="(day, dayIndex) in DAYS_OF_WEEK"
              :key="day"
              class="flex-1 min-w-[120px] border-r border-divider relative"
            >
              <!-- Day Header -->
              <div
                class="h-10 border-b border-divider bg-surface sticky top-0 z-10 flex items-center justify-center font-medium text-sm text-secondary"
              >
                {{ day }}
              </div>

              <!-- Grid Cells -->
              <div class="relative">
                <div
                  v-for="slot in timeSlots"
                  :key="slot.value"
                  class="h-[40px] border-b border-divider/30 hover:bg-accent-primary/5 transition-colors"
                  @click="onGridClick(dayIndex, slot.value)"
                  @dragover.prevent
                  @drop="handleDrop($event, dayIndex, slot.value)"
                ></div>

                <!-- Placed Slots -->
                <div
                  v-for="slot in getSlotsForDay(dayIndex)"
                  :key="slot.id"
                  class="absolute rounded border shadow-sm cursor-pointer overflow-hidden transition-all text-xs p-1"
                  :class="
                    selectedSlotId === slot.id
                      ? 'bg-accent-primary text-white border-accent-primary z-20 ring-2 ring-accent-primary/30'
                      : 'bg-surface text-primary border-input hover:border-primary z-10'
                  "
                  :style="getSlotStyle(slot)"
                  @click.stop="selectedSlotId = slot.id"
                >
                  <div class="font-bold truncate">
                    {{
                      getProgram(slot.program_slug)?.name || slot.program_slug
                    }}
                  </div>
                  <div class="truncate opacity-80">
                    {{ slot.start_time }} ({{ slot.duration_minutes }}m)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Pane: Inspector -->
    <div
      v-if="selectedSlot"
      class="w-80 bg-surface border-l border-divider flex flex-col shrink-0"
    >
      <div
        class="p-4 border-b border-divider flex items-center justify-between"
      >
        <h3 class="font-bold text-sm text-secondary uppercase tracking-wider">
          Slot Details
        </h3>
        <button
          class="text-accent-warning hover:bg-accent-warning/10 p-1.5 rounded-md transition-colors"
          title="Delete Slot"
          @click="deleteSelectedSlot"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>

      <div class="p-4 space-y-4 overflow-y-auto flex-1">
        <div class="space-y-1">
          <label class="text-xs font-medium text-secondary">Program</label>
          <select
            :value="selectedSlot.program_slug"
            class="w-full bg-base border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            @change="
              updateSelectedSlot({
                program_slug: ($event.target as HTMLSelectElement).value,
              })
            "
          >
            <option v-for="p in programs" :key="p.slug" :value="p.slug">
              {{ p.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-medium text-secondary">Start Time</label>
            <input
              type="time"
              :value="selectedSlot.start_time"
              class="w-full bg-base border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              @change="
                updateSelectedSlot({
                  start_time: ($event.target as HTMLInputElement).value,
                })
              "
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-secondary"
              >Duration (min)</label
            >
            <input
              type="number"
              :value="selectedSlot.duration_minutes"
              step="30"
              min="30"
              class="w-full bg-base border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              @change="
                updateSelectedSlot({
                  duration_minutes: parseInt(
                    ($event.target as HTMLInputElement).value,
                  ),
                })
              "
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-secondary">Day</label>
          <select
            :value="selectedSlot.day_of_week"
            class="w-full bg-base border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            @change="
              updateSelectedSlot({
                day_of_week: parseInt(
                  ($event.target as HTMLSelectElement).value,
                ),
              })
            "
          >
            <option v-for="(day, idx) in DAYS_OF_WEEK" :key="idx" :value="idx">
              {{ day }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div
      v-else
      class="w-80 bg-surface border-l border-divider flex items-center justify-center text-secondary text-sm p-8 text-center"
    >
      Select a slot to edit or drag a program from the left to add one.
    </div>
  </div>
</template>
