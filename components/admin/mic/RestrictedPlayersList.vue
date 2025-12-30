<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-black text-primary-900">Restricted Players</h4>
      <NuxtLink
        to="/admin/mic/restricted-players"
        class="text-xs text-primary-600 font-bold"
        >Manage</NuxtLink
      >
    </div>
    <input
      v-model="query"
      type="text"
      placeholder="Search restricted player"
      class="w-full border border-slate-200 rounded-lg p-2 text-sm"
    />
    <div v-if="results.length === 0" class="text-xs text-slate-400">
      No matches yet.
    </div>
    <div
      v-for="player in results"
      :key="player.id"
      class="text-sm text-slate-700"
    >
      {{ player.name }}
      <span class="text-[10px] text-slate-400">{{ player.notes }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { RestrictedPlayerResponse } from "~/server/schemas/restrictedPlayer.zod";

const query = ref("");
const results = ref<RestrictedPlayerResponse[]>([]);

watch(
  query,
  async (value) => {
    if (!value) {
      results.value = [];
      return;
    }
    const response = await $fetch(
      `/api/admin/mic/restricted-players/search?query=${encodeURIComponent(value)}`,
      {
        credentials: "include",
      },
    );
    results.value = response;
  },
  { debounce: 500 },
);
</script>
