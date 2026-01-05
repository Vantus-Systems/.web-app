<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-primary">Calendar & Overrides</h3>
      <div class="flex items-center gap-2">
        <button @click="prevMonth" class="p-1 hover:bg-base rounded">&lt;</button>
        <span class="font-bold">{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="nextMonth" class="p-1 hover:bg-base rounded">&gt;</button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-secondary uppercase tracking-wider mb-2">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">{{ day }}</div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="{ date, isCurrentMonth, isToday, override, templateName } in calendarDays"
        :key="date.toISOString()"
        class="min-h-[100px] p-2 border rounded-lg text-sm relative cursor-pointer transition-colors hover:border-accent-primary"
        :class="[
          isCurrentMonth ? 'bg-surface' : 'bg-base/50 text-secondary',
          isToday ? 'ring-2 ring-accent-primary' : 'border-divider',
          override ? 'bg-accent-primary/5' : ''
        ]"
        @click="selectDate(date)"
      >
        <div class="flex justify-between items-start">
          <span :class="{ 'font-bold': isToday }">{{ date.getDate() }}</span>
          <span v-if="override" class="w-2 h-2 rounded-full bg-accent-primary"></span>
        </div>
        <div class="mt-2 text-xs truncate">
          {{ templateName }}
        </div>
      </div>
    </div>

    <!-- Weekly Rotation Editor -->
    <div class="mt-8 p-6 bg-surface border border-divider rounded-xl">
      <h4 class="text-base font-bold text-primary mb-4">Weekly Rotation</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        <div v-for="(day, index) in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']" :key="index">
          <label class="block text-xs font-bold text-secondary uppercase mb-1">{{ day }}</label>
          <select
            :value="modelValue.weeklyRotation[dayCodes[index]] || ''"
            @change="updateRotation(dayCodes[index], ($event.target as HTMLSelectElement).value)"
            class="w-full rounded-md border-divider bg-base text-sm p-2"
          >
            <option value="">Default ({{ defaultTemplateName }})</option>
            <option v-for="t in modelValue.templates" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Override Modal -->
    <div v-if="selectedDate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-surface p-6 rounded-xl shadow-xl max-w-md w-full">
        <h3 class="text-lg font-bold text-primary mb-4">
          Override for {{ selectedDate.toLocaleDateString() }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary mb-1">Template</label>
            <select v-model="overrideForm.templateId" class="w-full rounded-md border-divider bg-base p-2">
              <option value="">No Override (Use {{ getEffectiveTemplateName(selectedDate) }})</option>
              <option v-for="t in modelValue.templates" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary mb-1">Note (Optional)</label>
            <input v-model="overrideForm.note" type="text" class="w-full rounded-md border-divider bg-base p-2" />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="selectedDate = null" class="px-4 py-2 text-sm font-medium text-secondary hover:text-primary">Cancel</button>
          <button @click="saveOverride" class="px-4 py-2 bg-accent-primary text-white rounded-md text-sm font-bold">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type PricingSchemaV2 } from '~/types/pricing';

const props = defineProps<{
  modelValue: PricingSchemaV2;
}>();

const emit = defineEmits(['update:modelValue']);

const dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const overrideForm = ref({ templateId: '', note: '' });

const currentMonthName = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }));
const currentYear = computed(() => currentDate.value.getFullYear());

const defaultTemplateName = computed(() => {
  const t = props.modelValue.templates.find(t => t.id === props.modelValue.defaultTemplateId);
  return t ? t.name : 'Unknown';
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  
  // Previous month padding
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(createDayObject(d, false));
  }
  
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push(createDayObject(d, true));
  }
  
  // Next month padding
  const endPadding = 42 - days.length;
  for (let i = 1; i <= endPadding; i++) {
    const d = new Date(year, month + 1, i);
    days.push(createDayObject(d, false));
  }
  
  return days;
});

function createDayObject(date: Date, isCurrentMonth: boolean) {
  const dateStr = date.toISOString().split('T')[0];
  const override = props.modelValue.dateOverrides.find(o => o.date === dateStr);
  const templateName = getEffectiveTemplateName(date);
  
  return {
    date,
    isCurrentMonth,
    isToday: new Date().toDateString() === date.toDateString(),
    override,
    templateName,
  };
}

function getEffectiveTemplateName(date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();
  const dayCode = dayCodes[dayOfWeek];
  
  // 1. Override
  const override = props.modelValue.dateOverrides.find(o => o.date === dateStr);
  if (override) {
    const t = props.modelValue.templates.find(t => t.id === override.templateId);
    return t ? t.name : 'Unknown';
  }
  
  // 2. Rotation
  const rotationId = props.modelValue.weeklyRotation[dayCode];
  if (rotationId) {
    const t = props.modelValue.templates.find(t => t.id === rotationId);
    return t ? t.name : 'Unknown';
  }
  
  // 3. Default
  return defaultTemplateName.value;
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
}

function selectDate(date: Date) {
  selectedDate.value = date;
  const dateStr = date.toISOString().split('T')[0];
  const override = props.modelValue.dateOverrides.find(o => o.date === dateStr);
  overrideForm.value = {
    templateId: override ? override.templateId : '',
    note: override ? override.note || '' : '',
  };
}

function saveOverride() {
  if (!selectedDate.value) return;
  
  const dateStr = selectedDate.value.toISOString().split('T')[0];
  const newOverrides = [...props.modelValue.dateOverrides.filter(o => o.date !== dateStr)];
  
  if (overrideForm.value.templateId) {
    newOverrides.push({
      date: dateStr,
      templateId: overrideForm.value.templateId,
      note: overrideForm.value.note,
      isVisible: true,
    });
  }
  
  emit('update:modelValue', {
    ...props.modelValue,
    dateOverrides: newOverrides,
  });
  
  selectedDate.value = null;
}

function updateRotation(dayCode: string, templateId: string) {
  const newRotation = { ...props.modelValue.weeklyRotation };
  if (templateId) {
    newRotation[dayCode] = templateId;
  } else {
    delete newRotation[dayCode];
  }
  
  emit('update:modelValue', {
    ...props.modelValue,
    weeklyRotation: newRotation,
  });
}
</script>
