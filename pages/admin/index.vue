<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-primary-900 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div
              class="flex-shrink-0 flex items-center text-gold font-bold text-xl"
            >
              Admin Portal
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-gold text-white'
                    : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                ]"
                @click="currentTab = tab.id"
              >
                {{ tab.name }}
              </button>
            </div>
          </div>
          <div class="flex items-center">
            <button
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ currentTabName }}
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Loading State -->
            <div v-if="pending" class="text-center py-12">
              <div
                class="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto"
              ></div>
              <p class="mt-4 text-gray-600">Loading data...</p>
            </div>

            <!-- Tab Content -->
            <div v-else class="bg-white shadow rounded-lg p-6">
              <!-- Business Info Tab -->
              <div v-if="currentTab === 'business'">
                <form class="space-y-6" @submit.prevent="saveBusinessInfo">
                  <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                      <label class="block text-sm font-medium text-gray-700"
                        >Phone</label
                      >
                      <input
                        v-model="businessData.phone"
                        type="text"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div class="sm:col-span-3">
                      <label class="block text-sm font-medium text-gray-700"
                        >Email</label
                      >
                      <input
                        v-model="businessData.email"
                        type="email"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label class="block text-sm font-medium text-gray-700"
                        >Address</label
                      >
                      <input
                        v-model="businessData.address"
                        type="text"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label class="block text-sm font-medium text-gray-700"
                        >Map Embed URL</label
                      >
                      <input
                        v-model="businessData.mapUrl"
                        type="text"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <!-- Jackpot Tab -->
              <div v-if="currentTab === 'jackpot'">
                <form class="space-y-6" @submit.prevent="saveJackpot">
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Current Jackpot Amount</label
                    >
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span class="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        v-model="jackpotData.amount"
                        type="number"
                        step="0.01"
                        class="focus:ring-gold-500 focus:border-gold-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Last Updated</label
                    >
                    <input
                      v-model="jackpotData.lastUpdated"
                      type="text"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g. Today at 5PM"
                    />
                  </div>
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Update Jackpot
                    </button>
                  </div>
                </form>
              </div>

              <!-- Pricing Tab (JSON Editor for flexibility) -->
              <div v-if="currentTab === 'pricing'">
                <p class="mb-4 text-sm text-gray-600">
                  Edit the pricing JSON directly to update the website pricing
                  tables.
                </p>
                <form @submit.prevent="savePricing">
                  <textarea
                    v-model="pricingJsonString"
                    rows="20"
                    class="font-mono text-sm w-full border border-gray-300 rounded p-4 bg-gray-50"
                  ></textarea>
                  <div class="flex justify-end mt-4">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Save Pricing
                    </button>
                  </div>
                </form>
              </div>

              <!-- Schedule Tab (JSON Editor) -->
              <div v-if="currentTab === 'schedule'">
                <p class="mb-4 text-sm text-gray-600">
                  Edit the schedule JSON directly to update the daily schedule.
                </p>
                <form @submit.prevent="saveSchedule">
                  <textarea
                    v-model="scheduleJsonString"
                    rows="15"
                    class="font-mono text-sm w-full border border-gray-300 rounded p-4 bg-gray-50"
                  ></textarea>
                  <div class="flex justify-end mt-4">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Save Schedule
                    </button>
                  </div>
                </form>
              </div>

              <!-- Messages Tab -->
              <div v-if="currentTab === 'messages'">
                <div
                  v-if="messagesData.length === 0"
                  class="text-gray-500 text-center py-8"
                >
                  No messages yet.
                </div>
                <ul v-else class="divide-y divide-gray-200">
                  <li
                    v-for="msg in messagesData"
                    :key="msg.timestamp"
                    class="py-4"
                  >
                    <div class="flex space-x-3">
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-medium">{{ msg.name }}</h3>
                          <p class="text-sm text-gray-500">
                            {{ new Date(msg.timestamp).toLocaleString() }}
                          </p>
                        </div>
                        <p class="text-sm text-gray-500">
                          {{ msg.email }} | {{ msg.phone }}
                        </p>
                        <p class="text-sm text-gray-800 mt-2">
                          {{ msg.message }}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const tabs = [
  { id: "business", name: "Business Info" },
  { id: "jackpot", name: "Jackpot" },
  { id: "pricing", name: "Pricing" },
  { id: "schedule", name: "Schedule" },
  { id: "messages", name: "Messages" },
];
const currentTab = ref("business");
const currentTabName = computed(
  () => tabs.find((t) => t.id === currentTab.value)?.name,
);

// Data refs
const businessData = ref<any>({});
const jackpotData = ref<any>({});
const pricingData = ref<any>({});
const pricingJsonString = ref("");
const scheduleData = ref<any>([]);
const scheduleJsonString = ref("");
const messagesData = ref<any[]>([]);

const pending = ref(true);

// Fetch all data
const loadData = async () => {
  pending.value = true;
  try {
    const [biz, jack, price, sched, msgs] = await Promise.all([
      $fetch("/api/business"),
      $fetch("/api/jackpot"),
      $fetch("/api/pricing"),
      $fetch("/api/schedule"),
      $fetch("/api/admin/messages").catch(() => []), // Handle error if auth fails or empty
    ]);

    businessData.value = biz;
    jackpotData.value = jack;
    pricingData.value = price;
    pricingJsonString.value = JSON.stringify(price, null, 2);
    scheduleData.value = sched;
    scheduleJsonString.value = JSON.stringify(sched, null, 2);
    messagesData.value = msgs;
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
  await $fetch("/api/admin/jackpot", {
    method: "POST",
    body: jackpotData.value,
  });
  alert("Jackpot Updated!");
};

const savePricing = async () => {
  try {
    const parsed = JSON.parse(pricingJsonString.value);
    await $fetch("/api/admin/pricing", { method: "POST", body: parsed });
    pricingData.value = parsed;
    alert("Pricing Updated!");
  } catch {
    alert("Invalid JSON format!");
  }
};

const saveSchedule = async () => {
  try {
    const parsed = JSON.parse(scheduleJsonString.value);
    await $fetch("/api/admin/schedule", { method: "POST", body: parsed });
    scheduleData.value = parsed;
    alert("Schedule Updated!");
  } catch {
    alert("Invalid JSON format!");
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  const authCookie = useCookie("admin_auth");
  authCookie.value = null;
  router.push("/admin/login");
};
</script>
