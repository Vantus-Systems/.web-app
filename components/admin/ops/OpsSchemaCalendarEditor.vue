<template>
  <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
    <BaseCard class-name="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Day Profiles
          </p>
          <h3 class="text-lg font-black text-primary-900">Library</h3>
        </div>
        <BaseButton variant="outline" class-name="text-xs px-3 py-2" @click="addProfile">
          + Add
        </BaseButton>
      </div>

      <div class="space-y-2">
        <button
          v-for="profile in dayProfiles"
          :key="profile.id"
          class="w-full text-left rounded-xl border px-3 py-3 transition"
          :class="selectedProfileId === profile.id
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-200 bg-white hover:border-slate-300'"
          @click="selectedProfileId = profile.id"
        >
          <p class="text-sm font-bold text-primary-900">{{ profile.name }}</p>
          <p class="text-[10px] uppercase tracking-widest text-slate-400">
            {{ profile.category }}
          </p>
        </button>
      </div>
    </BaseCard>

    <BaseCard class-name="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Profile Builder
          </p>
          <h3 class="text-xl font-black text-primary-900">
            {{ selectedProfile?.name || "Select a Profile" }}
          </h3>
        </div>
        <BaseButton
          v-if="selectedProfile"
          variant="outline"
          class-name="text-xs px-3 py-2 text-rose-600 border-rose-200"
          @click="removeProfile"
        >
          Remove
        </BaseButton>
      </div>

      <div v-if="selectedProfile" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Name
            <input v-model="selectedProfile.name" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50" />
          </label>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Category
            <select v-model="selectedProfile.category" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50">
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
              <option value="special">Special</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Description
          <textarea v-model="selectedProfile.description" rows="2" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"></textarea>
        </label>

        <div class="border-t border-slate-100 pt-4">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">
            Flow Segments
          </p>
          <div class="grid gap-2 md:grid-cols-2">
            <label v-for="segment in flowSegments" :key="segment.id" class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                :checked="selectedProfile.segment_ids.includes(segment.id)"
                @change="toggleSegment(segment.id)"
              />
              {{ segment.label }} ({{ segment.time_start }} → {{ segment.time_end }})
            </label>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">
            Overlay Events
          </p>
          <div class="grid gap-2 md:grid-cols-2">
            <label v-for="event in overlayEvents" :key="event.id" class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                :checked="selectedProfile.overlay_event_ids.includes(event.id)"
                @change="toggleOverlay(event.id)"
              />
              {{ event.label }} ({{ event.time_start }} → {{ event.time_end }})
            </label>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-slate-400">
        Select a profile to assign segments and overlay events.
      </p>
    </BaseCard>

    <BaseCard class-name="p-4 space-y-6">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Calendar Assignments
        </p>
        <h3 class="text-lg font-black text-primary-900">Weekday Grid</h3>
      </div>

      <div class="space-y-3">
        <div v-for="day in weekDays" :key="day" class="flex items-center justify-between gap-3">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
            {{ day }}
          </span>
          <select
            class="flex-1 rounded-lg border-slate-200 bg-slate-50 text-xs"
            :value="calendarAssignments[day] || ''"
            @change="setWeekdayAssignment(day, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Unassigned</option>
            <option v-for="profile in dayProfiles" :key="profile.id" :value="profile.id">
              {{ profile.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-4 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Date Overrides
          </h4>
          <BaseButton variant="outline" class-name="text-xs px-2 py-1" @click="addOverride">
            + Add
          </BaseButton>
        </div>

        <div v-for="override in overrideEntries" :key="override.id" class="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
          <input
            v-model="override.date"
            type="date"
            class="w-full rounded-lg border-slate-200 bg-slate-50 text-xs"
          />
          <select
            v-model="override.profileId"
            class="w-full rounded-lg border-slate-200 bg-slate-50 text-xs"
          >
            <option value="">Select Profile</option>
            <option v-for="profile in dayProfiles" :key="profile.id" :value="profile.id">
              {{ profile.name }}
            </option>
          </select>
          <button
            class="text-xs font-bold text-rose-500"
            @click="removeOverride(override.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from "vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";

const props = defineProps<{
  modelValue: OpsSchemaV2;
}>();

const emit = defineEmits(["update:modelValue"]);

const isSyncing = ref(false);
const cloneDraft = (value: OpsSchemaV2) => JSON.parse(JSON.stringify(toRaw(value)));
const draft = ref(cloneDraft(props.modelValue));

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const selectedProfileId = ref<string | null>(null);

const dayProfiles = computed(() => draft.value.day_profiles ?? []);
const flowSegments = computed(() => draft.value.timeline_configuration.flow_segments ?? []);
const overlayEvents = computed(() => draft.value.timeline_configuration.overlay_events ?? []);
const calendarAssignments = computed(() => draft.value.calendar.assignments ?? {});

const selectedProfile = computed(() =>
  dayProfiles.value.find((profile) => profile.id === selectedProfileId.value),
);

const addProfile = () => {
  const id = `profile-${Date.now()}`;
  draft.value.day_profiles.push({
    id,
    name: "New Profile",
    category: "weekday",
    segment_ids: [],
    overlay_event_ids: [],
    description: "",
  });
  selectedProfileId.value = id;
};

const removeProfile = () => {
  if (!selectedProfile.value) return;
  draft.value.day_profiles = dayProfiles.value.filter(
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
    selectedProfile.value.overlay_event_ids = list.filter((id) => id !== eventId);
  } else {
    selectedProfile.value.overlay_event_ids.push(eventId);
  }
};

const setWeekdayAssignment = (day: string, profileId: string) => {
  draft.value.calendar.assignments = {
    ...draft.value.calendar.assignments,
    [day]: profileId || undefined,
  };
  if (!profileId) {
    delete draft.value.calendar.assignments[day];
  }
};

type OverrideEntry = { id: string; date: string; profileId: string };
const overrideEntries = ref<OverrideEntry[]>([]);

const syncOverrideEntries = () => {
  const entries: OverrideEntry[] = [];
  Object.entries(draft.value.calendar.overrides ?? {}).forEach(
    ([date, overrides]) => {
      overrides.forEach((entry: any) => {
        entries.push({ id: entry.id, date, profileId: entry.profile_id });
      });
    },
  );
  overrideEntries.value = entries;
};

const addOverride = () => {
  overrideEntries.value = [
    ...overrideEntries.value,
    { id: `override-${Date.now()}`, date: "", profileId: "" },
  ];
};

const removeOverride = (id: string) => {
  overrideEntries.value = overrideEntries.value.filter((entry) => entry.id !== id);
};

watch(
  () => props.modelValue,
  (value) => {
    isSyncing.value = true;
    draft.value = cloneDraft(value);
    syncOverrideEntries();
    nextTick(() => {
      isSyncing.value = false;
    });
  },
  { deep: true, immediate: true },
);

watch(
  overrideEntries,
  (entries) => {
    const overrides: Record<string, Array<{ id: string; profile_id: string }>> = {};
    entries.forEach((entry) => {
      if (!entry.date || !entry.profileId) return;
      if (!overrides[entry.date]) overrides[entry.date] = [];
      overrides[entry.date].push({ id: entry.id, profile_id: entry.profileId });
    });
    draft.value.calendar.overrides = overrides;
  },
  { deep: true },
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
