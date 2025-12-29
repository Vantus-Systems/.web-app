<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOpsStore } from '~/stores/ops';
import PricingEditor from './PricingEditor.vue';
import PatternEditor from './PatternEditor.vue';
import ProgramEditor from './ProgramEditor.vue';
import ScheduleEditor from './ScheduleEditor.vue';
import { Save } from 'lucide-vue-next';

const opsStore = useOpsStore();
const currentStep = ref('pricing'); // pricing | patterns | programs | schedule

onMounted(() => {
  opsStore.loadAll();
});

const steps = [
  { id: 'pricing', label: 'Pricing Templates' },
  { id: 'patterns', label: 'Pattern Library' },
  { id: 'programs', label: 'Program Builder' },
  { id: 'schedule', label: 'Calendar / Schedule' }
];

const opsSchemaMeta = computed(() => opsStore.opsSchemaDraft?.meta);
const opsSchemaStatus = computed(() => opsSchemaMeta.value?.status || "draft");
const opsSchemaName = computed(() => opsSchemaMeta.value?.profile_name || "Operations Schema");

const handleSave = async () => {
    if (opsStore.dirty.pricing) await opsStore.savePricing();
    if (opsStore.dirty.schedule) await opsStore.saveSchedule();
    if (opsStore.dirty.opsSchema) await opsStore.saveOpsSchema();
    if (opsStore.dirty.scheduleDayProfiles) await opsStore.saveScheduleDayProfiles();
};

const handlePatternSave = (p: any) => opsStore.savePattern(p);
const handlePatternDelete = (slug: string) => opsStore.deletePattern(slug);
const handleProgramSave = (p: any) => opsStore.saveProgram(p);
const handleProgramDelete = (slug: string) => opsStore.deleteProgram(slug);

const updateOpsSchemaMeta = (updates: Record<string, any>) => {
  if (!opsStore.opsSchemaDraft) return;
  opsStore.updateOpsSchemaDraft({
    ...opsStore.opsSchemaDraft,
    meta: {
      ...opsStore.opsSchemaDraft.meta,
      ...updates,
    },
  });
};

const createDraft = () => {
  updateOpsSchemaMeta({ status: "draft" });
};

const publishSchema = async () => {
  if (!opsStore.opsSchemaDraft) return;
  const errors = [];
  if (!Object.keys(opsStore.opsSchemaDraft.definitions?.rate_cards ?? {}).length) {
    errors.push("At least one rate card is required.");
  }
  if (!opsStore.opsSchemaDraft.timeline_configuration?.flow_segments?.length) {
    errors.push("At least one flow segment is required.");
  }
  if (!opsStore.programs.length) {
    errors.push("At least one program is required.");
  }
  if (errors.length > 0) {
    alert(`Cannot publish:\n\n${errors.join("\n")}`);
    return;
  }
  await opsStore.publishOpsSchema();
};

const rollbackSchema = () => {
  opsStore.rollbackOpsSchema();
};
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50 border-t border-slate-200">
    <div class="flex flex-1 min-h-0">
        <!-- Sidebar -->
        <div class="w-64 bg-white border-r border-slate-200 flex flex-col py-6 overflow-y-auto">
        <nav class="space-y-1 px-4">
            <button
            v-for="step in steps"
            :key="step.id"
            class="w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors text-left"
            :class="currentStep === step.id ? 'bg-primary-50 text-primary-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
            @click="currentStep = step.id"
            >
            {{ step.label }}
            </button>
        </nav>
        </div>

        <div class="flex-1 flex flex-col min-w-0">
        <!-- Command Bar -->
        <div class="border-b border-slate-200 bg-white shadow-sm z-10 shrink-0">
            <div class="px-8 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">Operations Schema</p>
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl font-black text-primary-900">{{ opsSchemaName }}</h2>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                      opsSchemaStatus === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700',
                    ]"
                  >
                    {{ opsSchemaStatus }}
                  </span>
                </div>
                <p class="text-xs text-slate-500">
                  {{ opsSchemaMeta?.timezone ?? "—" }} • {{ opsSchemaMeta?.currency ?? "—" }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2 items-center">
                <button
                  class="px-3 py-2 text-xs font-bold uppercase tracking-[0.3em] rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  @click="createDraft"
                >
                  Create Draft
                </button>
                <button
                  class="px-3 py-2 text-xs font-bold uppercase tracking-[0.3em] rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  @click="rollbackSchema"
                >
                  Rollback
                </button>
                <button
                  class="px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  @click="publishSchema"
                >
                  Publish
                </button>
              </div>
            </div>

            <div class="h-16 border-t border-slate-100 flex items-center justify-between px-8">
                <div class="flex gap-6">
                    <div class="flex items-center gap-2">
                    <div :class="['w-2 h-2 rounded-full', opsStore.pricingReady ? 'bg-emerald-500' : 'bg-slate-300']"></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Pricing</span>
                    </div>
                    <div class="flex items-center gap-2">
                    <div :class="['w-2 h-2 rounded-full', opsStore.patternsReady ? 'bg-emerald-500' : 'bg-slate-300']"></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Patterns</span>
                    </div>
                    <div class="flex items-center gap-2">
                    <div :class="['w-2 h-2 rounded-full', opsStore.programsReady ? 'bg-emerald-500' : 'bg-slate-300']"></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Programs</span>
                    </div>
                </div>

                <div class="flex gap-4 items-center">
                    <div v-if="opsStore.hasUnsavedChanges" class="text-amber-600 font-bold text-xs uppercase tracking-wide flex items-center animate-pulse">
                        Unsaved Changes
                    </div>
                    <button
                        v-if="opsStore.hasUnsavedChanges"
                        @click="handleSave"
                        class="flex items-center gap-2 bg-primary-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-800 transition shadow-lg shadow-primary-900/20"
                    >
                        <Save class="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8">
            <div v-if="opsStore.loading && !opsStore.pricing" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
            </div>
            <div v-else>
                <div v-if="currentStep === 'pricing' && opsStore.pricingDraft" class="fade-enter-active">
                    <PricingEditor
                        :modelValue="opsStore.pricingDraft"
                        :isSaving="false"
                        @update:modelValue="opsStore.updatePricingDraft"
                        @save="handleSave"
                    />
                </div>

                <div v-if="currentStep === 'patterns'">
                    <PatternEditor
                        :patterns="opsStore.patterns"
                        @save="handlePatternSave"
                        @delete="handlePatternDelete"
                    />
                </div>

                <div v-if="currentStep === 'programs'">
                    <ProgramEditor
                        :programs="opsStore.programs"
                        :patterns="opsStore.patterns"
                        @save="handleProgramSave"
                        @delete="handleProgramDelete"
                        @navigate="(step) => currentStep = step"
                    />
                </div>

                <div v-if="currentStep === 'schedule' && opsStore.scheduleDraft">
                    <ScheduleEditor
                        :modelValue="opsStore.scheduleDraft"
                        :isSaving="false"
                        :pricingData="opsStore.pricingDraft"
                        :programs="opsStore.programs"
                        :dayProfiles="opsStore.scheduleDayProfilesDraft"
                        @update:modelValue="opsStore.updateScheduleDraft"
                        @update:dayProfiles="opsStore.updateScheduleDayProfilesDraft"
                        @save="handleSave"
                    />
                </div>
            </div>
        </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
