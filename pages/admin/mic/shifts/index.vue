<template>
  <AdminShell
    title="Shift Management"
    subtitle="View & Manage Shift Records"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <h3 class="text-lg font-bold text-slate-900 uppercase tracking-wider">
          All Shift Records
        </h3>
        <div class="flex gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start</label>
            <input
              v-model="shiftFilters.start"
              type="date"
              class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End</label>
            <input
              v-model="shiftFilters.end"
              type="date"
              class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button
            class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors h-[34px]"
            @click="loadAllShifts"
          >
            Refresh
          </button>
          <NuxtLink
            to="/admin/mic/shifts/new"
            class="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors h-[34px] flex items-center"
          >
            New Shift
          </NuxtLink>
        </div>
      </div>

      <ShiftsTable :shifts="allShifts" />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import ShiftsTable from "~/components/admin/ShiftsTable.vue";
import { useCsrf } from "~/composables/useCsrf";
import type { ShiftRecord } from "~/types/admin";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const { getHeaders } = useCsrf();
const session = ref<{ username?: string | null; role?: string | null } | null>(null);

const allShifts = ref<ShiftRecord[]>([]);
const shiftFilters = ref({
  start: "",
  end: "",
});

const loadSession = async () => {
  try {
    session.value = (await $fetch("/api/auth/user", { credentials: "include" })).user;
  } catch (e) {
    // Handle error or redirect
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/auth/login");
};

const loadAllShifts = async () => {
  try {
    const params: Record<string, string> = {};
    if (shiftFilters.value.start) params.start = shiftFilters.value.start;
    if (shiftFilters.value.end) params.end = shiftFilters.value.end;

    const fetched = await $fetch<ShiftRecord[]>("/api/admin/shift-records", {
      params,
      credentials: "include",
    });
    allShifts.value = Array.isArray(fetched) ? fetched : [];
  } catch (e) {
    console.error("Failed to load all shifts", e);
    allShifts.value = [];
  }
};

onMounted(async () => {
  await loadSession();
  // Initialize filters for All Shifts
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  shiftFilters.value.start = firstDay.toISOString().slice(0, 10);
  shiftFilters.value.end = lastDay.toISOString().slice(0, 10);
  await loadAllShifts();
});
</script>
