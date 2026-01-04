<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Grid,
  Layers,
  Calendar,
} from "lucide-vue-next";
import WeeklyScheduleEditor from "./schedule/WeeklyScheduleEditor.vue";
import PatternEditor from "./PatternEditor.vue";
import ProgramEditor from "./ProgramEditor.vue";
import { useOpsStore } from "~/stores/ops";
import { useToast } from "~/composables/useToast";

const opsStore = useOpsStore();
const toast = useToast();
const currentStep = ref("schedule"); // schedule | patterns | programs
const isProgramSaving = ref(false);
const isProgramDirty = ref(false);

onMounted(() => {
  opsStore.loadAll();
});

const steps = [
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "patterns", label: "Patterns", icon: Grid },
  { id: "programs", label: "Programs", icon: Layers },
];

const confirmNavigation = (stepId: string) => {
  if (currentStep.value === 'programs' && isProgramDirty.value) {
    if (!confirm("You have unsaved changes in the Program Editor. Discard them?")) {
      return;
    }
    isProgramDirty.value = false;
  }
  currentStep.value = stepId;
};

const handlePatternSave = async (p: any) => {
  try {
    await opsStore.savePattern(p);
    toast.success(`Pattern "${p?.name || "Untitled"}" saved.`, {
      title: "Pattern Saved",
    });
  } catch (e: any) {
    toast.error(e?.message || "Failed to save pattern.", { title: "Error" });
  }
};

const handlePatternDelete = async (slug: string) => {
  try {
    await opsStore.deletePattern(slug);
    toast.success("Pattern deleted.", { title: "Deleted" });
  } catch (e: any) {
    toast.error(e?.message || "Failed to delete pattern.", { title: "Error" });
  }
};

const handleProgramSave = async (p: any) => {
  isProgramSaving.value = true;
  try {
    const result = await opsStore.saveProgram(p);
    if (result.success) {
      toast.success(`Program "${p?.name || "Untitled"}" saved.`, {
        title: "Program Saved",
      });
      isProgramDirty.value = false;
    } else {
      toast.error(result.error || "Failed to save program.", {
        title: "Error",
      });
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to save program.", { title: "Error" });
  } finally {
    isProgramSaving.value = false;
  }
};
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col bg-base text-primary">
    <!-- Top Bar -->
    <header
      class="h-16 flex items-center justify-between px-6 border-b border-divider bg-surface shrink-0 z-20"
    >
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-black text-primary tracking-tight">
          Operations Builder
        </h1>
        <div class="h-6 w-px bg-divider"></div>
        <div class="flex bg-base rounded-lg p-1 border border-divider">
          <button
            v-for="step in steps"
            :key="step.id"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2"
            :class="
              currentStep === step.id
                ? 'bg-surface text-primary shadow-sm ring-1 ring-black/5'
                : 'text-secondary hover:text-primary hover:bg-surface/50'
            "
            @click="confirmNavigation(step.id)"
          >
            <component :is="step.icon" class="w-4 h-4" />
            {{ step.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden relative">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
        mode="out-in"
      >
        <div :key="currentStep" class="h-full w-full">
          <component
            :is="
              currentStep === 'schedule'
                ? WeeklyScheduleEditor
                : currentStep === 'patterns'
                  ? PatternEditor
                  : ProgramEditor
            "
            :patterns="opsStore.patterns"
            :programs="opsStore.programs"
            :saving="isProgramSaving"
            @save-pattern="handlePatternSave"
            @delete-pattern="handlePatternDelete"
            @save-program="handleProgramSave"
            @dirty="isProgramDirty = $event"
          />
        </div>
      </Transition>
    </main>
  </div>
</template>
