<template>
  <AdminShell
    :user-role="sessionUser?.role"
    :user-name="sessionUser?.username"
    :breadcrumbs="[{ label: 'Admin', path: '/admin' }]"
    @logout="logout"
  >
    <AdminPageHeader
      title="Admin Dashboard"
      subtitle="Management Console"
      description="Central hub for managing business operations, content, and system settings."
      :instructions="`
        <ul>
          <li><strong>Business Info</strong> - Update contact details and hours</li>
          <li><strong>Jackpot</strong> - Configure progressive jackpot display</li>
          <li><strong>Specials</strong> - Manage daily promotions and announcements</li>
          <li><strong>Operations</strong> - Full schedule and pricing management</li>
        </ul>
      `"
    >
      <template #actions>
        <div class="hidden sm:flex flex-col items-end">
          <div class="text-[10px] text-slate-400 uppercase tracking-[0.3em]">
            System Sync
          </div>
          <ClientOnly>
            <div class="text-sm font-bold text-slate-900 mt-1">
              {{ lastSystemSync }}
            </div>
            <template #fallback>
              <div class="text-sm font-bold text-slate-900 mt-1">--</div>
            </template>
          </ClientOnly>
        </div>
      </template>
    </AdminPageHeader>

    <div class="space-y-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="`tab-${tab.id}`"
          :class="[
            currentTab === tab.id
              ? 'bg-primary-900 text-gold shadow-inner'
              : 'bg-white text-slate-600 hover:bg-slate-100',
            'px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200',
          ]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <div v-if="currentTab === 'operations'" class="h-full flex flex-col">
        <OperationsBuilder />
      </div>

      <div v-else>
        <!-- Loading State -->
        <div
          v-if="pending"
          class="flex flex-col items-center justify-center py-24"
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
                          v-model="businessData.w2gPayerEin"
                          type="text"
                          class="block w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-end">
                  <BaseButton type="submit">Save Changes</BaseButton>
                </div>
              </form>
            </BaseCard>
          </div>

          <!-- Progressives Tab -->
          <div v-if="currentTab === 'progressives'" class="space-y-6">
            <ProgressiveEditor
              v-model="jackpotData"
              :is-saving="isSavingJackpot"
            />
            <div class="flex justify-end">
              <button
                class="px-5 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg disabled:opacity-50"
                :disabled="isSavingJackpot"
                @click="saveJackpot"
              >
                {{ isSavingJackpot ? "Saving..." : "Save Progressives" }}
              </button>
            </div>
          </div>

          <!-- W2G Tab -->
          <div v-if="currentTab === 'messages'" class="space-y-8">
            <div
              v-if="messagesData.length === 0"
              class="flex flex-col items-center justify-center py-20 text-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-slate-300 mb-4"
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

          <!-- Users Tab -->
          <div v-if="currentTab === 'users'" class="space-y-4">
            <div
              class="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
                >
                  User Management
                </p>
                <h2 class="text-xl font-black text-primary-900">
                  People & Shifts
                </h2>
                <p class="text-sm text-slate-500 mt-2">
                  Manage profiles, roles, and active status in the dedicated
                  workspace.
                </p>
              </div>
              <NuxtLink
                to="/admin/people"
                class="px-4 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg"
              >
                Open People & Shifts
              </NuxtLink>
            </div>
          </div>

          <!-- W2G Generator -->
          <div v-if="currentTab === 'w2g'" class="space-y-6">
            <W2GGenerator />
          </div>
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import AdminPageHeader from "~/components/admin/ui/AdminPageHeader.vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import ProgressiveEditor from "~/components/admin/ProgressiveEditor.vue";
import W2GGenerator from "~/components/admin/W2GGenerator.vue";
import OperationsBuilder from "~/components/admin/OperationsBuilder.vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { normalizeRole } from "~/utils/roles";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const tabs = [
  { id: "business", name: "Business Info" },
  { id: "progressives", name: "Progressives" },
  { id: "operations", name: "Operations Builder" },
  { id: "messages", name: "Messages" },
  { id: "users", name: "Users" },
];
const currentTab = ref("business");
const currentTabName = computed(
  () => tabs.find((t) => t.id === currentTab.value)?.name,
);

const sessionUser = ref<{ username: string; role: string } | null>(null);

// Data refs
const businessData = ref<any>({});
const jackpotData = ref<any>({});
const messagesData = ref<any[]>([]);

const pending = ref(true);
const isSavingJackpot = ref(false);
const lastSystemSync = ref("");
let lastSyncInterval: ReturnType<typeof setInterval> | null = null;

const verifyAdminSession = async () => {
  try {
    const response = await $fetch<{
      user: { role?: string; username?: string };
    }>("/api/auth/user", { credentials: "include" });
    const role = normalizeRole(response?.user?.role ?? null);
    if (!role) {
      throw new Error("Unauthorized");
    }
    if (role === "MIC") {
      await router.push("/admin/mic");
      return null;
    }
    if (role === "CHARITY") {
      await router.push("/admin/charities");
      return null;
    }
    if (role !== "OWNER") {
      throw new Error("Unauthorized");
    }
    return response.user;
  } catch {
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    await router.push("/admin/login");
    return null;
  }
};

// Fetch data
const loadData = async () => {
  pending.value = true;
  try {
    const user = await verifyAdminSession();
    if (!user) return;
    sessionUser.value = user as { username: string; role: string };
    const [biz, jack, msgs] = await Promise.all([
      $fetch("/api/business", { credentials: "include" }),
      $fetch("/api/jackpot", { credentials: "include" }),
      $fetch("/api/admin/messages", { credentials: "include" }),
    ]);

    businessData.value = biz;
    jackpotData.value = jack;
    messagesData.value = msgs;
  } catch (e: any) {
    console.error("Failed to load data", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      router.push("/admin/login");
    }
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  lastSystemSync.value = new Date().toLocaleTimeString();
  lastSyncInterval = setInterval(() => {
    lastSystemSync.value = new Date().toLocaleTimeString();
  }, 1000 * 60);
  loadData();
});

onBeforeUnmount(() => {
  if (lastSyncInterval) {
    clearInterval(lastSyncInterval);
    lastSyncInterval = null;
  }
});

// Save Handlers
const saveBusinessInfo = async () => {
  await $fetch("/api/admin/business", {
    method: "POST",
    body: businessData.value,
    credentials: "include",
  });
  alert("Business Info Saved!");
};

const saveJackpot = async () => {
  isSavingJackpot.value = true;
  try {
    jackpotData.value.lastUpdated = new Date().toLocaleString();
    await $fetch("/api/admin/jackpot", {
      method: "POST",
      body: jackpotData.value,
      credentials: "include",
    });
    alert("Progressives Updated!");
  } catch {
    alert("Failed to update progressives.");
  } finally {
    isSavingJackpot.value = false;
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  router.push("/admin/login");
};
</script>
