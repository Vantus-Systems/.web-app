<template>
  <AdminShell
    title="People & Shifts"
    subtitle="Manage Users and Operations"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <div class="flex items-center gap-4 border-b border-slate-200">
        <button
          class="px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors"
          :class="
            activeTab === 'users'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          "
          @click="activeTab = 'users'"
        >
          Users
        </button>
        <button
          class="px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors"
          :class="
            activeTab === 'shifts'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          "
          @click="activeTab = 'shifts'"
        >
          Shift Records
        </button>
      </div>

      <PeopleDirectory v-if="activeTab === 'users'" />

      <div v-if="activeTab === 'shifts'" class="space-y-6">
        <div
          class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end md:items-center"
        >
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >Start Date</label
            >
            <input
              v-model="shiftFilters.start"
              type="date"
              class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >End Date</label
            >
            <input
              v-model="shiftFilters.end"
              type="date"
              class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button
            class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors"
            @click="loadShifts"
          >
            Refresh
          </button>
        </div>

        <ShiftsTable :shifts="shifts" />
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import AdminShell from "~/components/admin/AdminShell.vue";
import PeopleDirectory from "~/components/admin/users/PeopleDirectory.vue";
import ShiftsTable from "~/components/admin/ShiftsTable.vue";
import { useCsrf } from "~/composables/useCsrf";
import type { ShiftRecord } from "~/types/admin";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{
  id: string;
  username: string;
  role: string;
  is_active: boolean;
} | null>(null);

// Tabs
const activeTab = ref<"users" | "shifts">("shifts");

// --- Shifts State ---
const shifts = ref<ShiftRecord[]>([]);
const shiftFilters = ref({
  start: "",
  end: "",
});

// --- Methods ---

const loadShifts = async () => {
  try {
    const params: Record<string, string> = {};
    if (shiftFilters.value.start) params.start = shiftFilters.value.start;
    if (shiftFilters.value.end) params.end = shiftFilters.value.end;

    const fetched = await $fetch<ShiftRecord[]>("/api/admin/shift-records", {
      params,
      credentials: "include",
    });
    shifts.value = Array.isArray(fetched) ? fetched : [];
  } catch (e) {
    console.error("Failed to load shifts", e);
  }
};

const logout = async () => {
  await refreshCsrfToken();
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

// --- Lifecycle ---
onMounted(async () => {
  try {
    const sessionData = await $fetch<{
      user: {
        id: string;
        username: string;
        role: string;
        is_active: boolean;
      };
    }>("/api/auth/user", {
      credentials: "include",
    });
    session.value = sessionData.user;
  } catch (e) {
    console.error("Failed to load session", e);
    // Redirect to login if session load fails
    router.push("/admin/login");
    return;
  }

  // Set default shift filter to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  shiftFilters.value.start = firstDay.toISOString().slice(0, 10);
  shiftFilters.value.end = lastDay.toISOString().slice(0, 10);

  await loadShifts();
});

watch(activeTab, (newTab) => {
  if (newTab === "shifts") loadShifts();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
