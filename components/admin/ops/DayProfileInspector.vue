<template>
  <div class="h-full bg-white border-l border-slate-200 p-4 space-y-5">
    <div>
      <p
        class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
      >
        Inspector
      </p>
      <h3 class="text-lg font-black text-primary-900">
        {{ selectedLabel }}
      </h3>
    </div>

    <div v-if="selectedDates.length">
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
      >
        Assignment
      </label>
      <select
        v-model="selectedProfileId"
        class="w-full rounded-lg border-slate-200 bg-slate-50"
      >
        <option value="">Select Profile</option>
        <option
          v-for="profile in profiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.name }}
        </option>
      </select>
      <div class="flex items-center gap-2 mt-3">
        <input
          id="closed-toggle"
          v-model="closed"
          type="checkbox"
          class="rounded"
        />
        <label
          for="closed-toggle"
          class="text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Closed
        </label>
      </div>
      <button
        class="mt-3 w-full text-xs font-bold uppercase tracking-[0.3em] bg-primary-900 text-white py-2 rounded-lg"
        @click="applyAssignment"
      >
        Apply
      </button>
    </div>

    <div class="border-t border-slate-100 pt-4 space-y-3">
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Smart Fill
      </div>
      <select
        v-model="smartFillDay"
        class="w-full rounded-lg border-slate-200 bg-slate-50 text-xs"
      >
        <option v-for="day in weekDays" :key="day" :value="day">
          {{ day }}
        </option>
      </select>
      <select
        v-model="smartFillProfileId"
        class="w-full rounded-lg border-slate-200 bg-slate-50 text-xs"
      >
        <option value="">Select Profile</option>
        <option
          v-for="profile in profiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.name }}
        </option>
      </select>
      <button
        class="w-full text-xs font-bold uppercase tracking-[0.3em] border border-slate-200 py-2 rounded-lg"
        @click="emitSmartFill"
      >
        Apply to {{ smartFillDay }}s
      </button>
    </div>

    <div
      v-if="selectedDates.length === 1"
      class="border-t border-slate-100 pt-4 space-y-3"
    >
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Date Overrides
      </div>
      <select
        v-model="overrideProfileId"
        class="w-full rounded-lg border-slate-200 bg-slate-50 text-xs"
      >
        <option value="">Select Profile</option>
        <option
          v-for="profile in profiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.name }}
        </option>
      </select>
      <input
        v-model="overrideReason"
        type="text"
        placeholder="Reason (optional)"
        class="w-full rounded-lg border-slate-200 bg-slate-50 text-xs px-2 py-1"
      />
      <button
        class="w-full text-xs font-bold uppercase tracking-[0.3em] border border-slate-200 py-2 rounded-lg"
        @click="addOverride"
      >
        Add Override
      </button>

      <div v-if="currentOverrides.length" class="space-y-2">
        <div
          v-for="override in currentOverrides"
          :key="override.id"
          class="flex items-center justify-between gap-2 text-xs border border-slate-200 rounded-lg px-2 py-1"
        >
          <span>
            {{
              profiles.find((p) => p.id === override.profile_id)?.name ||
              "Profile"
            }}
          </span>
          <button
            class="text-rose-500 font-bold"
            @click="removeOverride(override.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <div v-if="agenda.length" class="border-t border-slate-100 pt-4 space-y-2">
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Agenda Preview
      </div>
      <div
        v-for="item in agenda"
        :key="item.id"
        class="text-xs text-slate-600 border border-slate-200 rounded-lg px-2 py-1"
      >
        {{ item.label }} • {{ item.time_start }}–{{ item.time_end }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  OpsSchemaCalendarAssignment,
  OpsSchemaDayProfile,
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
} from "~/types/ops-schema";

const props = defineProps<{
  selectedDates: string[];
  profiles: OpsSchemaDayProfile[];
  assignments: Record<string, OpsSchemaCalendarAssignment>;
  weekdayDefaults: Record<string, OpsSchemaCalendarAssignment>;
  overrides: Record<
    string,
    Array<{ id: string; profile_id: string; reason?: string }>
  >;
  flowSegments: OpsSchemaFlowSegment[];
  overlayEvents: OpsSchemaOverlayEvent[];
}>();

