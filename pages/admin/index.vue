<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <!-- Premium Background Elements -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"
      ></div>
      <div
        class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px]"
      ></div>
    </div>

    <nav
      class="bg-primary-950 shadow-2xl border-b border-primary-800 sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span
                class="text-gold font-black text-2xl tracking-tighter uppercase italic"
                >Mary Esther</span
              >
              <span
                class="ml-2 text-white font-light text-2xl tracking-widest uppercase"
                >Bingo</span
              >
              <div
                class="ml-4 px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-[10px] text-gold font-bold tracking-widest uppercase"
              >
                Admin
              </div>
            </div>
            <div class="hidden lg:ml-10 lg:flex lg:space-x-4">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'bg-primary-900 text-gold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-primary-900/50',
                  'px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center space-x-2',
                ]"
                @click="currentTab = tab.id"
              >
                <span>{{ tab.name }}</span>
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex flex-col items-end mr-4">
              <span class="text-white text-xs font-bold"
                >System Administrator</span
              >
            </div>
            <button
              class="bg-primary-800 hover:bg-red-900/40 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold border border-primary-700 transition-colors"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-12 relative z-10">
      <header class="mb-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between">
            <div>
              <p
                class="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-1"
              >
                Management Console
              </p>
              <h1 class="text-4xl font-black text-primary-950 tracking-tight">
                {{ currentTabName }}
              </h1>
            </div>
            <div class="hidden sm:block text-right">
              <p class="text-slate-400 text-xs font-medium">Last System Sync</p>
              <p class="text-slate-900 font-bold text-sm">
                {{ new Date().toLocaleTimeString() }}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- Loading State -->
          <div
            v-if="pending"
            class="flex flex-col items-center justify-center py-32"
          >
            <div class="relative">
              <div
                class="h-16 w-16 border-4 border-primary-100 rounded-full"
              ></div>
              <div
                class="absolute top-0 left-0 h-16 w-16 border-4 border-gold border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
            <p class="mt-6 text-primary-900 font-bold animate-pulse">
              Synchronizing Data...
            </p>
          </div>

          <!-- Tab Content -->
          <div v-else>
            <!-- Business Info Tab -->
            <div v-if="currentTab === 'business'">
              <BaseCard>
                <template #header>
                  <h3 class="text-lg font-bold text-primary-900">
                    Corporate Identity & Contact
                  </h3>
                </template>
                <form class="space-y-8" @submit.prevent="saveBusinessInfo">
                  <div class="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Primary Phone</label
                      >
                      <input
                        v-if="businessData.contact"
                        v-model="businessData.contact.phone"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-3">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Public Email</label
                      >
                      <input
                        v-if="businessData.contact"
                        v-model="businessData.contact.email"
                        type="email"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Physical Address</label
                      >
                      <input
                        v-if="businessData.address"
                        v-model="businessData.address.full"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Google Maps Integration URL</label
                      >
                      <input
                        v-if="businessData.address"
                        v-model="businessData.address.mapLink"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <!-- W-2G Issuer Info -->
                    <div class="sm:col-span-6 pt-8 border-t border-slate-200">
                      <h4
                        class="text-sm font-bold text-primary-900 uppercase tracking-widest mb-4"
                      >
                        W-2G Compliance Info
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                            >Payer Name (Legal)</label
                          >
                          <input
                            v-model="businessData.w2gPayerName"
                            type="text"
                            class="block w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3"
                          />
                        </div>
                        <div>
                          <label
                            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                            >Payer EIN</label
                          >
                          <input
                            v-model="businessData.w2gEin"
                            type="text"
                            class="block w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-end pt-4">
                    <BaseButton
                      variant="gold"
                      type="submit"
                      class-name="px-10 py-4 shadow-xl shadow-gold/20"
                    >
                      Commit Changes
                    </BaseButton>
                  </div>
                </form>
              </BaseCard>
            </div>

            <!-- Progressives Tab (Refactored) -->
            <div v-if="currentTab === 'progressives'">
              <ProgressiveEditor
                v-model="jackpotData"
                :is-saving="isSavingJackpot"
                @save="saveJackpot"
              />

              <div class="mt-12">
                <div class="flex items-center gap-4 mb-6">
                  <div class="h-px bg-slate-200 flex-grow"></div>
                  <span
                    class="text-sm font-bold text-slate-400 uppercase tracking-widest"
                    >Compliance Tools</span
                  >
                  <div class="h-px bg-slate-200 flex-grow"></div>
                </div>
                <W2GGenerator />
              </div>
            </div>

            <!-- Pricing Tab (NEW COMPONENT) -->
            <div v-if="currentTab === 'pricing'">
              <PricingEditor
                v-model="pricingData"
                :is-saving="isSavingPricing"
                @save="savePricing"
              />
            </div>

            <!-- Schedule Tab (NEW COMPONENT) -->
            <div v-if="currentTab === 'schedule'">
              <ScheduleEditor
                v-model="scheduleData"
                :is-saving="isSavingSchedule"
                @save="saveSchedule"
              />
            </div>

            <!-- Patterns Tab -->
            <div v-if="currentTab === 'patterns'">
              <PatternEditor />
            </div>

            <!-- Programs Tab -->
            <div v-if="currentTab === 'programs'">
              <ProgramEditor />
            </div>

            <!-- Messages Tab -->
            <div v-if="currentTab === 'messages'">
              <div
                v-if="messagesData.length === 0"
                class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12 text-slate-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p class="text-slate-400 font-medium">
                  Inbox is currently empty
                </p>
              </div>
              <div v-else class="grid grid-cols-1 gap-6">
                <div
                  v-for="msg in messagesData"
                  :key="msg.timestamp"
                  class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center">
                      <div
                        class="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-black mr-4"
                      >
                        {{ msg.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <h3 class="font-bold text-primary-950">
                          {{ msg.name }}
                        </h3>
                        <p class="text-xs text-slate-500">{{ msg.email }}</p>
                      </div>
                    </div>
                    <span
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter"
                    >
                      {{ new Date(msg.created_at).toLocaleString() }}
                    </span>
                  </div>
                  <div class="mt-4 pl-14">
                    <p
                      class="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100"
                    >
                      {{ msg.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Tab -->
          <div v-if="currentTab === 'users'" class="space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- User List -->
              <div class="lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold text-primary-900">
                    Active Team Members
                  </h2>
                  <span
                    class="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full"
                  >
                    {{ usersData.length }} Total
                  </span>
                </div>

                <div
                  class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
                >
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Username
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Last Login
                        </th>
                        <th
                          scope="col"
                          class="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span class="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="user in usersData" :key="user.id">
                        <td
                          class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                        >
                          <div class="flex items-center">
                            <div
                              class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3"
                            >
                              {{ user.username.charAt(0).toUpperCase() }}
                            </div>
                            {{ user.username }}
                          </div>
                        </td>
                        <td
                          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          <span
                            :class="[
                              user.role === 'admin'
                                ? 'bg-gold-100 text-gold-800'
                                : 'bg-blue-100 text-blue-800',
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                            ]"
                          >
                            {{ user.role }}
                          </span>
                        </td>
                        <td
                          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          {{
                            user.last_login_at
                              ? new Date(
                                  user.last_login_at,
                                ).toLocaleDateString()
                              : "Never"
                          }}
                        </td>
                        <td
                          class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                        >
                          <button
                            class="text-red-600 hover:text-red-900 font-bold"
                            @click="deleteUser(user.id)"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Add User Form -->
              <div>
                <div
                  class="bg-primary-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden"
                >
                  <!-- Decorative background element -->
                  <div
                    class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-gold opacity-10 rounded-full blur-2xl"
                  ></div>

                  <h2 class="text-xl font-bold mb-6 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 mr-2 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Add New Member
                  </h2>

                  <form class="space-y-4" @submit.prevent="addUser">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-300 mb-1"
                        >Username</label
                      >
                      <input
                        v-model="newUser.username"
                        type="text"
                        required
                        class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white placeholder-primary-400 focus:ring-gold focus:border-gold p-2.5"
                        placeholder="jdoe"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-300 mb-1"
                        >Password</label
                      >
                      <input
                        v-model="newUser.password"
                        type="password"
                        required
                        class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white placeholder-primary-400 focus:ring-gold focus:border-gold p-2.5"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-300 mb-1"
                        >Role</label
                      >
                      <select
                        v-model="newUser.role"
                        class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white focus:ring-gold focus:border-gold p-2.5"
                      >
                        <option value="mic">MIC (Caller)</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      class="w-full bg-gold hover:bg-gold-600 text-primary-900 font-black py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                      Create Account
                    </button>
                  </form>
                </div>

                <!-- Fortune-1000 Trust Signal -->
                <div
                  class="mt-6 p-4 bg-gold-50 border border-gold-100 rounded-lg flex items-start"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-gold-600 mr-3 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-xs text-gold-800 leading-relaxed">
                    <strong>Security Note:</strong> New accounts are active
                    immediately. Ensure passwords meet complexity requirements
                    for multi-million dollar operation security standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import PricingEditor from "~/components/admin/PricingEditor.vue";
import ScheduleEditor from "~/components/admin/ScheduleEditor.vue";
import ProgressiveEditor from "~/components/admin/ProgressiveEditor.vue";
import W2GGenerator from "~/components/admin/W2GGenerator.vue";
import PatternEditor from "~/components/admin/PatternEditor.vue";
import ProgramEditor from "~/components/admin/ProgramEditor.vue";

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const tabs = [
  { id: "business", name: "Business Info" },
  { id: "progressives", name: "Progressives" },
  { id: "pricing", name: "Pricing" },
  { id: "schedule", name: "Schedule" },
  { id: "patterns", name: "Patterns" },
  { id: "programs", name: "Programs" },
  { id: "messages", name: "Messages" },
  { id: "users", name: "Users" },
];
const currentTab = ref("business");
const currentTabName = computed(
  () => tabs.find((t) => t.id === currentTab.value)?.name,
);

// Data refs
const businessData = ref<any>({});
const jackpotData = ref<any>({});
const pricingData = ref<any>({});
const scheduleData = ref<any>([]);
const messagesData = ref<any[]>([]);
const usersData = ref<any[]>([]);
const newUser = ref({
  username: "",
  password: "",
  role: "mic",
});

const pending = ref(true);
const isSavingPricing = ref(false);
const isSavingSchedule = ref(false);
const isSavingJackpot = ref(false);

const deepCloneValue = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value ?? {}));

const ensureArray = <T,>(value: any): T[] =>
  Array.isArray(value) ? value : [];

const ensureObject = (value: any) =>
  typeof value === "object" && value !== null ? value : {};

const createSessionId = () =>
  `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const normalizePricing = (raw: any) => {
  const clone = deepCloneValue(raw);
  const normalized = {
    ...clone,
    daytime: {
      sessions: ensureArray(clone?.daytime?.sessions).map((session: any) => ({
        ...session,
        id: session.id ?? createSessionId(),
        name: session.name ?? "Untitled Session",
        timeRange: session.timeRange ?? "",
        icon: session.icon ?? "sun",
        jackpot: session.jackpot ?? "",
        description: session.description ?? "",
        vibe: ensureArray(session.vibe),
        machines: ensureArray(session.machines).map((machine: any) => ({
          description: machine.description ?? "",
          price: machine.price ?? "",
          type: machine.type ?? "individual",
          savings: machine.savings ?? "",
        })),
        paperRules: {
          minSpend: session.paperRules?.minSpend ?? "",
          minPaperCards: session.paperRules?.minPaperCards ?? 0,
          description: session.paperRules?.description ?? "",
        },
        paperRulesAdvanced: {
          minSpendAdvanced: session.paperRulesAdvanced?.minSpendAdvanced ?? "",
          maxPaperCards: session.paperRulesAdvanced?.maxPaperCards ?? "",
          description: session.paperRulesAdvanced?.description ?? "",
        },
      })),
      jackpots: ensureArray(clone?.daytime?.jackpots).map((jackpot: any) => ({
        name: jackpot.name ?? "",
        time: jackpot.time ?? "",
        prize: jackpot.prize ?? "",
        description: jackpot.description ?? "",
      })),
      paperOnlyGames: {
        regular_bingo: ensureArray(
          clone?.daytime?.paperOnlyGames?.regular_bingo,
        ).map((entry: any) => ({
          name: entry.name ?? "",
          cards: entry.cards ?? "",
          price: entry.price ?? "",
        })),
        specials: ensureArray(clone?.daytime?.paperOnlyGames?.specials).map(
          (entry: any) => ({
            name: entry.name ?? "",
            cards: entry.cards ?? "",
            price: entry.price ?? "",
          }),
        ),
      },
    },
    evening: {
      ...ensureObject(clone?.evening),
      machines: ensureArray(clone?.evening?.machines).map((machine: any) => ({
        description: machine.description ?? "",
        price: machine.price ?? "",
        type: machine.type ?? "bundle",
        savings: machine.savings ?? "",
      })),
      specialtyGames: ensureArray(clone?.evening?.specialtyGames).map(
        (game: any) => ({
          name: game.name ?? "",
          price: game.price ?? "",
          description: game.description ?? "",
        }),
      ),
      specialPapers: ensureArray(clone?.evening?.specialPapers).map(
        (paper: any) => ({
          name: paper.name ?? "",
          optionOne: paper.optionOne ?? "",
          optionTwo: paper.optionTwo ?? "",
          description: paper.description ?? "",
          note: paper.note ?? "",
        }),
      ),
      startTime: clone?.evening?.startTime ?? "",
      scheduleNote: clone?.evening?.scheduleNote ?? "",
      valueProposition: clone?.evening?.valueProposition ?? "",
    },
    sunday: {
      ...ensureObject(clone?.sunday),
      title: clone?.sunday?.title ?? "",
      note: clone?.sunday?.note ?? "",
      specials: ensureArray(clone?.sunday?.specials).map((special: any) => ({
        name: special.name ?? "",
        optionOne: special.optionOne ?? "",
        optionTwo: special.optionTwo ?? "",
        description: special.description ?? "",
        upikNote: special.upikNote ?? "",
      })),
    },
    faqs: ensureArray(clone?.faqs).map((faq: any) => ({
      question: faq.question ?? "",
      answer: faq.answer ?? "",
    })),
  };
  return normalized;
};

const normalizeSchedule = (raw: any) => {
  const normalizedArray = ensureArray(raw).map((session: any) => ({
    ...session,
    id: session.id ?? createSessionId(),
    name: session.name ?? "Untitled Session",
    category: session.category ?? "General",
    startTime: session.startTime ?? "",
    endTime: session.endTime ?? "",
    gameType: session.gameType ?? "",
    description: session.description ?? "",
    status: session.status ?? "Upcoming",
    jackpot: session.jackpot ?? "",
    eligibility: session.eligibility ?? "",
    availableDays: ensureArray(session.availableDays),
    vibe: ensureArray(session.vibe),
    pricing: ensureObject(session.pricing),
    specials: ensureObject(session.specials),
  }));
  return normalizedArray;
};

// Fetch all data
const loadData = async () => {
  pending.value = true;
  try {
    const [biz, jack, price, sched, msgs, users] = await Promise.all([
      $fetch("/api/business"),
      $fetch("/api/jackpot"),
      $fetch("/api/pricing"),
      $fetch("/api/schedule"),
      $fetch("/api/admin/messages").catch(() => []),
      $fetch("/api/admin/users").catch(() => []),
    ]);

    businessData.value = biz;
    jackpotData.value = jack;
    pricingData.value = normalizePricing(price);
    scheduleData.value = normalizeSchedule(sched);
    messagesData.value = msgs;
    usersData.value = users;
  } catch (e) {
    console.error("Failed to load data", e);
  } finally {
    pending.value = false;
  }
};

onMounted(loadData);

// Save Handlers
const saveBusinessInfo = async () => {
  await $fetch("/api/admin/business", {
    method: "POST",
    body: businessData.value,
  });
  alert("Business Info Saved!");
};

const saveJackpot = async () => {
  isSavingJackpot.value = true;
  try {
    // Update timestamp
    jackpotData.value.lastUpdated = new Date().toLocaleString();
    await $fetch("/api/admin/jackpot", {
      method: "POST",
      body: jackpotData.value,
    });
    alert("Progressives Updated!");
  } catch (e) {
    alert("Failed to update progressives.");
  } finally {
    isSavingJackpot.value = false;
  }
};

const savePricing = async () => {
  isSavingPricing.value = true;
  try {
    const payload = deepCloneValue(pricingData.value);
    await $fetch("/api/admin/pricing", { method: "POST", body: payload });
    pricingData.value = normalizePricing(payload);
    alert("Pricing Updated!");
  } catch (e) {
    console.error(e);
    alert("Failed to update pricing.");
  } finally {
    isSavingPricing.value = false;
  }
};

const saveSchedule = async () => {
  isSavingSchedule.value = true;
  try {
    const payload = deepCloneValue(scheduleData.value);
    await $fetch("/api/admin/schedule", { method: "POST", body: payload });
    scheduleData.value = normalizeSchedule(payload);
    alert("Schedule Updated!");
  } catch (e) {
    console.error(e);
    alert("Failed to update schedule.");
  } finally {
    isSavingSchedule.value = false;
  }
};

const addUser = async () => {
  try {
    const user = await $fetch("/api/admin/users", {
      method: "POST",
      body: newUser.value,
    });
    usersData.value.push(user);
    newUser.value = { username: "", password: "", role: "mic" };
    alert("User added successfully!");
  } catch (e: any) {
    alert(e.data?.message || "Failed to add user");
  }
};

const deleteUser = async (id: string) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await $fetch("/api/admin/users", {
      method: "DELETE",
      body: { id },
    });
    usersData.value = usersData.value.filter((u) => u.id !== id);
  } catch (e: any) {
    alert(e.data?.message || "Failed to delete user");
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  const authCookie = useCookie("admin_auth");
  authCookie.value = null;
  router.push("/admin/login");
};
</script>
