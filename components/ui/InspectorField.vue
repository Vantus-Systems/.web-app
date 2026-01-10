<template>
  <div class="space-y-1">
    <!-- Label -->
    <div class="flex items-center justify-between">
      <label
        :for="id"
        class="text-sm font-semibold text-primary flex items-center gap-1"
      >
        {{ label }}
        <span v-if="required" class="text-accent-error" aria-label="required"
          >*</span
        >
        <span
          v-if="tooltip"
          class="text-tertiary cursor-help"
          :title="tooltip"
          aria-label="help"
          >ⓘ</span
        >
      </label>
      <span v-if="status" class="text-xs font-medium" :class="statusClass">{{
        status
      }}</span>
    </div>

    <!-- Input Control -->
    <template v-if="type === 'select'">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled || loading"
        :class="inputClasses"
        @change="handleInput"
        @blur="handleBlur"
      >
        <option v-if="placeholder" value="" disabled selected>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </template>
    <component
      :is="componentType"
      v-else
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      :readonly="readonly"
      :min="min"
      :max="max"
      :step="step"
      :class="inputClasses"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
    />

    <!-- Helper Text (Always Visible) -->
    <p
      v-if="helperText"
      :id="`${id}-helper`"
      class="text-xs text-secondary mt-1"
    >
      {{ helperText }}
    </p>

    <!-- Validation Message -->
    <p
      v-if="validationMessage"
      :id="`${id}-error`"
      class="text-xs text-accent-error mt-1 flex items-center gap-1"
      role="alert"
    >
      <span>⚠</span> {{ validationMessage }}
    </p>

    <!-- Success Message -->
    <p
      v-if="successMessage"
      :id="`${id}-success`"
      class="text-xs text-accent-success mt-1 flex items-center gap-1"
    >
      <span>✓</span> {{ successMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  // Core
  id: string;
  label: string;
  modelValue: any;

  // Input type
  type?:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "color"
    | "time"
    | "checkbox";

  // Validation & State
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  valid?: boolean;
  invalid?: boolean;

  // Content
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  validationMessage?: string;
  successMessage?: string;
  status?: "edited" | "saved" | "loading";

  // Constraints
  min?: number;
  max?: number;
  step?: number;

  // Options for select
  options?: Array<{ value: string | number; label: string }>;

  // Custom styling
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  required: false,
  disabled: false,
  readonly: false,
  loading: false,
  valid: false,
  invalid: false,
  placeholder: "",
  helperText: "",
  tooltip: "",
  validationMessage: "",
  successMessage: "",
  status: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  options: () => [],
  className: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "input", event: Event): void;
  (e: "change", event: Event): void;
  (e: "blur", event: Event): void;
}>();

// Component type based on input type
const componentType = computed(() => {
  if (props.type === "select") return "select";
  if (props.type === "textarea") return "textarea";
  if (props.type === "checkbox") return "input";
  return "input";
});

// Input classes (Aurora tokens)
const inputClasses = computed(() => {
  const base = [
    "w-full rounded-md border transition-all duration-150",
    "focus:outline-none focus:ring-2",
    "text-sm",
  ];

  // Border and background states
  if (props.invalid || props.validationMessage) {
    base.push("border-accent-error bg-red-50 focus:ring-accent-error");
  } else if (props.valid) {
    base.push("border-accent-success bg-green-50 focus:ring-accent-success");
  } else {
    base.push(
      "border-divider bg-base hover:border-accent-primary focus:ring-accent-primary",
    );
  }

  // Disabled state
  if (props.disabled || props.loading) {
    base.push("opacity-50 cursor-not-allowed");
  }

  // Readonly state
  if (props.readonly) {
    base.push("bg-base/50");
  }

  // Type-specific styling
  if (props.type === "checkbox") {
    base.push(
      "w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary",
    );
  } else if (props.type === "color") {
    base.push("h-10 w-20 p-1 cursor-pointer");
  } else if (props.type === "textarea") {
    base.push("min-h-[80px] resize-y");
  } else if (props.type === "select") {
    base.push("cursor-pointer pr-8");
  } else {
    base.push("px-3 py-2");
  }

  // Custom class
  if (props.className) {
    base.push(props.className);
  }

  return base.join(" ");
});

// Status indicator styling
const statusClass = computed(() => {
  switch (props.status) {
    case "edited":
      return "text-accent-warning";
    case "saved":
      return "text-accent-success";
    case "loading":
      return "text-tertiary";
    default:
      return "text-tertiary";
  }
});

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;
  let value: any;

  if (props.type === "checkbox") {
    value = (target as HTMLInputElement).checked;
  } else if (props.type === "number") {
    value = target.value ? Number(target.value) : null;
  } else {
    value = target.value;
  }

  emit("update:modelValue", value);
  emit("input", event);
};

const handleChange = (event: Event) => {
  emit("change", event);
};

const handleBlur = (event: Event) => {
  emit("blur", event);
};
</script>

<style scoped>
/* Smooth transitions for status changes */
input,
select,
textarea {
  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease;
}

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  appearance: none;
}

/* Checkbox styling */
input[type="checkbox"] {
  accent-color: #0a84ff;
}

/* Focus visible for accessibility */
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #0a84ff;
  outline-offset: 2px;
}
</style>
