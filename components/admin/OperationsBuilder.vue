<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Grid, Layers, Calendar, DollarSign } from "lucide-vue-next";
import WeeklyScheduleEditor from "./schedule/WeeklyScheduleEditor.vue";
import PatternEditor from "./PatternEditor.vue";
import ProgramEditor from "./ProgramEditor.vue";
import PricingManagerPanel from "./pricing/PricingManagerPanel.vue";
import { useOpsStore } from "~/stores/ops";
import { useToast } from "~/composables/useToast";
import { useAuthUser } from "~/composables/useAuthUser";
import { normalizeRole } from "~/utils/roles";
import { useScheduleStore } from "~/stores/schedule";
import { usePricingStore } from "~/stores/pricing";

const props = defineProps<{
  userRole?: string | null;
}>();

const opsStore = useOpsStore();
const toast = useToast();
const { user, fetchUser } = useAuthUser();
const currentStep = ref("patterns"); // patterns | programs | schedule | pricing
const isProgramSaving = ref(false);
const isProgramDirty = ref(false);
const scheduleStore = useScheduleStore();
const pricingStore = usePricingStore();

const patternEditorRef = ref<any>(null);
const programEditorRef = ref<any>(null);
const scheduleEditorRef = ref<any>(null);
const pricingPanelRef = ref<any>(null);

onMounted(() => {
  opsStore.loadAll();
  // In some admin views, the session role is fetched at the page level and not stored globally.
  // Fetch it here as a fallback so OWNER-only steps (like Pricing) render reliably.
  if (!props.userRole) {
    fetchUser();
  }
});

const isOwner = computed(
  () => normalizeRole(props.userRole ?? user.value?.role) === "OWNER",
);

const steps = computed(() => {
  const items = [
    { id: "patterns", label: "Patterns", icon: Grid },
    { id: "programs", label: "Programs", icon: Layers },
    { id: "schedule", label: "Schedule", icon: Calendar },
  ];

  if (isOwner.value) {
    items.push({ id: "pricing", label: "Pricing", icon: DollarSign });
  }

  return items;
});

const confirmNavigation = (stepId: string) => {
  if (currentStep.value === "programs" && isProgramDirty.value) {
    if (
      !confirm("You have unsaved changes in the Program Editor. Discard them?")
    ) {
      return;
    }
    isProgramDirty.value = false;
  }
  currentStep.value = stepId;
};

const handleGlobalSave = async () => {
  try {
    if (currentStep.value === "patterns") {
      await patternEditorRef.value?.triggerSave?.();
    } else if (currentStep.value === "programs") {
      await programEditorRef.value?.triggerSave?.();
    } else if (currentStep.value === "schedule") {
      await scheduleEditorRef.value?.triggerSave?.();
    } else if (currentStep.value === "pricing") {
      await pricingPanelRef.value?.triggerSave?.();
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to save.", { title: "Error" });
  }
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

const handleProgramDelete = async (slug: string) => {
  try {
    await opsStore.deleteProgram(slug);
    toast.success("Program deleted.", { title: "Deleted" });
  } catch (e: any) {
    toast.error(e?.message || "Failed to delete program.", { title: "Error" });
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
      <div class="flex items-center gap-3">
        <button
          class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-accent-primary text-white rounded hover:bg-accent-primary/90 transition-colors disabled:opacity-60"
          :disabled="
            (currentStep === 'programs' && isProgramSaving) ||
            (currentStep === 'schedule' && (scheduleStore.saving || !scheduleStore.dirty)) ||
            (currentStep === 'pricing' && (pricingStore.saving || !pricingStore.dirty))
          "
          @click="handleGlobalSave"
        >
          Save
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden relative">
      <div class="h-full w-full">
        <PatternEditor
          v-if="currentStep === 'patterns'"
          :patterns="opsStore.patterns"
          ref="patternEditorRef"
          @save="handlePatternSave"
          @delete="handlePatternDelete"
        />
        <ProgramEditor
          v-else-if="currentStep === 'programs'"
          :programs="opsStore.programs"
          :patterns="opsStore.patterns"
          :is-saving="isProgramSaving"
          ref="programEditorRef"
          @save="handleProgramSave"
          @delete="handleProgramDelete"
          @dirty-change="(v) => (isProgramDirty = v)"
        />
        <WeeklyScheduleEditor v-else-if="currentStep === 'schedule'" ref="scheduleEditorRef" />
        <PricingManagerPanel v-else-if="currentStep === 'pricing'" ref="pricingPanelRef" />
      </div>
    </main>
  </div>
</template>
