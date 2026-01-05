<template>
  <div class="h-full flex flex-col">
    <div v-if="!editingTemplate" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-primary">Pricing Templates</h3>
        <button
          class="px-4 py-2 bg-accent-primary text-white rounded-md text-sm font-bold hover:bg-accent-primary/90"
          @click="createNewTemplate"
        >
          + New Template
        </button>
      </div>

      <div class="grid gap-4">
        <div
          v-for="template in modelValue.templates"
          :key="template.id"
          class="p-4 border rounded-xl bg-surface hover:border-accent-primary transition-colors group"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-primary">{{ template.name }}</h4>
                <span
                  v-if="template.id === modelValue.defaultTemplateId"
                  class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full"
                  >Default</span
                >
              </div>
              <p class="text-sm text-secondary">
                {{ template.description || "No description" }}
              </p>
            </div>
            <div
              class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                v-if="template.id !== modelValue.defaultTemplateId"
                class="px-3 py-1 text-xs font-medium text-secondary hover:text-primary border border-divider rounded hover:bg-base"
                @click="setAsDefault(template.id)"
              >
                Make Default
              </button>
              <button
                class="px-3 py-1 text-xs font-bold text-accent-primary border border-accent-primary/20 bg-accent-primary/5 rounded hover:bg-accent-primary/10"
                @click="editTemplate(template)"
              >
                Edit
              </button>
              <button
                v-if="template.id !== modelValue.defaultTemplateId"
                class="px-3 py-1 text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 rounded hover:bg-rose-100"
                @click="deleteTemplate(template.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="h-full flex flex-col">
      <div class="flex items-center gap-4 mb-6 pb-4 border-b border-divider">
        <button
          class="text-sm font-medium text-secondary hover:text-primary"
          @click="editingTemplate = null"
        >
          &larr; Back to Templates
        </button>
        <div class="h-6 w-px bg-divider"></div>
        <input
          v-model="editingTemplate.name"
          class="text-lg font-bold bg-transparent border-none focus:ring-0 p-0"
          placeholder="Template Name"
        />
      </div>

      <div class="flex-1 overflow-y-auto">
        <PricingConfigEditor
          :model-value="editingTemplate.config"
          :is-saving="false"
          @update:model-value="updateTemplateConfig"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { type PricingSchemaV2, type PricingTemplate } from "~/types/pricing";
import PricingConfigEditor from "./PricingConfigEditor.vue";

const props = defineProps<{
  modelValue: PricingSchemaV2;
}>();

const emit = defineEmits(["update:modelValue"]);

const editingTemplate = ref<PricingTemplate | null>(null);

function createNewTemplate() {
  const newTemplate: PricingTemplate = {
    id: crypto.randomUUID(),
    name: "New Template",
    description: "",
    config: {},
    isVisible: true,
  };

  emit("update:modelValue", {
    ...props.modelValue,
    templates: [...props.modelValue.templates, newTemplate],
  });

  editingTemplate.value = newTemplate;
}

function editTemplate(template: PricingTemplate) {
  // Clone to avoid direct mutation issues until saved?
  // Actually we want reactive updates to propagate up via v-model
  // But since we are modifying a specific item in the array, we need to be careful.
  // Let's just reference it. Since `modelValue` prop is readonly, we should emit updates.
  // But `editingTemplate` is a local ref.
  // We need to find the template in the array and update it.
  editingTemplate.value = JSON.parse(JSON.stringify(template));
}

function updateTemplateConfig(newConfig: any) {
  if (!editingTemplate.value) return;
  editingTemplate.value.config = newConfig;
  saveTemplateChanges();
}

// Watch for name changes too?
// Let's just save on back or have auto-save.
// Since `PricingConfigEditor` emits `update:modelValue`, we catch it in `updateTemplateConfig`.
// But name changes are v-model on input.
import { watch } from "vue";
watch(
  () => editingTemplate.value?.name,
  () => {
    saveTemplateChanges();
  },
);

function saveTemplateChanges() {
  if (!editingTemplate.value) return;

  const newTemplates = props.modelValue.templates.map((t) =>
    t.id === editingTemplate.value?.id ? editingTemplate.value! : t,
  );

  emit("update:modelValue", {
    ...props.modelValue,
    templates: newTemplates,
  });
}

function setAsDefault(id: string) {
  emit("update:modelValue", {
    ...props.modelValue,
    defaultTemplateId: id,
  });
}

function deleteTemplate(id: string) {
  if (!confirm("Are you sure you want to delete this template?")) return;

  // Check if used in rotation or overrides
  const isUsedInRotation = Object.values(
    props.modelValue.weeklyRotation,
  ).includes(id);
  const isUsedInOverrides = props.modelValue.dateOverrides.some(
    (o) => o.templateId === id,
  );

  if (isUsedInRotation || isUsedInOverrides) {
    alert(
      "Cannot delete template because it is used in Weekly Rotation or Date Overrides. Please remove usages first.",
    );
    return;
  }

  emit("update:modelValue", {
    ...props.modelValue,
    templates: props.modelValue.templates.filter((t) => t.id !== id),
  });
}
</script>
