<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-primary">Weekly Specials & Promotions</h3>
      <button
        @click="addPromotion"
        class="px-4 py-2 bg-accent-primary text-white rounded-md text-sm font-bold hover:bg-accent-primary/90"
      >
        + Add Promotion
      </button>
    </div>

    <div class="space-y-4">
      <div
        v-for="(promo, index) in modelValue.promotions"
        :key="promo.id"
        class="p-4 border rounded-xl bg-surface hover:border-accent-primary transition-colors"
      >
        <div class="flex items-start gap-4">
          <div class="mt-1 cursor-move text-secondary hover:text-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>
          </div>
          
          <div class="flex-1 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-secondary uppercase mb-1">Title</label>
                <input
                  v-model="promo.title"
                  type="text"
                  class="w-full rounded-md border-divider bg-base p-2 text-sm font-bold"
                  placeholder="e.g. Senior Discount"
                  @input="emitUpdate"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-secondary uppercase mb-1">Badge (Optional)</label>
                <input
                  v-model="promo.badge"
                  type="text"
                  class="w-full rounded-md border-divider bg-base p-2 text-sm"
                  placeholder="e.g. 50% OFF"
                  @input="emitUpdate"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-secondary uppercase mb-1">Description</label>
              <textarea
                v-model="promo.description"
                rows="2"
                class="w-full rounded-md border-divider bg-base p-2 text-sm"
                placeholder="Details about the promotion..."
                @input="emitUpdate"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-secondary uppercase mb-1">Day of Week</label>
                <select
                  :value="promo.dayOfWeek"
                  @change="updateDayOfWeek(index, ($event.target as HTMLSelectElement).value)"
                  class="w-full rounded-md border-divider bg-base p-2 text-sm"
                >
                  <option value="">Any Day</option>
                  <option v-for="(day, i) in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']" :key="i" :value="i">
                    {{ day }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-xs font-bold text-secondary uppercase mb-1">Specific Date</label>
                <input
                  v-model="promo.date"
                  type="date"
                  class="w-full rounded-md border-divider bg-base p-2 text-sm"
                  @input="emitUpdate"
                />
              </div>
              
              <div class="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  :id="`active-${promo.id}`"
                  v-model="promo.isActive"
                  class="rounded border-divider text-accent-primary focus:ring-accent-primary"
                  @change="emitUpdate"
                />
                <label :for="`active-${promo.id}`" class="text-sm font-medium text-primary">Active</label>
              </div>
            </div>
          </div>
          
          <button
            @click="removePromotion(index)"
            class="text-secondary hover:text-rose-600 p-1"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
      
      <div v-if="modelValue.promotions.length === 0" class="text-center py-8 text-secondary italic">
        No promotions added yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PricingSchemaV2, type PricingPromotion } from '~/types/pricing';

const props = defineProps<{
  modelValue: PricingSchemaV2;
}>();

const emit = defineEmits(['update:modelValue']);

function addPromotion() {
  const newPromo: PricingPromotion = {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    isActive: true,
    sortOrder: props.modelValue.promotions.length,
  };
  
  emit('update:modelValue', {
    ...props.modelValue,
    promotions: [...props.modelValue.promotions, newPromo],
  });
}

function removePromotion(index: number) {
  const newPromos = [...props.modelValue.promotions];
  newPromos.splice(index, 1);
  emit('update:modelValue', {
    ...props.modelValue,
    promotions: newPromos,
  });
}

function updateDayOfWeek(index: number, value: string) {
  const newPromos = [...props.modelValue.promotions];
  if (value === '') {
    delete newPromos[index].dayOfWeek;
  } else {
    newPromos[index].dayOfWeek = parseInt(value);
  }
  emit('update:modelValue', {
    ...props.modelValue,
    promotions: newPromos,
  });
}

function emitUpdate() {
  emit('update:modelValue', { ...props.modelValue });
}
</script>
