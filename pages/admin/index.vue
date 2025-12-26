<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <!-- Premium Background Elements -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
      <div class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px]"></div>
    </div>

    <nav class="bg-primary-950 shadow-2xl border-b border-primary-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-gold font-black text-2xl tracking-tighter uppercase italic">Mary Esther</span>
              <span class="ml-2 text-white font-light text-2xl tracking-widest uppercase">Bingo</span>
              <div class="ml-4 px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-[10px] text-gold font-bold tracking-widest uppercase">Admin</div>
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
              <span class="text-white text-xs font-bold">System Administrator</span>
              <span class="text-slate-400 text-[10px] uppercase tracking-tighter">Fortune-10000 Node</span>
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
              <p class="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-1">Management Console</p>
              <h1 class="text-4xl font-black text-primary-950 tracking-tight">
                {{ currentTabName }}
              </h1>
            </div>
            <div class="hidden sm:block text-right">
              <p class="text-slate-400 text-xs font-medium">Last System Sync</p>
              <p class="text-slate-900 font-bold text-sm">{{ new Date().toLocaleTimeString() }}</p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- Loading State -->
          <div v-if="pending" class="flex flex-col items-center justify-center py-32">
            <div class="relative">
              <div class="h-16 w-16 border-4 border-primary-100 rounded-full"></div>
              <div class="absolute top-0 left-0 h-16 w-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="mt-6 text-primary-900 font-bold animate-pulse">Synchronizing Data...</p>
          </div>

          <!-- Tab Content -->
          <div v-else>
            <!-- Business Info Tab -->
            <div v-if="currentTab === 'business'">
              <BaseCard>
                <template #header>
                  <h3 class="text-lg font-bold text-primary-900">Corporate Identity & Contact</h3>
                </template>
                <form class="space-y-8" @submit.prevent="saveBusinessInfo">
                  <div class="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Phone</label>
                      <input
                        v-if="businessData.contact"
                        v-model="businessData.contact.phone"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-3">
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Public Email</label>
                      <input
                        v-if="businessData.contact"
                        v-model="businessData.contact.email"
                        type="email"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Physical Address</label>
                      <input
                        v-if="businessData.address"
                        v-model="businessData.address.full"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Maps Integration URL</label>
                      <input
                        v-if="businessData.address"
                        v-model="businessData.address.mapLink"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                  </div>
                  <div class="flex justify-end pt-4">
                    <BaseButton variant="gold" type="submit" className="px-10 py-4 shadow-xl shadow-gold/20">
                      Commit Changes
                    </BaseButton>
                  </div>
                </form>
              </BaseCard>
            </div>

            <!-- Jackpot Tab -->
            <div v-if="currentTab === 'jackpot'">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BaseCard className="bg-primary-950 text-white border-none relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <template #header>
                    <h3 class="text-lg font-bold text-gold">Live Jackpot Configuration</h3>
                  </template>
                  <form class="space-y-8 relative z-10" @submit.prevent="saveJackpot">
                    <div>
                      <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Prize Pool</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span class="text-gold font-bold text-2xl">$</span>
                        </div>
                        <input
                          v-model="jackpotData.value"
                          type="number"
                          step="0.01"
                          class="block w-full bg-primary-900 border-primary-800 rounded-2xl text-white text-4xl font-black pl-12 pr-4 py-6 focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Timestamp</label>
                      <input
                        v-model="jackpotData.lastUpdated"
                        type="text"
                        class="block w-full bg-primary-900 border-primary-800 rounded-xl text-slate-300 p-4 focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        placeholder="e.g. Today at 5PM"
                      />
                    </div>
                    <div class="flex justify-end">
                      <BaseButton variant="gold" type="submit" className="w-full py-5 text-lg shadow-2xl shadow-gold/10">
                        Broadcast Update
                      </BaseButton>
                    </div>
                  </form>
                </BaseCard>

                <div class="space-y-6">
                  <div class="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                    <h4 class="text-sm font-black text-primary-900 uppercase tracking-widest mb-4">Jackpot Strategy</h4>
                    <p class="text-slate-600 text-sm leading-relaxed">
                      The jackpot amount is the primary driver for player attendance. High-visibility updates during peak hours (4PM - 6PM) correlate with a 15% increase in session revenue.
                    </p>
                  </div>
                  <div class="bg-gold/5 p-8 rounded-2xl border border-gold/20">
                    <h4 class="text-sm font-black text-gold-700 uppercase tracking-widest mb-4">Public Display</h4>
                    <div class="flex items-center justify-center h-24 bg-primary-950 rounded-xl border-2 border-gold/30">
                      <span class="text-gold font-black text-3xl tracking-tighter">${{ jackpotData.value }}</span>
                    </div>
                  </div>
                </div>              </div>              </div>
            </div>

            <!-- Pricing Tab -->
            <div v-if="currentTab === 'pricing'">
              <BaseCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-primary-900">Pricing Architecture (JSON)</h3>
                    <div class="flex space-x-2">
                      <span class="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Read-Only Validation</span>
                    </div>
                  </div>
                </template>
                <p class="mb-6 text-sm text-slate-500 italic">
                  Directly modify the pricing schema below. This controls the multi-tier pricing tables on the public site.
                </p>
                <form @submit.prevent="savePricing">
                  <div class="relative group">
                    <div class="absolute -inset-1 bg-gradient-to-r from-gold/20 to-primary-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <textarea
                      v-model="pricingJsonString"
                      rows="20"
                      class="relative font-mono text-sm w-full border border-slate-200 rounded-xl p-6 bg-slate-900 text-gold-100 focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                    ></textarea>
                  </div>
                  <div class="flex justify-end mt-8">
                    <BaseButton variant="primary" type="submit" className="px-12 py-4">
                      Deploy Pricing Schema
                    </BaseButton>
                  </div>
                </form>
              </BaseCard>
            </div>

            <!-- Schedule Tab -->
            <div v-if="currentTab === 'schedule'">
              <BaseCard>
                <template #header>
                  <h3 class="text-lg font-bold text-primary-900">Event Timeline Configuration</h3>
                </template>
                <p class="mb-6 text-sm text-slate-500 italic">
                  Update the weekly session schedule. Ensure all time slots are formatted correctly for the timeline component.
                </p>
                <form @submit.prevent="saveSchedule">
                  <textarea
                    v-model="scheduleJsonString"
                    rows="15"
                    class="font-mono text-sm w-full border border-slate-200 rounded-xl p-6 bg-slate-900 text-gold-100 focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  ></textarea>
                  <div class="flex justify-end mt-8">
                    <BaseButton variant="primary" type="submit" className="px-12 py-4">
                      Publish Schedule
                    </BaseButton>
                  </div>
                </form>
              </BaseCard>
            </div>

            <!-- Messages Tab -->
            <div v-if="currentTab === 'messages'">
              <div v-if="messagesData.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-slate-400 font-medium">Inbox is currently empty</p>
              </div>
              <div v-else class="grid grid-cols-1 gap-6">
                <div
                  v-for="msg in messagesData"
                  :key="msg.timestamp"
                  class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-black mr-4">
                        {{ msg.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <h3 class="font-bold text-primary-950">{{ msg.name }}</h3>
                        <p class="text-xs text-slate-500">{{ msg.email }}</p>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {{ new Date(msg.created_at).toLocaleString() }}
                    </span>
                  </div>
                  <div class="mt-4 pl-14">
                    <p class="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {{ msg.message }}
                    </p>
                  </div>
                </div>              </div>              </div>
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

                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Username</th>
                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Login</th>
                            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span class="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                          <tr v-for="user in usersData" :key="user.id">
                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <div class="flex items-center">
                                <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                                  {{ user.username.charAt(0).toUpperCase() }}
                                </div>
                                {{ user.username }}
                              </div>
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span 
                                :class="[
                                  user.role === 'admin' ? 'bg-gold-100 text-gold-800' : 'bg-blue-100 text-blue-800',
                                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
                                ]"
                              >
                                {{ user.role }}
                              </span>
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {{ user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never' }}
                            </td>
                            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button 
                                @click="deleteUser(user.id)"
                                class="text-red-600 hover:text-red-900 font-bold"
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
                    <div class="bg-primary-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                      <!-- Decorative background element -->
                      <div class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-gold opacity-10 rounded-full blur-2xl"></div>
                      
                      <h2 class="text-xl font-bold mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Add New Member
                      </h2>

                      <form @submit.prevent="addUser" class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-300 mb-1">Username</label>
                          <input
                            v-model="newUser.username"
                            type="text"
                            required
                            class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white placeholder-primary-400 focus:ring-gold focus:border-gold p-2.5"
                            placeholder="jdoe"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
                          <input
                            v-model="newUser.password"
                            type="password"
                            required
                            class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white placeholder-primary-400 focus:ring-gold focus:border-gold p-2.5"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
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
                    <div class="mt-6 p-4 bg-gold-50 border border-gold-100 rounded-lg flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gold-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-xs text-gold-800 leading-relaxed">
                        <strong>Security Note:</strong> New accounts are active immediately. Ensure passwords meet complexity requirements for multi-million dollar operation security standards.
                      </p>
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
const pricingJsonString = ref("");
const scheduleData = ref<any>([]);
const scheduleJsonString = ref("");
const messagesData = ref<any[]>([]);
const usersData = ref<any[]>([]);
const newUser = ref({
  username: "",
  password: "",
  role: "mic",
});

const pending = ref(true);

// Fetch all data
const loadData = async () => {
  pending.value = true;
  try {
    const [biz, jack, price, sched, msgs, users] = await Promise.all([
      $fetch("/api/business"),
      $fetch("/api/jackpot"),
      $fetch("/api/pricing"),
      $fetch("/api/schedule"),
      $fetch("/api/admin/messages").catch(() => []), // Handle error if auth fails or empty
      $fetch("/api/admin/users").catch(() => []),
    ]);

    businessData.value = biz;
    jackpotData.value = jack;
    pricingData.value = price;
    pricingJsonString.value = JSON.stringify(price, null, 2);
    scheduleData.value = sched;
    scheduleJsonString.value = JSON.stringify(sched, null, 2);
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
