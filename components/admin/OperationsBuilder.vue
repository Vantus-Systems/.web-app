<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  Save,
  LayoutDashboard,
  DollarSign,
  Calendar,
  Grid,
  Layers,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  UploadCloud,
} from "lucide-vue-next";
import OpsSchemaPricingEditorEnhanced from "./ops/OpsSchemaPricingEditorEnhanced.vue";
import OpsSchemaCalendarEditor from "./ops/OpsSchemaCalendarEditor.vue";
import PatternEditor from "./PatternEditor.vue";
import ProgramEditor from "./ProgramEditor.vue";
import { useOpsStore } from "~/stores/ops";
import { useToast } from "~/composables/useToast";

const opsStore = useOpsStore();
const toast = useToast();
const currentStep = ref("overview"); // overview | pricing | patterns | programs | schedule
type Density = "compact" | "standard" | "detail";
const density = ref<Density>("standard");
const isSaving = ref(false);
const isProgramSaving = ref(false);
const isProgramDirty = ref(false);
const isPublishing = ref(false);
const isRollingBack = ref(false);

onMounted(() => {
  opsStore.loadAll();
});

const steps = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pricing", label: "Pricing & Timeline", icon: DollarSign },
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

const opsSchemaMeta = computed(() => opsStore.opsSchemaDraft?.meta);
const opsSchemaStatus = computed(() => opsSchemaMeta.value?.status || "draft");
const opsSchemaName = computed(
  () => opsSchemaMeta.value?.name || "Operations Schema",
);

