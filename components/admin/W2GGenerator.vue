<template>
  <div class="space-y-8">
    <BaseCard class-name="bg-white border border-slate-200">
      <template #header>
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-bold text-primary-900">
            W-2G Payout Calculator
          </h3>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Important: Winner Processing & W-2G MUST be used ANYTIME a progressive is won to ensure proper logging and amount updates.
            </p>
          </div>
        </div>
      </template>

      <div class="mb-6 flex gap-2" v-if="props.progressiveAmounts">
        <button
          v-if="props.progressiveAmounts.babes"
          @click="totalPayout = props.progressiveAmounts.babes"
          class="px-3 py-1.5 bg-pink-100 text-pink-700 text-xs font-bold uppercase rounded-lg hover:bg-pink-200 transition-colors"
        >
          Bingo Babes: {{ formatCurrency(props.progressiveAmounts.babes) }}
        </button>
        <button
          v-if="props.progressiveAmounts.hornet"
          @click="totalPayout = props.progressiveAmounts.hornet"
          class="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-lg hover:bg-amber-200 transition-colors"
        >
          Hornet: {{ formatCurrency(props.progressiveAmounts.hornet) }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Total Payout Amount
          </label>
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400"
              >$</span
            >
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
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Number of Winners
          </label>
          <input
            v-model.number="numWinners"
            type="number"
            min="1"
            class="block w-full bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>

        <div
          class="bg-primary-50 rounded-xl p-4 border border-primary-100 flex flex-col justify-center"
        >
          <span
            class="text-xs font-bold text-primary-600 uppercase tracking-wider"
            >Per Player Payout</span
          >
          <span class="text-3xl font-black text-primary-900">
            {{ formatCurrency(perPlayerPayout) }}
          </span>
          <span
            v-if="perPlayerPayout > 0"
            class="text-xs text-primary-400 mt-1"
          >
            (Rounded Up)
          </span>
        </div>
      </div>

      <!-- Compliance Status -->
      <div
        class="mt-6 p-4 rounded-xl flex items-center gap-4"
        :class="
          isW2GRequired
            ? 'bg-red-50 border border-red-100'
            : 'bg-green-50 border border-green-100'
        "
      >
        <div :class="isW2GRequired ? 'text-red-600' : 'text-green-600'">
          <svg
            v-if="isW2GRequired"
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h4
            class="font-bold text-lg"
            :class="isW2GRequired ? 'text-red-900' : 'text-green-900'"
          >
            {{ isW2GRequired ? "W-2G Required" : "No W-2G Required" }}
          </h4>
          <p
            class="text-sm"
            :class="isW2GRequired ? 'text-red-700' : 'text-green-700'"
          >
            {{
              isW2GRequired
                ? "Payout meets or exceeds the $1,200 threshold per player."
                : "Payout is under the $1,200 threshold per player. No tax forms needed."
            }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- W-2G Form Generator -->
    <BaseCard
      v-if="isW2GRequired"
      class-name="bg-white border border-slate-200"
    >
      <template #header>
        <h3 class="text-lg font-bold text-primary-900">
          Player Information & W-2G Generation
        </h3>
      </template>

      <div class="space-y-6">
        <!-- ID Upload -->
        <div
          class="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-gold hover:bg-gold/5 transition-colors cursor-pointer relative"
        >
          <input
            type="file"
            accept="image/*"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            @change="handleFileUpload"
          />
          <div v-if="!idImage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-slate-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p class="font-bold text-slate-600">Upload Player ID</p>
            <p class="text-sm text-slate-400">
              Click or drag photo here. (Simulated extraction)
            </p>
          </div>
          <div v-else class="relative">
            <img :src="idImage" class="max-h-48 mx-auto rounded-lg shadow-md" />
            <button
              class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              @click.prevent="idImage = null"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Manual Entry Form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >Full Name</label
            >
            <input
              v-model="player.name"
              type="text"
              class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >SSN / TIN</label
            >
            <input
              v-model="player.ssn"
              type="text"
              class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
              placeholder="XXX-XX-XXXX"
            />
          </div>
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >Date of Birth</label
            >
            <input
              v-model="player.dob"
              type="date"
              class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
            />
          </div>
          <div class="md:col-span-2">
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >Address</label
            >
            <input
              v-model="player.address"
              type="text"
              class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
              placeholder="123 Bingo Way"
            />
          </div>
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >City</label
            >
            <input
              v-model="player.city"
              type="text"
              class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >State & Zip</label
            >
            <div class="flex gap-4">
              <input
                v-model="player.state"
                type="text"
                class="block w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
                placeholder="FL"
              />
              <input
                v-model="player.zip"
                type="text"
                class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold"
                placeholder="32548"
              />
            </div>
          </div>
        </div>

        <!-- Signature Pad -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
            >Player Signature</label
          >
          <div
            ref="padContainer"
            class="h-32 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative group touch-none"
          >
            <p
              v-if="!hasSignature"
              class="text-slate-400 group-hover:opacity-0 transition-opacity absolute pointer-events-none"
            >
              Sign Here (Touch/Mouse)
            </p>
            <canvas
              ref="signatureCanvas"
              class="absolute inset-0 w-full h-full cursor-crosshair"
            ></canvas>
          </div>
          <button
            class="text-xs text-red-500 font-bold mt-2 hover:text-red-700"
            @click="clearSignature"
          >
            Clear Signature
          </button>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <BaseButton
            variant="gold"
            class-name="px-8 py-4 shadow-xl shadow-gold/20"
            @click="generateW2G"
          >
            Generate & Print W-2G
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Hidden Printable Area -->
    <div
      v-if="isPrinting"
      class="print-only fixed inset-0 bg-white z-[100] p-8 overflow-y-auto"
    >
      <div class="max-w-3xl mx-auto border-2 border-black p-8">
        <div class="text-center mb-8 border-b-2 border-black pb-4">
          <h1 class="text-2xl font-bold uppercase">Form W-2G</h1>
          <p class="text-sm font-bold">Certain Gambling Winnings</p>
          <p class="text-xs">OMB No. 1545-0238</p>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="border border-black p-2">
            <label class="block text-xs font-bold">Payer's Name</label>
            <p>Mary Esther Bingo</p>
          </div>
          <div class="border border-black p-2">
            <label class="block text-xs font-bold">Gross Winnings</label>
            <p>{{ formatCurrency(perPlayerPayout) }}</p>
          </div>
          <div class="border border-black p-2 col-span-2">
            <label class="block text-xs font-bold"
              >Winner's Name & Address</label
            >
            <p>{{ player.name }}</p>
            <p>{{ player.address }}</p>
            <p>{{ player.city }}, {{ player.state }} {{ player.zip }}</p>
          </div>
          <div class="border border-black p-2">
            <label class="block text-xs font-bold">Winner's TIN</label>
            <p>{{ player.ssn }}</p>
          </div>
          <div class="border border-black p-2">
            <label class="block text-xs font-bold">Date Won</label>
            <p>{{ new Date().toLocaleDateString() }}</p>
          </div>
          <div class="border border-black p-2 col-span-2">
            <label class="block text-xs font-bold">Signature</label>
            <img
              v-if="signatureDataUrl"
              :src="signatureDataUrl"
              class="h-12 mt-2"
            />
          </div>
        </div>

        <div class="mt-8 text-center text-xs">
          <p>
            Under penalties of perjury, I declare that, to the best of my
            knowledge and belief, the name, address, and taxpayer identification
            number that I have furnished correctly identify me as the recipient
            of this payment and any payments from identical wagers, and that no
            other person is entitled to any part of these payments.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

const props = defineProps<{
  progressiveAmounts?: {
    babes?: number;
    hornet?: number;
  };
}>();

const totalPayout = ref(0);
const numWinners = ref(1);
const idImage = ref<string | null>(null);
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const padContainer = ref<HTMLDivElement | null>(null);
const hasSignature = ref(false);
const isPrinting = ref(false);
const signatureDataUrl = ref<string | null>(null);

// Drawing state
let isDrawing = false;
let ctx: CanvasRenderingContext2D | null = null;
let lastX = 0;
let lastY = 0;

const player = ref({
  name: "",
  ssn: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  dob: "",
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(val);
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      idImage.value = e.target?.result as string;
      // Mock Extraction
      setTimeout(() => {
        alert("ID Scanned. Data extracted (Simulated).");
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

// Signature Logic
const resizeCanvas = () => {
  if (!signatureCanvas.value || !padContainer.value) return;
  const rect = padContainer.value.getBoundingClientRect();
  signatureCanvas.value.width = rect.width;
  signatureCanvas.value.height = rect.height;

  // Reset ctx props after resize
  if (ctx) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
  }
};

const getPos = (e: MouseEvent | TouchEvent) => {
  if (!signatureCanvas.value) return { x: 0, y: 0 };
  const rect = signatureCanvas.value.getBoundingClientRect();

  if ("touches" in e) {
    const touch = e.touches && e.touches[0];
    if (!touch) return { x: 0, y: 0 };
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  const me = e as MouseEvent;
  return {
    x: me.clientX - rect.left,
    y: me.clientY - rect.top,
  };
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing = true;
  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;
  hasSignature.value = true;
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing || !ctx) return;
  e.preventDefault(); // Prevent scrolling on touch
  const pos = getPos(e);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
};

const stopDrawing = () => {
  isDrawing = false;
};

const clearSignature = () => {
  if (!signatureCanvas.value || !ctx) return;
  ctx.clearRect(
    0,
    0,
    signatureCanvas.value.width,
    signatureCanvas.value.height,
  );
  hasSignature.value = false;
};

onMounted(() => {
  if (signatureCanvas.value) {
    ctx = signatureCanvas.value.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse Events
    signatureCanvas.value.addEventListener("mousedown", startDrawing);
    signatureCanvas.value.addEventListener("mousemove", draw);
    signatureCanvas.value.addEventListener("mouseup", stopDrawing);
    signatureCanvas.value.addEventListener("mouseout", stopDrawing);

    // Touch Events
    signatureCanvas.value.addEventListener("touchstart", startDrawing, {
      passive: false,
    });
    signatureCanvas.value.addEventListener("touchmove", draw, {
      passive: false,
    });
    signatureCanvas.value.addEventListener("touchend", stopDrawing);
  }
});

const generateW2G = async () => {
  if (!player.value.name || !player.value.ssn) {
    alert("Please complete all player fields.");
    return;
  }

  // Capture signature
  if (signatureCanvas.value && hasSignature.value) {
    signatureDataUrl.value = signatureCanvas.value.toDataURL();
  }

  isPrinting.value = true;
  await nextTick();
  window.print();

  // Reset after print dialog closes (approximate)
  setTimeout(() => {
    isPrinting.value = false;
  }, 1000);
};
</script>

<style scoped>
@media print {
  :deep(body > *) {
    display: none !important;
  }
  .print-only {
    display: block !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 9999;
  }
}
.print-only {
  display: none;
}
</style>
