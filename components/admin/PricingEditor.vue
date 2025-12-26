<template>
  <div class="space-y-8">
    <BaseCard class-name="space-y-6">
      <template #header>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-gold font-bold text-xs uppercase tracking-[0.4em] mb-1">
              Pricing Command Center
            </p>
            <h3 class="text-3xl font-black text-primary-950">
              Fortune 1000 Pricing Matrix
            </h3>
            <p class="text-sm text-slate-500">
              Curate the session tiers, jackpot drops, and premium bundles with surgical precision.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <BaseButton
              variant="gold"
              class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
              type="button"
              :disabled="isSaving"
              @click="$emit('save')"
            >
              <span v-if="isSaving">Deploying...</span>
              <span v-else>Deploy Pricing Schema</span>
            </BaseButton>
          </div>
        </div>
      </template>

      <!-- Sub-tabs for Pricing Categories -->
      <div class="border-b border-slate-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-gold text-primary-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-wider',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Daytime Tab -->
      <div v-if="activeTab === 'daytime'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex items-center justify-between">
            <h4 class="text-xl font-black text-primary-900">Daytime Sessions</h4>
            <BaseButton
              variant="outline"
              class-name="px-3 py-2 text-xs uppercase tracking-[0.3em]"
              type="button"
              @click="addDaytimeSession"
            >
              + Add Session
            </BaseButton>
        </div>

        <div class="space-y-6">
            <article
              v-for="(session, index) in modelValue.daytime?.sessions ?? []"
              :key="session.id ?? index"
              class="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md"
            >
              <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-primary-50 p-2 rounded-lg text-gold-600">
                        <component :is="getIcon(session.icon)" class="w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-base font-black text-primary-900">
                            {{ session.name || "Untitled Session" }}
                        </p>
                        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
                            {{ session.timeRange || "Time TBD" }}
                        </p>
                    </div>
                </div>
                <button
                  type="button"
                  class="text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-100 bg-rose-50 px-3 py-1 rounded-full"
                  @click="removeDaytimeSession(Number(index))"
                >
                  Remove Session
                </button>
              </div>

              <div class="grid gap-6 sm:grid-cols-2">
                <div class="space-y-4">
                    <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Session Name</span>
                        <input
                            v-model="session.name"
                            type="text"
                            class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                        />
                    </label>
                    <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Time Range</span>
                        <input
                            v-model="session.timeRange"
                            type="text"
                            class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                        />
                    </label>
                    <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Icon</span>
                        <select
                            v-model="session.icon"
                            class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                        >
                            <option v-for="icon in daySessionIcons" :key="icon" :value="icon">{{ icon }}</option>
                        </select>
                    </label>
                     <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Description</span>
                        <textarea
                            v-model="session.description"
                            rows="2"
                            class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                        ></textarea>
                    </label>
                </div>

                <div class="space-y-4">
                     <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Jackpot Spot</span>
                        <input
                            v-model="session.jackpot"
                            type="text"
                            class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                            placeholder="$250 Hourly"
                        />
                    </label>

                    <div class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold block mb-2">Vibe Tags</span>
                         <div class="flex flex-wrap gap-2">
                          <span
                            v-for="(vibe, vibeIndex) in session.vibe ?? []"
                            :key="`${session.id}-vibe-${vibeIndex}`"
                            class="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                          >
                            <input
                              v-model="session.vibe[vibeIndex]"
                              type="text"
                              class="w-20 bg-transparent text-xs border-none p-0 focus:ring-0"
                            />
                            <button
                              type="button"
                              class="text-slate-400 hover:text-rose-500"
                              @click="removeSessionVibe(session, Number(vibeIndex))"
                            >
                              &times;
                            </button>
                          </span>
                          <button
                            type="button"
                            class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100"
                            @click="addSessionVibe(session)"
                          >
                            + Add
                          </button>
                        </div>
                    </div>
                </div>
              </div>

              <!-- Machine Packages -->
              <div class="mt-6 pt-6 border-t border-slate-100">
                  <div class="flex items-center justify-between mb-4">
                     <h5 class="text-sm font-bold text-primary-900 uppercase tracking-wider">Machine Packages</h5>
                      <BaseButton
                        variant="outline"
                        class-name="px-2 py-1 text-[10px] uppercase tracking-[0.3em]"
                        type="button"
                        @click="addMachineToSession(session)"
                      >
                        Add Tier
                      </BaseButton>
                  </div>
                  <div class="space-y-3">
                      <div
                        v-for="(machine, machineIndex) in session.machines ?? []"
                        :key="`${session.id}-machine-${machineIndex}`"
                        class="grid gap-2 md:grid-cols-12 items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                      >
                         <div class="md:col-span-4">
                            <input v-model="machine.description" placeholder="Description" class="w-full text-sm bg-white border-slate-200 rounded-lg" />
                         </div>
                         <div class="md:col-span-2">
                            <input v-model="machine.price" placeholder="Price" class="w-full text-sm bg-white border-slate-200 rounded-lg" />
                         </div>
                         <div class="md:col-span-2">
                             <select v-model="machine.type" class="w-full text-sm bg-white border-slate-200 rounded-lg">
                                <option v-for="type in machineTypeOptions" :key="type" :value="type">{{ type }}</option>
                             </select>
                         </div>
                         <div class="md:col-span-3">
                            <input v-model="machine.savings" placeholder="Savings note" class="w-full text-sm bg-white border-slate-200 rounded-lg" />
                         </div>
                         <div class="md:col-span-1 text-right">
                            <button type="button" class="text-rose-500 hover:text-rose-700" @click="removeMachineFromSession(session, Number(machineIndex))">
                                <Trash2 class="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                  </div>
              </div>
            </article>
        </div>

        <!-- Daytime Jackpots -->
        <div class="bg-primary-950 rounded-2xl p-6 text-white relative overflow-hidden">
             <div class="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div class="relative z-10">
                <div class="flex items-center justify-between mb-6">
                    <h4 class="text-xl font-bold text-gold">Daytime Jackpots</h4>
                    <button @click="addDaytimeJackpot" class="text-xs bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded-full uppercase tracking-wider font-bold transition">
                        + Add Jackpot
                    </button>
                </div>
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        v-for="(jackpot, index) in modelValue.daytime?.jackpots ?? []"
                        :key="`jackpot-${index}`"
                        class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-sm"
                    >
                         <input v-model="jackpot.name" class="w-full bg-black/20 border-white/10 rounded-lg text-white placeholder-white/30 text-sm font-bold" placeholder="Jackpot Name" />
                         <input v-model="jackpot.prize" class="w-full bg-black/20 border-white/10 rounded-lg text-gold placeholder-gold/30 text-lg font-black" placeholder="$ Prize" />
                         <input v-model="jackpot.time" class="w-full bg-black/20 border-white/10 rounded-lg text-white/70 placeholder-white/20 text-xs" placeholder="Time Window" />
                         <div class="flex justify-end">
                            <button @click="removeDaytimeJackpot(Number(index))" class="text-xs text-rose-400 hover:text-rose-300">Remove</button>
                         </div>
                    </div>
                </div>
             </div>
        </div>
      </div>

      <!-- Evening Tab -->
      <div v-if="activeTab === 'evening'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="grid lg:grid-cols-2 gap-8">
              <div class="space-y-6">
                  <h4 class="text-lg font-black text-primary-900">Evening Configuration</h4>
                  <div class="space-y-4">
                      <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Start Time</span>
                        <input v-model="modelValue.evening.startTime" type="text" class="mt-1 w-full rounded-xl border-slate-200 bg-slate-50" />
                      </label>
                      <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Value Prop</span>
                        <textarea v-model="modelValue.evening.valueProposition" rows="2" class="mt-1 w-full rounded-xl border-slate-200 bg-slate-50"></textarea>
                      </label>
                       <label class="block">
                        <span class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Schedule Note</span>
                        <textarea v-model="modelValue.evening.scheduleNote" rows="2" class="mt-1 w-full rounded-xl border-slate-200 bg-slate-50"></textarea>
                      </label>
                  </div>
              </div>

              <div class="space-y-6">
                   <div class="flex items-center justify-between">
                        <h4 class="text-lg font-black text-primary-900">Evening Bundles</h4>
                        <button @click="addEveningMachine" class="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold">+ Add Bundle</button>
                   </div>
                   <div class="space-y-3">
                        <div
                            v-for="(machine, index) in modelValue.evening?.machines ?? []"
                            :key="`evening-machine-${index}`"
                            class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                        >
                            <div class="grid grid-cols-2 gap-3 mb-3">
                                <input v-model="machine.description" placeholder="Description" class="text-sm border-slate-200 rounded-lg" />
                                <input v-model="machine.price" placeholder="Price" class="text-sm border-slate-200 rounded-lg font-bold text-primary-700" />
                            </div>
                            <div class="flex justify-between items-center">
                                <select v-model="machine.type" class="text-xs border-slate-200 rounded-lg py-1">
                                    <option value="individual">Individual</option>
                                    <option value="bundle">Bundle</option>
                                    <option value="premium">Premium</option>
                                </select>
                                <button @click="removeEveningMachine(Number(index))" class="text-xs text-rose-500 font-bold">Remove</button>
                            </div>
                        </div>
                   </div>
              </div>
          </div>
      </div>

      <!-- Sunday & Specials Tab -->
      <div v-if="activeTab === 'sunday'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div class="bg-gold/5 border border-gold/20 rounded-2xl p-6">
                <h4 class="text-lg font-black text-gold-800 mb-4">Sunday Exclusives</h4>
                <div class="grid gap-4 md:grid-cols-2">
                     <input v-model="modelValue.sunday.title" placeholder="Sunday Title" class="rounded-xl border-gold/20 bg-white" />
                     <input v-model="modelValue.sunday.note" placeholder="Note" class="rounded-xl border-gold/20 bg-white" />
                </div>

                <div class="mt-6">
                     <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-bold uppercase tracking-widest text-gold-700">Specials List</span>
                        <button @click="addSundaySpecial" class="text-xs bg-white border border-gold/20 text-gold-700 px-3 py-1 rounded-full font-bold">+ Add Special</button>
                     </div>
                     <div class="space-y-3">
                          <div
                            v-for="(special, index) in modelValue.sunday?.specials ?? []"
                            :key="`sunday-special-${index}`"
                            class="bg-white p-4 rounded-xl border border-gold/10 shadow-sm"
                          >
                                <div class="grid md:grid-cols-3 gap-3">
                                    <input v-model="special.name" placeholder="Name" class="text-sm border-slate-100 bg-slate-50 rounded-lg" />
                                    <input v-model="special.optionOne" placeholder="Option 1" class="text-sm border-slate-100 bg-slate-50 rounded-lg" />
                                    <input v-model="special.optionTwo" placeholder="Option 2" class="text-sm border-slate-100 bg-slate-50 rounded-lg" />
                                </div>
                                <div class="mt-2 flex justify-between items-center">
                                     <input v-model="special.description" placeholder="Description" class="text-xs border-transparent w-full mr-4 text-slate-500" />
                                     <button @click="removeSundaySpecial(Number(index))" class="text-xs text-rose-400">Remove</button>
                                </div>
                          </div>
                     </div>
                </div>
           </div>
      </div>

      <!-- FAQs Tab -->
      <div v-if="activeTab === 'faqs'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div class="flex items-center justify-between">
                <h4 class="text-lg font-black text-primary-900">Frequently Asked Questions</h4>
                <BaseButton @click="addFaq" variant="outline" class-name="text-xs px-3 py-2">+ Add FAQ</BaseButton>
           </div>
           <div class="space-y-4">
                <div
                    v-for="(faq, index) in modelValue.faqs ?? []"
                    :key="`faq-${index}`"
                    class="bg-white border border-slate-200 rounded-xl p-4 transition focus-within:ring-2 ring-gold/50"
                >
                     <input v-model="faq.question" placeholder="Question" class="block w-full text-base font-bold text-primary-900 border-none p-0 focus:ring-0 placeholder-slate-300 mb-2" />
                     <textarea v-model="faq.answer" placeholder="Answer" rows="2" class="block w-full text-sm text-slate-600 border-none p-0 focus:ring-0 bg-slate-50 rounded-lg px-3 py-2" />
                     <div class="mt-2 flex justify-end">
                         <button @click="removeFaq(Number(index))" class="text-xs text-rose-500 font-bold hover:underline">Remove FAQ</button>
                     </div>
                </div>
           </div>
      </div>

    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseButton from '~/components/ui/BaseButton.vue';
