<template>
  <div class="space-y-8">
    <BaseCard class-name="bg-white border border-slate-200">
      <template #header>
        <h3 class="text-lg font-bold text-primary-900">
          W-2G Payout Calculator
        </h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Payout Amount
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
            <input
              v-model.number="totalPayout"
              type="number"
              min="0"
              step="0.01"
              class="block w-full bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 pl-8 pr-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Number of Winners
          </label>
          <input
            v-model.number="numWinners"
            type="number"
            min="1"
            class="block w-full bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>

        <div class="bg-primary-50 rounded-xl p-4 border border-primary-100 flex flex-col justify-center">
          <span class="text-xs font-bold text-primary-600 uppercase tracking-wider">Per Player Payout</span>
          <span class="text-3xl font-black text-primary-900">
            {{ formatCurrency(perPlayerPayout) }}
          </span>
          <span class="text-xs text-primary-400 mt-1" v-if="perPlayerPayout > 0">
            (Rounded Up)
          </span>
        </div>
      </div>

      <!-- Compliance Status -->
      <div class="mt-6 p-4 rounded-xl flex items-center gap-4" :class="isW2GRequired ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'">
         <div :class="isW2GRequired ? 'text-red-600' : 'text-green-600'">
           <svg v-if="isW2GRequired" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
         </div>
         <div>
           <h4 class="font-bold text-lg" :class="isW2GRequired ? 'text-red-900' : 'text-green-900'">
             {{ isW2GRequired ? 'W-2G Required' : 'No W-2G Required' }}
           </h4>
           <p class="text-sm" :class="isW2GRequired ? 'text-red-700' : 'text-green-700'">
             {{ isW2GRequired
                ? 'Payout meets or exceeds the $1,200 threshold per player.'
                : 'Payout is under the $1,200 threshold per player. No tax forms needed.' }}
           </p>
         </div>
      </div>
    </BaseCard>

    <!-- W-2G Form Generator -->
    <BaseCard v-if="isW2GRequired" class-name="bg-white border border-slate-200">
      <template #header>
        <h3 class="text-lg font-bold text-primary-900">
          Player Information & W-2G Generation
        </h3>
      </template>

      <div class="space-y-6">
        <!-- ID Upload -->
        <div class="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-gold hover:bg-gold/5 transition-colors cursor-pointer relative">
            <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileUpload" />
            <div v-if="!idImage">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="font-bold text-slate-600">Upload Player ID</p>
                <p class="text-sm text-slate-400">Click or drag photo here. (Simulated extraction)</p>
            </div>
            <div v-else class="relative">
                <img :src="idImage" class="max-h-48 mx-auto rounded-lg shadow-md" />
                <button @click.prevent="idImage = null" class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Manual Entry Form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input v-model="player.name" type="text" class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" placeholder="John Doe" />
            </div>
            <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SSN / TIN</label>
                <input v-model="player.ssn" type="text" class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" placeholder="XXX-XX-XXXX" />
            </div>
             <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                <input v-model="player.dob" type="date" class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" />
            </div>
            <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                <input v-model="player.address" type="text" class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" placeholder="123 Bingo Way" />
            </div>
             <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                <input v-model="player.city" type="text" class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" />
            </div>
             <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State & Zip</label>
                 <div class="flex gap-4">
                    <input v-model="player.state" type="text" class="block w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" placeholder="FL" />
                    <input v-model="player.zip" type="text" class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold" placeholder="32548" />
                 </div>
            </div>
        </div>

        <!-- Signature Pad (Mock) -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Player Signature</label>
             <div class="h-32 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative group">
                 <p class="text-slate-400 group-hover:opacity-0 transition-opacity">Sign Here (Touch/Mouse)</p>
                 <canvas ref="signatureCanvas" class="absolute inset-0 w-full h-full cursor-crosshair"></canvas>
             </div>
             <button @click="clearSignature" class="text-xs text-red-500 font-bold mt-2 hover:text-red-700">Clear Signature</button>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
            <BaseButton variant="gold" @click="generateW2G" class-name="px-8 py-4 shadow-xl shadow-gold/20">
                Generate & Print W-2G
            </BaseButton>
        </div>

      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseButton from '~/components/ui/BaseButton.vue';

const totalPayout = ref(0);
const numWinners = ref(1);
const idImage = ref<string | null>(null);
const signatureCanvas = ref<HTMLCanvasElement | null>(null);

const player = ref({
    name: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    dob: ''
});

const perPlayerPayout = computed(() => {
    if (numWinners.value < 1) return 0;
    const raw = totalPayout.value / numWinners.value;
    return Math.ceil(raw); // Round UP to nearest whole dollar
});

const isW2GRequired = computed(() => {
    return perPlayerPayout.value >= 1200;
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
};

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            idImage.value = e.target?.result as string;
            // Mock Extraction
            setTimeout(() => {
                alert('ID Scanned. Data extracted (Simulated).');
                player.value.name = "JANE DOE";
                player.value.address = "101 LUCKY LN";
                player.value.city = "MARY ESTHER";
                player.value.state = "FL";
                player.value.zip = "32569";
                player.value.dob = "1980-05-15";
            }, 1000);
        };
        reader.readAsDataURL(target.files[0]);
    }
};

// Simple Signature Logic
const clearSignature = () => {
    if(!signatureCanvas.value) return;
    const ctx = signatureCanvas.value.getContext('2d');
    if(ctx) ctx.clearRect(0,0, signatureCanvas.value.width, signatureCanvas.value.height);
}

onMounted(() => {
    // Init canvas drawing listeners if needed (skipping full implementation for brevity, assuming standard canvas logic)
    // For now, it's a placeholder visual.
});

const generateW2G = () => {
    if (!player.value.name || !player.value.ssn) {
        alert('Please complete all player fields.');
        return;
    }
    alert(`Generating W-2G for ${player.value.name} for amount ${formatCurrency(perPlayerPayout.value)}...`);
    // In a real app, this would POST to an endpoint to generate a PDF
};

</script>
