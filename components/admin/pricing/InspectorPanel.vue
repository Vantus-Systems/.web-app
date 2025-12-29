<template>
  <div class="h-full flex flex-col bg-white border-l border-slate-200">
    <div class="p-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Inspector</h3>
        <p v-if="!item" class="text-sm text-slate-400 mt-1">Select an item to edit</p>
        <p v-else class="text-lg font-black text-primary-900 leading-tight mt-1">{{ selectionTypeTitle }}</p>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4" v-if="item">
        <!-- Common: Name -->
        <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">Name</label>
            <input
                v-model="localItem.name"
                @change="commit"
                class="w-full text-sm border-slate-200 rounded focus:border-gold focus:ring-gold"
            />
        </div>

        <!-- Rate Card Specific -->
        <template v-if="type === 'rateCard'">
            <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-500">Category</label>
                <select v-model="localItem.category" @change="commit" class="w-full text-sm border-slate-200 rounded focus:border-gold focus:ring-gold">
                    <option value="">None</option>
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="Electronic">Electronic</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-500">Base Price</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input v-model.number="localItem.basePrice" @change="commit" type="number" class="w-full pl-6 text-sm border-slate-200 rounded focus:border-gold focus:ring-gold" />
                </div>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-500">Description</label>
                <textarea v-model="localItem.description" @change="commit" rows="3" class="w-full text-sm border-slate-200 rounded focus:border-gold focus:ring-gold"></textarea>
            </div>
        </template>

        <!-- Bundle Specific -->
        <template v-if="type === 'bundle'">
            <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-500">Bundle Price</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input v-model.number="localItem.price" @change="commit" type="number" class="w-full pl-6 text-sm border-slate-200 rounded focus:border-gold focus:ring-gold" />
                </div>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-500">Included Cards</label>
                <div class="bg-slate-50 border border-slate-200 rounded p-2 text-xs space-y-1">
                     <div v-for="rcId in localItem.rateCardIds" :key="rcId" class="flex justify-between items-center bg-white p-1 rounded border border-slate-100">
                        <span>{{ getRateCardName(rcId) }}</span>
                        <button class="text-rose-500 hover:text-rose-700" @click="removeRateCardFromBundle(rcId)">&times;</button>
                     </div>
                     <div class="pt-2 border-t border-slate-200 mt-2">
                         <select @change="addRateCardToBundle($event)" class="w-full text-xs border-slate-200 rounded">
                             <option value="">+ Add Card</option>
                             <option v-for="rc in allRateCards" :key="rc.id" :value="rc.id">{{ rc.name }}</option>
                         </select>
                     </div>
                </div>
            </div>
        </template>

        <!-- Segment / Event Specific -->
        <template v-if="type === 'flowSegment' || type === 'overlayEvent'">
            <div class="grid grid-cols-2 gap-2">
                <div class="space-y-1">
                    <label class="text-[10px] uppercase font-bold text-slate-500">Start Time</label>
                    <input v-model="localItem.startTime" @change="commit" type="time" class="w-full text-sm border-slate-200 rounded focus:border-gold focus:ring-gold" />
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] uppercase font-bold text-slate-500">End Time</label>
                    <input v-model="localItem.endTime" @change="commit" type="time" class="w-full text-sm border-slate-200 rounded focus:border-gold focus:ring-gold" />
                </div>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-500">Assigned Rate Card</label>
                <select v-model="localItem.rateCardId" @change="commit" class="w-full text-sm border-slate-200 rounded focus:border-gold focus:ring-gold">
                    <option value="">(No specific card)</option>
                    <option v-for="rc in allRateCards" :key="rc.id" :value="rc.id">{{ rc.name }}</option>
                </select>
            </div>
        </template>

        <!-- Actions -->
        <div class="pt-6 border-t border-slate-200 mt-6">
            <button class="w-full py-2 bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-wider rounded hover:bg-rose-100 transition" @click="$emit('delete', { type, id: localItem.id })">
                Delete {{ selectionTypeTitle }}
            </button>
        </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-slate-300 p-8 text-center text-sm">
        Select an element from the Library or Timeline to configure.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { RateCard } from '~/types/ops-schema';

const props = defineProps<{
    item: any;
    type?: 'rateCard' | 'bundle' | 'flowSegment' | 'overlayEvent';
    allRateCards: RateCard[];
}>();

const emit = defineEmits(['update', 'delete']);

const localItem = ref<any>(null);

watch(() => props.item, (val) => {
    if (val) {
        localItem.value = JSON.parse(JSON.stringify(val));
    } else {
        localItem.value = null;
    }
}, { immediate: true, deep: true });

const commit = () => {
    if (localItem.value) {
        emit('update', { type: props.type, data: localItem.value });
    }
};

const selectionTypeTitle = computed(() => {
    switch(props.type) {
        case 'rateCard': return 'Rate Card';
        case 'bundle': return 'Bundle';
        case 'flowSegment': return 'Flow Segment';
        case 'overlayEvent': return 'Overlay Event';
        default: return 'Item';
    }
});

const getRateCardName = (id: string) => {
    return props.allRateCards.find(rc => rc.id === id)?.name || 'Unknown Card';
};

const removeRateCardFromBundle = (id: string) => {
    if(!localItem.value.rateCardIds) return;
    localItem.value.rateCardIds = localItem.value.rateCardIds.filter((x: string) => x !== id);
    commit();
};

const addRateCardToBundle = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    if(!id) return;
    if(!localItem.value.rateCardIds) localItem.value.rateCardIds = [];
    if(!localItem.value.rateCardIds.includes(id)) {
        localItem.value.rateCardIds.push(id);
        commit();
    }
    select.value = "";
};

</script>