const handleSave = async () => {
  if (!opsStore.dirty.opsSchema) {
    toast.info("No changes to save.");
    return;
  }
  isSaving.value = true;
  try {
    await opsStore.saveOpsSchema();
    toast.success("Draft saved successfully.", { title: "Saved" });
  } catch (e: any) {
    toast.error(e?.message || "Failed to save draft.", {
      title: "Save Failed",
    });
  } finally {
    isSaving.value = false;
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

const handleProgramSave = async (p: any) => {
  isProgramSaving.value = true;
  try {
    const result = await opsStore.saveProgram(p);
    if (result.success) {
      toast.success(`Program "${p?.name || "Untitled"}" saved successfully.`, {
        title: "Program Saved",
      });
      isProgramDirty.value = false;
    } else {
      // Handle validation errors
      const errorMessage = result.validationErrors?.length
        ? `Validation errors: ${result.validationErrors.map((e: any) => `${e.path}: ${e.message}`).join("; ")}`
        : result.error || "Failed to save program";
      toast.error(errorMessage, {
        title: "Save Failed",
        duration: 5000,
      });
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to save program.", { title: "Error" });
  } finally {
    isProgramSaving.value = false;
  }
};

const handleProgramDelete = async (slug: string) => {
  if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
    return;
  }
  try {
    const result = await opsStore.deleteProgram(slug);
    if (result.success) {
      toast.success(result.data?.message || "Program deleted successfully.", { title: "Deleted" });
    } else {
      toast.error(result.error || "Failed to delete program.", { title: "Error" });
    }
  } catch (e: any) {
    toast.error(e?.message || "Failed to delete program.", { title: "Error" });
  }
};

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

const setDensity = (value: Density) => {
  density.value = value;
};

const createDraft = () => {
  updateOpsSchemaMeta({ status: "draft" });
};

const publishSchema = async () => {
  if (!opsStore.opsSchemaDraft) return;
  const errors: string[] = [];
  if (!opsStore.opsSchemaDraft.definitions?.rateCards?.length) {
    errors.push("At least one rate card is required.");
  }
  if (!opsStore.opsSchemaDraft.timeline?.flowSegments?.length) {
    errors.push("At least one flow segment is required.");
  }
  if (!opsStore.programs.length) {
    errors.push("At least one program is required.");
  }
  if (errors.length > 0) {
    errors.forEach((err) => toast.warning(err, { title: "Validation Error" }));
    return;
  }
  isPublishing.value = true;
  try {
    await opsStore.publishOpsSchema();
    toast.success("Schema published successfully!", { title: "Published" });
  } catch (e: any) {
    toast.error(e?.message || "Failed to publish schema.", {
      title: "Publish Failed",
    });
  } finally {
    isPublishing.value = false;
  }
};

const rollbackSchema = async () => {
  isRollingBack.value = true;
  try {
    await opsStore.rollbackOpsSchema();
    toast.success("Rolled back to live schema.", {
      title: "Rollback Complete",
    });
  } catch (e: any) {
    toast.error(e?.message || "Failed to rollback.", {
      title: "Rollback Failed",
    });
  } finally {
    isRollingBack.value = false;
  }
};

const statusColors = {
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  live: "bg-accent-success/10 text-accent-success border-accent-success/20",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};
</script>

<template>
  <div class="flex h-full bg-base overflow-hidden">
    <!-- Sidebar -->
    <div class="w-64 bg-surface border-r border-divider flex flex-col shrink-0">
      <div class="p-6 border-b border-divider">
        <h2 class="text-sm font-bold text-secondary uppercase tracking-wider">
          Builder
        </h2>
      </div>
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <button
          v-for="step in steps"
          :key="step.id"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="
            currentStep === step.id
              ? 'bg-accent-primary/10 text-accent-primary'
              : 'text-secondary hover:bg-base hover:text-primary'
          "
          @click="confirmNavigation(step.id)"
        >
          <component :is="step.icon" class="w-4 h-4" />
          {{ step.label }}
        </button>
      </nav>

      <!-- Sidebar Footer Status -->
      <div class="p-4 border-t border-divider bg-base/50">
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary">Pricing</span>
            <CheckCircle
              v-if="opsStore.pricingReady"
              class="w-4 h-4 text-accent-success"
            />
            <div
              v-else
              class="w-4 h-4 rounded-full border-2 border-divider"
            ></div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary">Patterns</span>
            <CheckCircle
              v-if="opsStore.patternsReady"
              class="w-4 h-4 text-accent-success"
            />
            <div
              v-else
              class="w-4 h-4 rounded-full border-2 border-divider"
            ></div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary">Programs</span>
            <CheckCircle
              v-if="opsStore.programsReady"
              class="w-4 h-4 text-accent-success"
            />
            <div
              v-else
              class="w-4 h-4 rounded-full border-2 border-divider"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header
        class="h-16 bg-surface border-b border-divider flex items-center justify-between px-6 shrink-0 z-10"
      >
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-lg font-bold text-primary">{{ opsSchemaName }}</h1>
            <div class="flex items-center gap-2 text-xs text-secondary">
              <span class="uppercase tracking-wide font-medium">{{
                opsSchemaStatus
              }}</span>
              <span>•</span>
              <span>{{ opsSchemaMeta?.timezone ?? "UTC" }}</span>
              <span>•</span>
              <span>{{ opsSchemaMeta?.currency ?? "USD" }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div
            v-if="opsStore.hasUnsavedChanges"
            class="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wide mr-4 animate-pulse"
          >
            <AlertCircle class="w-4 h-4" />
            Unsaved Changes
          </div>

          <div class="h-6 w-px bg-divider mx-2"></div>

          <button
            class="p-2 text-secondary hover:text-primary hover:bg-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rollback to live version"
            :disabled="isRollingBack || !opsStore.opsSchemaLive"
            @click="rollbackSchema"
          >
            <RotateCcw
              class="w-4 h-4"
              :class="{ 'animate-spin': isRollingBack }"
            />
          </button>

          <button
            class="flex items-center gap-2 px-4 py-2 bg-surface border border-divider hover:bg-base text-primary text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSaving"
            @click="handleSave"
          >
            <Save class="w-4 h-4" :class="{ 'animate-pulse': isSaving }" />
            {{ isSaving ? "Saving..." : "Save Draft" }}
          </button>

          <button
            class="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isPublishing"
            @click="publishSchema"
          >
            <UploadCloud
              class="w-4 h-4"
              :class="{ 'animate-pulse': isPublishing }"
            />
            {{ isPublishing ? "Publishing..." : "Publish" }}
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto bg-base p-6">
        <div
          v-if="opsStore.loading && !opsStore.pricing"
          class="flex items-center justify-center h-full"
        >
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"
          ></div>
        </div>

        <div v-else class="h-full">
          <!-- Overview Dashboard -->
          <div
            v-if="currentStep === 'overview'"
            class="max-w-5xl mx-auto space-y-8"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Status Cards -->
              <div
                class="bg-surface p-6 rounded-xl border border-divider shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                @click="currentStep = 'pricing'"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <DollarSign class="w-6 h-6" />
                  </div>
                  <CheckCircle
                    v-if="opsStore.pricingReady"
                    class="w-5 h-5 text-accent-success"
                  />
                </div>
                <h3 class="text-lg font-bold text-primary mb-1">
                  Pricing & Timeline
                </h3>
                <p class="text-sm text-secondary">
                  Manage rate cards, sessions, and operational hours.
                </p>
              </div>

              <div
                class="bg-surface p-6 rounded-xl border border-divider shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                @click="currentStep = 'patterns'"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Grid class="w-6 h-6" />
                  </div>
                  <CheckCircle
                    v-if="opsStore.patternsReady"
                    class="w-5 h-5 text-accent-success"
                  />
                </div>
                <h3 class="text-lg font-bold text-primary mb-1">Patterns</h3>
                <p class="text-sm text-secondary">
                  Design bingo patterns and game sequences.
                </p>
              </div>

              <div
                class="bg-surface p-6 rounded-xl border border-divider shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                @click="currentStep = 'programs'"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Layers class="w-6 h-6" />
                  </div>
                  <CheckCircle
                    v-if="opsStore.programsReady"
                    class="w-5 h-5 text-accent-success"
                  />
                </div>
                <h3 class="text-lg font-bold text-primary mb-1">Programs</h3>
                <p class="text-sm text-secondary">
                  Assemble games into full session programs.
                </p>
              </div>
            </div>

            <!-- Validation / Next Steps -->
            <div
              class="bg-surface rounded-xl border border-divider overflow-hidden"
            >
              <div class="px-6 py-4 border-b border-divider bg-base/50">
                <h3 class="font-bold text-primary">Validation Status</h3>
              </div>
              <div class="p-6">
                <div
                  v-if="
                    !opsStore.opsSchemaDraft?.definitions?.rateCards?.length
                  "
                  class="flex items-start gap-3 mb-4 text-sm text-secondary"
                >
                  <AlertCircle class="w-5 h-5 text-accent-warning shrink-0" />
                  <div>
                    <p class="font-medium text-primary">Missing Rate Cards</p>
                    <p>Define at least one rate card in the Pricing section.</p>
                  </div>
                </div>
                <div
                  v-if="!opsStore.programs.length"
                  class="flex items-start gap-3 mb-4 text-sm text-secondary"
                >
                  <AlertCircle class="w-5 h-5 text-accent-warning shrink-0" />
                  <div>
                    <p class="font-medium text-primary">No Programs Defined</p>
                    <p>Create at least one program to schedule sessions.</p>
                  </div>
                </div>
                <div
                  v-if="opsStore.pricingReady && opsStore.programsReady"
                  class="flex items-center gap-2 text-accent-success font-medium"
                >
                  <CheckCircle class="w-5 h-5" />
                  <span>Schema is ready for publishing.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Editors -->
          <div
            v-if="currentStep === 'pricing' && opsStore.opsSchemaDraft"
            class="h-full fade-in"
          >
            <OpsSchemaPricingEditorEnhanced
              :model-value="opsStore.opsSchemaDraft"
              :density="density"
              @update:model-value="opsStore.updateOpsSchemaDraft"
              @update:density="density = $event"
            />
          </div>

          <div v-if="currentStep === 'patterns'" class="h-full fade-in">
            <PatternEditor
              :patterns="opsStore.patterns"
              @save="handlePatternSave"
              @delete="handlePatternDelete"
            />
          </div>

          <div v-if="currentStep === 'programs'" class="h-full fade-in">
            <ProgramEditor
              :programs="opsStore.programs"
              :patterns="opsStore.patterns"
              :is-saving="isProgramSaving"
              @save="handleProgramSave"
              @delete="handleProgramDelete"
              @navigate="(step) => confirmNavigation(step)"
              @dirty-change="(val) => isProgramDirty = val"
            />
          </div>

          <div
            v-if="currentStep === 'schedule' && opsStore.opsSchemaDraft"
            class="h-full fade-in"
          >
            <OpsSchemaCalendarEditor
              :model-value="opsStore.opsSchemaDraft"
              @update:model-value="opsStore.updateOpsSchemaDraft"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
