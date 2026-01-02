<template>
  <div class="h-full flex flex-col bg-surface border-r border-divider overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-divider bg-base/50">
      <h3 class="text-xs font-bold text-tertiary uppercase tracking-[0.2em] mb-3">
        Profile Library
      </h3>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search profiles..."
          class="w-full text-sm bg-base border border-divider rounded-lg px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary text-primary placeholder-tertiary transition-all"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-2.5 text-tertiary h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-2 bg-base/30">
      <!-- Standard Profiles -->
      <div v-if="standardProfiles.length > 0">
        <div class="px-2 py-1 text-[10px] font-bold text-tertiary uppercase">Standard</div>
        <div
          v-for="profile in standardProfiles"
          :key="profile.id"
          class="group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200"
          :class="activeToolProfileId === profile.id ? 'bg-primary text-surface border-primary shadow-lg ring-1 ring-primary' : 'bg-surface border-divider hover:border-secondary hover:shadow-md'"
          @click="$emit('select-tool', profile.id)"
        >
          <div class="flex flex-col">
            <span class="text-sm font-bold truncate pr-2">{{ profile.name }}</span>
            <span class="text-[10px] opacity-70 flex items-center gap-1">
              {{ profile.timeline?.operationalHours?.start || '??:??' }} - {{ profile.timeline?.operationalHours?.end || '??:??' }}
            </span>
          </div>
          <div
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: profile.color || '#ccc' }"
          ></div>
        </div>
      </div>

      <!-- Special Profiles -->
      <div v-if="specialProfiles.length > 0" class="mt-4">
        <div class="px-2 py-1 text-[10px] font-bold text-tertiary uppercase">Special Events</div>
        <div
          v-for="profile in specialProfiles"
          :key="profile.id"
          class="group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200"
          :class="activeToolProfileId === profile.id ? 'bg-accent-warning text-black border-accent-warning shadow-lg ring-1 ring-accent-warning' : 'bg-surface border-divider hover:border-accent-warning hover:shadow-md'"
          @click="$emit('select-tool', profile.id)"
        >
          <div class="flex flex-col">
            <span class="text-sm font-bold truncate pr-2">{{ profile.name }}</span>
            <span class="text-[10px] opacity-70">Special Event</span>
          </div>
          <div class="text-xs font-bold">★</div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProfiles.length === 0" class="p-4 text-center text-tertiary text-xs">
        No profiles found.
      </div>
    </div>
    
    <!-- Footer / Create New (Optional) -->
    <div class="p-4 border-t border-divider bg-surface">
      <button
        class="w-full py-2 border border-dashed border-divider text-secondary text-xs font-bold uppercase rounded-lg hover:border-accent-primary hover:text-accent-primary transition-colors flex items-center justify-center gap-2"
        @click="$emit('create-profile')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Profile
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  profiles: any[];
  activeToolProfileId: string | null;
}>();

defineEmits(["select-tool", "create-profile"]);

const searchQuery = ref("");

const filteredProfiles = computed(() => {
  if (!searchQuery.value) return props.profiles;
  const q = searchQuery.value.toLowerCase();
  return props.profiles.filter(p => p.name.toLowerCase().includes(q));
});

const standardProfiles = computed(() => filteredProfiles.value.filter(p => !p.isSpecial));
const specialProfiles = computed(() => filteredProfiles.value.filter(p => p.isSpecial));
</script>
