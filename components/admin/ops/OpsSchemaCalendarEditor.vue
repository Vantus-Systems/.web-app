<template>
  <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px] h-[720px]">
    <DayProfileLibrary
      :profiles="dayProfiles"
      :selected-id="selectedProfileId"
      @select="selectProfile"
      @add="addProfile"
    />

    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Paint the Calendar
          </p>
          <h3 class="text-xl font-black text-primary-900">Master Schedule</h3>
        </div>
        <div class="flex gap-2">
          <BaseButton
            variant="outline"
            class-name="text-xs px-3 py-2"
            @click="toggleStats"
          >
            {{ showStats ? "Hide" : "Show" }} Stats
          </BaseButton>
        </div>
      </div>

      <div v-if="showStats" class="grid grid-cols-3 gap-3 text-xs">
        <div class="bg-white border border-slate-200 rounded-lg px-3 py-2">
          <div class="text-slate-400 uppercase tracking-widest text-[10px]">
            Assigned
          </div>
          <div class="text-lg font-bold text-slate-900">
            {{ stats.assigned }}
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg px-3 py-2">
          <div class="text-slate-400 uppercase tracking-widest text-[10px]">
            Closed
          </div>
          <div class="text-lg font-bold text-slate-900">{{ stats.closed }}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg px-3 py-2">
          <div class="text-slate-400 uppercase tracking-widest text-[10px]">
            Unassigned
          </div>
          <div class="text-lg font-bold text-slate-900">
            {{ stats.unassigned }}
          </div>
        </div>
      </div>

      <MasterCalendarCanvas
        :month-label="monthLabel"
        :days="calendarDays"
        :week-days="weekDays"
        :selected-dates="selectedDates"
        @select="selectDate"
        @assign="assignDate"
        @prev="prevMonth"
        @next="nextMonth"
      />
    </div>

    <transition name="slide-fade">
      <div v-if="selectedDates.length || selectedProfile" class="h-full">
        <div
          v-if="selectedProfile"
          class="bg-white border-l border-slate-200 p-4 space-y-4"
        >
          <div>
            <p
              class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
            >
              Profile Inspector
            </p>
            <h3 class="text-lg font-black text-primary-900">
              {{ selectedProfile.name }}
            </h3>
          </div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Name
            <input
              v-model="selectedProfile.name"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            />
          </label>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Category
            <select
              v-model="selectedProfile.category"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            >
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
              <option value="special">Special</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Color
            <input
              v-model="selectedProfile.color"
              type="color"
              class="mt-1 w-12 h-10 border-0 bg-transparent"
            />
          </label>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Description
            <textarea
              v-model="selectedProfile.description"
              rows="2"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            ></textarea>
          </label>
          <div class="border-t border-slate-100 pt-4">
            <p
              class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-2"
            >
              Flow Segments
            </p>
            <div class="grid gap-2 md:grid-cols-2">
              <label
                v-for="segment in flowSegments"
                :key="segment.id"
                class="flex items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  :checked="selectedProfile.segment_ids.includes(segment.id)"
                  @change="toggleSegment(segment.id)"
                />
                {{ segment.label }}
              </label>
            </div>
          </div>
          <div class="border-t border-slate-100 pt-4">
            <p
              class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-2"
            >
              Overlay Events
            </p>
            <div class="grid gap-2 md:grid-cols-2">
              <label
                v-for="event in overlayEvents"
                :key="event.id"
                class="flex items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  :checked="
                    selectedProfile.overlay_event_ids.includes(event.id)
                  "
                  @change="toggleOverlay(event.id)"
                />
                {{ event.label }}
              </label>
            </div>
          </div>
          <button
            class="text-xs font-bold text-rose-500 border border-rose-200 rounded-lg px-2 py-2"
            @click="removeProfile"
          >
            Remove Profile
          </button>
        </div>

        <DayProfileInspector
          v-else
          :selected-dates="selectedDates"
          :profiles="dayProfiles"
          :assignments="draft.calendar.assignments"
          :weekday-defaults="draft.calendar.weekdayDefaults"
          :overrides="draft.calendar.overrides"
          :flow-segments="flowSegments"
          :overlay-events="overlayEvents"
          @apply="applyAssignment"
          @smart-fill="applySmartFill"
          @update-overrides="updateOverrides"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";
import DayProfileLibrary from "~/components/admin/ops/DayProfileLibrary.vue";
import MasterCalendarCanvas from "~/components/admin/ops/MasterCalendarCanvas.vue";
import DayProfileInspector from "~/components/admin/ops/DayProfileInspector.vue";

const props = defineProps<{
  modelValue: OpsSchemaV2;
}>();

const emit = defineEmits(["update:modelValue"]);

const isSyncing = ref(false);
const cloneDraft = (value: OpsSchemaV2) =>
  JSON.parse(JSON.stringify(toRaw(value)));
const draft = ref(cloneDraft(props.modelValue));

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const selectedProfileId = ref<string | null>(null);
const selectedDates = ref<string[]>([]);
const showStats = ref(false);