const emit = defineEmits<{
  (
    e: "apply",
    payload: { dates: string[]; assignment: OpsSchemaCalendarAssignment },
  ): void;
  (e: "smart-fill", payload: { day: string; profileId: string }): void;
  (
    e: "update-overrides",
    payload: {
      date: string;
      overrides: Array<{ id: string; profile_id: string; reason?: string }>;
    },
  ): void;
}>();

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const selectedLabel = computed(() => {
  if (!props.selectedDates.length) return "No Day Selected";
  if (props.selectedDates.length === 1) return props.selectedDates[0];
  return `${props.selectedDates.length} Days Selected`;
});

const selectedProfileId = ref("");
const closed = ref(false);

watch(
  () => props.selectedDates,
  (dates) => {
    if (dates.length === 1) {
      const weekday = new Date(`${dates[0]}T00:00:00`).toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        },
      );
      const assignment =
        props.assignments[dates[0]] || props.weekdayDefaults[weekday];
      selectedProfileId.value = assignment?.profile_id ?? "";
      closed.value = assignment?.status === "closed";
      return;
    }
    selectedProfileId.value = "";
    closed.value = false;
  },
  { immediate: true },
);

const applyAssignment = () => {
  const assignment: OpsSchemaCalendarAssignment = closed.value
    ? { status: "closed" }
    : { status: "open", profile_id: selectedProfileId.value || undefined };
  emit("apply", { dates: props.selectedDates, assignment });
};

const smartFillDay = ref("Mon");
const smartFillProfileId = ref("");
const emitSmartFill = () => {
  if (!smartFillProfileId.value) return;
  emit("smart-fill", {
    day: smartFillDay.value,
    profileId: smartFillProfileId.value,
  });
};

const agenda = computed(() => {
  if (props.selectedDates.length !== 1) return [];
  const date = props.selectedDates[0];
  const assignment =
    props.assignments[date] ||
    props.weekdayDefaults[
      new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
      })
    ];
  if (!assignment || assignment.status === "closed" || !assignment.profile_id)
    return [];
  const profile = props.profiles.find((p) => p.id === assignment.profile_id);
  if (!profile) return [];
  const segments = profile.segment_ids
    .map((id) => props.flowSegments.find((segment) => segment.id === id))
    .filter(Boolean) as OpsSchemaFlowSegment[];
  const overlays = profile.overlay_event_ids
    .map((id) => props.overlayEvents.find((event) => event.id === id))
    .filter(Boolean) as OpsSchemaOverlayEvent[];
  return [
    ...segments.map((segment) => ({
      id: segment.id,
      label: segment.label,
      time_start: segment.time_start,
      time_end: segment.time_end,
    })),
    ...overlays.map((event) => ({
      id: event.id,
      label: event.label,
      time_start: event.time_start,
      time_end: event.time_end,
    })),
  ];
});

const overrideProfileId = ref("");
const overrideReason = ref("");
const currentOverrides = computed(() => {
  if (props.selectedDates.length !== 1) return [];
  return props.overrides[props.selectedDates[0]] ?? [];
});

const addOverride = () => {
  if (props.selectedDates.length !== 1 || !overrideProfileId.value) return;
  const date = props.selectedDates[0];
  const nextOverrides = [
    ...currentOverrides.value,
    {
      id: `override-${Date.now()}`,
      profile_id: overrideProfileId.value,
      reason: overrideReason.value || undefined,
    },
  ];
  emit("update-overrides", { date, overrides: nextOverrides });
  overrideProfileId.value = "";
  overrideReason.value = "";
};

const removeOverride = (id: string) => {
  if (props.selectedDates.length !== 1) return;
  const date = props.selectedDates[0];
  const nextOverrides = currentOverrides.value.filter((item) => item.id !== id);
  emit("update-overrides", { date, overrides: nextOverrides });
};
</script>
