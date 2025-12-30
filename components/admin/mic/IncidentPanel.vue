<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-black text-primary-900">Operational Tickets</h3>
      <button
        type="button"
        class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600"
        @click="emit('create-incident')"
      >
        Report Issue
      </button>
    </div>
    <div v-if="incidents.length === 0" class="text-xs text-slate-400">
      No open incidents yet.
    </div>
    <div
      v-for="incident in incidents"
      :key="incident.id"
      class="border border-slate-100 rounded-lg p-3 bg-slate-50"
    >
      <div
        class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500"
      >
        <span>{{ incident.type }}</span>
        <span>{{ incident.status }}</span>
      </div>
      <p class="text-sm text-slate-700 font-bold mt-1">
        {{ incident.description }}
      </p>
      <p class="text-[10px] text-slate-400 mt-2">
        Reported by {{ incident.reported_by?.username ?? "MIC" }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncidentResponse } from "~/server/schemas/micIncident.zod";

const { incidents } = defineProps<{
  incidents: IncidentResponse[];
}>();

const emit = defineEmits<["create-incident"]>();
</script>