const dayProfiles = computed(() => draft.value.dayProfiles ?? []);
const flowSegments = computed(() => draft.value.timeline.flowSegments ?? []);
const overlayEvents = computed(() => draft.value.timeline.overlayEvents ?? []);

const selectedProfile = computed(() =>
  dayProfiles.value.find((profile) => profile.id === selectedProfileId.value),
);

const viewDate = ref(new Date());

const monthLabel = computed(() =>
  viewDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
);

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    const directAssignment = draft.value.calendar.assignments[iso];
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const fallbackAssignment = draft.value.calendar.weekdayDefaults[weekday];
    const assignment = directAssignment || fallbackAssignment;
    const profile = assignment?.profile_id
      ? dayProfiles.value.find((p) => p.id === assignment.profile_id)
      : undefined;
    days.push({
      date: iso,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      assignment,
      profile,
      isFallback: !directAssignment,
    });
  }
  return days;
});

const stats = computed(() => {
  const assigned = calendarDays.value.filter(
    (day) => day.assignment?.status === "open" && day.assignment.profile_id,
  ).length;
  const closed = calendarDays.value.filter(
    (day) => day.assignment?.status === "closed",
  ).length;
  const unassigned = calendarDays.value.length - assigned - closed;
  return { assigned, closed, unassigned };
});

const selectProfile = (id: string) => {
  selectedProfileId.value = id;
  selectedDates.value = [];
};

const selectDate = (payload: { date: string; multi: boolean }) => {
  selectedProfileId.value = null;
  if (payload.multi) {
    if (selectedDates.value.includes(payload.date)) {
      selectedDates.value = selectedDates.value.filter(
        (d) => d !== payload.date,
      );
    } else {
      selectedDates.value = [...selectedDates.value, payload.date];
    }
    return;
  }
  selectedDates.value = [payload.date];
};

const addProfile = () => {
  const id = `profile-${Date.now()}`;
  draft.value.dayProfiles.push({
    id,
    name: "New Profile",
    category: "weekday",
    segment_ids: [],
    overlay_event_ids: [],
    description: "",
    color: "#64748b",
  });
  selectedProfileId.value = id;
};

const removeProfile = () => {
  if (!selectedProfile.value) return;
  draft.value.dayProfiles = dayProfiles.value.filter(
    (profile) => profile.id !== selectedProfile.value?.id,
  );
  selectedProfileId.value = null;
};

const toggleSegment = (segmentId: string) => {
  if (!selectedProfile.value) return;
  const list = selectedProfile.value.segment_ids;
  if (list.includes(segmentId)) {
    selectedProfile.value.segment_ids = list.filter((id) => id !== segmentId);
  } else {
    selectedProfile.value.segment_ids.push(segmentId);
  }
};

const toggleOverlay = (eventId: string) => {
  if (!selectedProfile.value) return;
  const list = selectedProfile.value.overlay_event_ids;
  if (list.includes(eventId)) {
    selectedProfile.value.overlay_event_ids = list.filter(
      (id) => id !== eventId,
    );
  } else {
    selectedProfile.value.overlay_event_ids.push(eventId);
  }
};

const assignDate = (payload: { date: string; profileId: string }) => {
  draft.value.calendar.assignments[payload.date] = {
    status: "open",
    profile_id: payload.profileId,
  };
  selectedDates.value = [payload.date];
};

const applyAssignment = (payload: { dates: string[]; assignment: any }) => {
  payload.dates.forEach((date) => {
    draft.value.calendar.assignments[date] = payload.assignment;
  });
};

const applySmartFill = (payload: { day: string; profileId: string }) => {
  const start = new Date(`${draft.value.calendar.range.start}T00:00:00`);
  const end = new Date(`${draft.value.calendar.range.end}T00:00:00`);
  let cursor = new Date(start);
  while (cursor <= end) {
    const weekday = cursor.toLocaleDateString("en-US", { weekday: "short" });
    if (weekday === payload.day) {
      const date = cursor.toISOString().slice(0, 10);
      draft.value.calendar.assignments[date] = {
        status: "open",
        profile_id: payload.profileId,
      };
    }
    cursor.setDate(cursor.getDate() + 1);
  }
};

const updateOverrides = (payload: {
  date: string;
  overrides: Array<{ id: string; profile_id: string; reason?: string }>;
}) => {
  draft.value.calendar.overrides[payload.date] = payload.overrides;
};

const prevMonth = () => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() - 1,
    1,
  );
};

const nextMonth = () => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() + 1,
    1,
  );
};

const toggleStats = () => {
  showStats.value = !showStats.value;
};

watch(
  () => props.modelValue,
  (value) => {
    isSyncing.value = true;
    draft.value = cloneDraft(value);
    nextTick(() => {
      isSyncing.value = false;
    });
  },
  { deep: true, immediate: true },
);

watch(
  draft,
  (value) => {
    if (!isSyncing.value) {
      emit("update:modelValue", cloneDraft(value));
    }
  },
  { deep: true },
);
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