import { Trash2, Sun, Moon, Clock, Star, Sparkles } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: any;
  isSaving: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const activeTab = ref('daytime');
const tabs = [
  { id: 'daytime', name: 'Daytime' },
  { id: 'evening', name: 'Evening' },
  { id: 'sunday', name: 'Specials' },
  { id: 'faqs', name: 'FAQs' },
];

const daySessionIcons = ["sun", "sparkles", "clock", "moon", "star"];
const machineTypeOptions = ["individual", "bundle", "premium"];

const getIcon = (name: string) => {
    switch(name) {
        case 'sun': return Sun;
        case 'moon': return Moon;
        case 'clock': return Clock;
        case 'star': return Star;
        case 'sparkles': return Sparkles;
        default: return Sun;
    }
};

// Helper methods (reused/adapted from original monolithic file)
const ensureArray = (val: any) => Array.isArray(val) ? val : [];

const createSessionId = () => `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const addDaytimeSession = () => {
    const newSession = {
        id: createSessionId(),
        name: "New Daytime Session",
        timeRange: "10:00 AM – 12:00 PM",
        icon: "sun",
        jackpot: "",
        description: "",
        vibe: ["Community"],
        machines: [{ description: "1 Machine", price: "$1", type: "individual", savings: "" }],
        paperRules: { minSpend: "$1", minPaperCards: 1, description: "Spend $1+ for a paper card" },
        paperRulesAdvanced: { minSpendAdvanced: "$2+", maxPaperCards: "Unlimited", description: "Spend $2+ to unlock unlimited cards" },
    };
    if (!props.modelValue.daytime) props.modelValue.daytime = { sessions: [] };
    if (!props.modelValue.daytime.sessions) props.modelValue.daytime.sessions = [];
    props.modelValue.daytime.sessions.push(newSession);
};

const removeDaytimeSession = (index: number) => {
    props.modelValue.daytime.sessions.splice(index, 1);
};

const addSessionVibe = (session: any) => {
    session.vibe = ensureArray(session.vibe);
    session.vibe.push("");
};
const removeSessionVibe = (session: any, index: number) => {
    session.vibe.splice(index, 1);
};

const addMachineToSession = (session: any) => {
    session.machines = ensureArray(session.machines);
    session.machines.push({ description: "", price: "", type: "individual", savings: "" });
};
const removeMachineFromSession = (session: any, index: number) => {
    session.machines.splice(index, 1);
};

const addDaytimeJackpot = () => {
    if (!props.modelValue.daytime) props.modelValue.daytime = { jackpots: [] };
    if (!props.modelValue.daytime.jackpots) props.modelValue.daytime.jackpots = [];
    props.modelValue.daytime.jackpots.push({ name: "", time: "", prize: "", description: "" });
};
const removeDaytimeJackpot = (index: number) => {
    props.modelValue.daytime.jackpots.splice(index, 1);
};

const addEveningMachine = () => {
     if (!props.modelValue.evening) props.modelValue.evening = { machines: [] };
     if (!props.modelValue.evening.machines) props.modelValue.evening.machines = [];
     props.modelValue.evening.machines.push({ description: "", price: "", type: "bundle", savings: "" });
};
const removeEveningMachine = (index: number) => {
    props.modelValue.evening.machines.splice(index, 1);
};

const addSundaySpecial = () => {
     if (!props.modelValue.sunday) props.modelValue.sunday = { specials: [] };
     if (!props.modelValue.sunday.specials) props.modelValue.sunday.specials = [];
     props.modelValue.sunday.specials.push({ name: "", optionOne: "", optionTwo: "", description: "", upikNote: "" });
};
const removeSundaySpecial = (index: number) => {
    props.modelValue.sunday.specials.splice(index, 1);
};

const addFaq = () => {
    if (!props.modelValue.faqs) props.modelValue.faqs = [];
    props.modelValue.faqs.push({ question: "", answer: "" });
};
const removeFaq = (index: number) => {
    props.modelValue.faqs.splice(index, 1);
};

</script>
