<template>
  <div class="admin-wizard">
    <!-- Progress Stepper -->
    <div class="wizard-header border-b border-gray-200 bg-white px-6 py-4">
      <nav aria-label="Progress">
        <ol role="list" class="flex items-center">
          <li
            v-for="(step, idx) in steps"
            :key="step.name"
            :class="[
              idx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative',
            ]"
          >
            <template v-if="idx < currentStepIndex">
              <!-- Completed Step -->
              <div
                class="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div class="h-0.5 w-full bg-blue-600"></div>
              </div>
              <button
                type="button"
                class="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                @click="goToStep(idx)"
              >
                <svg
                  class="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="sr-only">{{ step.name }}</span>
              </button>
            </template>
            <template v-else-if="idx === currentStepIndex">
              <!-- Current Step -->
              <div
                class="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div class="h-0.5 w-full bg-gray-200"></div>
              </div>
              <div
                class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white"
                aria-current="step"
              >
                <span
                  class="h-2.5 w-2.5 rounded-full bg-blue-600"
                  aria-hidden="true"
                ></span>
                <span class="sr-only">{{ step.name }}</span>
              </div>
            </template>
            <template v-else>
              <!-- Upcoming Step -->
              <div
                class="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div class="h-0.5 w-full bg-gray-200"></div>
              </div>
              <div
                class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400 transition-colors"
              >
                <span
                  class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300 transition-colors"
                  aria-hidden="true"
                ></span>
                <span class="sr-only">{{ step.name }}</span>
              </div>
            </template>
            <!-- Step Label -->
            <div
              class="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span
                :class="[
                  idx === currentStepIndex
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-500',
                  'text-sm',
                ]"
              >
                {{ step.name }}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Step Content -->
    <div class="wizard-body bg-gray-50 p-6">
      <div class="mx-auto max-w-5xl">
        <!-- Validation Errors Summary -->
        <div
          v-if="validationErrors.length > 0"
          class="mb-4 rounded-md bg-red-50 border border-red-200 p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <ul class="mt-2 list-disc list-inside text-sm text-red-700">
                <li v-for="(error, idx) in validationErrors" :key="idx">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Current Step Content -->
        <slot :name="`step-${currentStepIndex}`" :step="currentStep"></slot>
      </div>
    </div>

    <!-- Navigation Footer -->
    <div class="wizard-footer border-t border-gray-200 bg-white px-6 py-4">
      <div class="flex items-center justify-between">
        <button
          v-if="!isFirstStep"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          @click="previousStep"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
        <div v-else></div>

        <div class="flex items-center gap-3">
          <button
            v-if="showSaveDraft"
            type="button"
            :disabled="isSaving"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="$emit('save-draft')"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {{ isSaving ? "Saving..." : "Save Draft" }}
          </button>

          <button
            v-if="!isLastStep"
            type="button"
            :disabled="isValidating"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="nextStep"
          >
            {{ isValidating ? "Validating..." : "Next" }}
            <svg
              class="-mr-1 ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            v-else
            type="button"
            :disabled="isSubmitting"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="submitWizard"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ isSubmitting ? "Publishing..." : submitButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface WizardStep {
  name: string;
  validate?: () => Promise<string[]> | string[];
}

interface Props {
  steps: WizardStep[];
  currentStep?: number;
  showSaveDraft?: boolean;
  submitButtonText?: string;
  isSaving?: boolean;
  isSubmitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentStep: 0,
  showSaveDraft: true,
  submitButtonText: "Publish",
  isSaving: false,
  isSubmitting: false,
});

const emit = defineEmits<{
  "update:currentStep": [step: number];
  "step-change": [step: number];
  "save-draft": [];
  submit: [];
}>();

const currentStepIndex = ref(props.currentStep);
const validationErrors = ref<string[]>([]);
const isValidating = ref(false);

const currentStep = computed(() => props.steps[currentStepIndex.value]);
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(
  () => currentStepIndex.value === props.steps.length - 1,
);

const goToStep = (index: number) => {
  if (index < currentStepIndex.value) {
    currentStepIndex.value = index;
    validationErrors.value = [];
    emit("update:currentStep", index);
    emit("step-change", index);
  }
};

const previousStep = () => {
  if (!isFirstStep.value) {
    currentStepIndex.value--;
    validationErrors.value = [];
    emit("update:currentStep", currentStepIndex.value);
    emit("step-change", currentStepIndex.value);
  }
};

const nextStep = async () => {
  isValidating.value = true;
  validationErrors.value = [];

  try {
    if (currentStep.value && currentStep.value.validate) {
      const errors = await currentStep.value.validate();
      if (errors.length > 0) {
        validationErrors.value = errors;
        return;
      }
    }

    currentStepIndex.value++;
    emit("update:currentStep", currentStepIndex.value);
    emit("step-change", currentStepIndex.value);
  } finally {
    isValidating.value = false;
  }
};

const submitWizard = async () => {
  isValidating.value = true;
  validationErrors.value = [];

  try {
    if (currentStep.value && currentStep.value.validate) {
      const errors = await currentStep.value.validate();
      if (errors.length > 0) {
        validationErrors.value = errors;
        return;
      }
    }

    emit("submit");
  } finally {
    isValidating.value = false;
  }
};
</script>

<style scoped>
.admin-wizard {
  display: flex;
  flex-direction: column;
  min-height: 600px;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.wizard-header {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.wizard-body {
  flex: 1;
  overflow-y: auto;
}

.wizard-footer {
  flex-shrink: 0;
}
</style>
