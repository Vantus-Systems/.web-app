<template>
  <div class="h-full flex flex-col bg-white border-r border-slate-200">
    <div class="p-4 border-b border-slate-200">
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
        Profile Library
      </h3>
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search profiles..."
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <button
        v-for="profile in filteredProfiles"
        :key="profile.id"
        class="w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 group relative"
        :class="[
          selectedProfileId === profile.id
            ? 'bg-primary-50 border-primary-200 shadow-sm'
            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200',
        ]"
        @click="$emit('select', profile.id)"
      >
        <div class="flex items-center justify-between mb-1">
          <span
            class="text-sm font-bold"
            :class="selectedProfileId === profile.id ? 'text-primary-700' : 'text-slate-700'"
          >
            {{ profile.name }}
          </span>
          <div
            v-if="selectedProfileId === profile.id"
            class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"
          />
        </div>
        <div class="text-[10px] text-slate-400 group-hover:text-slate-500">
          {{ profile.timeline?.operationalHours?.start }} - {{ profile.timeline?.operationalHours?.end }}
        </div>
      </button>

      <div v-if="filteredProfiles.length === 0" class="text-center py-8">
        <p class="text-xs text-slate-400">No profiles found.</p>
      </div>
    </div>
    
    <!-- Footer actions -->
    <div class="p-3 border-t border-slate-200 bg-slate-50">
      <button
        class="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-primary-600 py-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
        @click="$emit('clear')"
      >
        <span>Esc</span>
        <span>Clear Selection</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  profiles: any[];
  selectedProfileId: string | null;
}>();

const emit = defineEmits(["select", "clear"]);

const search = ref("");

const filteredProfiles = computed(() => {
  if (!search.value) return props.profiles;
  const q = search.value.toLowerCase();
  return props.profiles.filter(p => p.name.toLowerCase().includes(q));
});
</script>
