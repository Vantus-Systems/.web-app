<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const handleSave = async () => {
    if (opsStore.dirty.pricing) await opsStore.savePricing();
    if (opsStore.dirty.schedule) await opsStore.saveSchedule();
};

const handlePatternSave = (p: any) => opsStore.savePattern(p);
const handlePatternDelete = (slug: string) => opsStore.deletePattern(slug);
const handleProgramSave = (p: any) => opsStore.saveProgram(p);
const handleProgramDelete = (slug: string) => opsStore.deleteProgram(slug);
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
        <div class="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shadow-sm z-10 shrink-0">
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
                        @update:modelValue="opsStore.updateScheduleDraft"
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
