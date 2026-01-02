<template>
  <div class="h-full flex flex-col bg-surface border-r border-divider">
    <div class="p-4 border-b border-divider">
      <h3 class="text-xs font-bold text-tertiary uppercase tracking-[0.2em] mb-2">
        Profile Library
      </h3>
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search profiles..."
          class="w-full text-xs bg-base border border-divider rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all text-primary placeholder-tertiary"
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
            ? 'bg-accent-primary/10 border-accent-primary/20 shadow-sm'
            : 'bg-surface border-transparent hover:bg-base hover:border-divider',
        ]"
        @click="$emit('select', profile.id)"
      >
        <div class="flex items-center justify-between mb-1">
          <span
            class="text-sm font-bold"
            :class="selectedProfileId === profile.id ? 'text-accent-primary' : 'text-primary'"
          >
            {{ profile.name }}
          </span>
          <div
            v-if="selectedProfileId === profile.id"
            class="w-2 h-2 rounded-full bg-accent-primary animate-pulse"
          />
        </div>
        <div class="text-[10px] text-tertiary group-hover:text-secondary">
          {{ profile.timeline?.operationalHours?.start }} - {{ profile.timeline?.operationalHours?.end }}
        </div>
      </button>

      <div v-if="filteredProfiles.length === 0" class="text-center py-8">
        <p class="text-xs text-tertiary">No profiles found.</p>
      </div>
    </div>
    
    <!-- Footer actions -->
    <div class="p-3 border-t border-divider bg-base">
      <button
        class="w-full flex items-center justify-center gap-2 text-xs font-bold text-secondary hover:text-accent-primary py-2 rounded-lg hover:bg-surface border border-transparent hover:border-divider transition-all"
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
