<template>
  <AdminShell
    title="MIC Dashboard"
    subtitle="People & Shifts"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Date
          <input
            v-model="selectedDate"
            type="date"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
        <div class="flex items-end gap-2">
          <NuxtLink
            to="/admin/mic/shifts"
            class="px-4 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg"
          >
            Manage Shifts
          </NuxtLink>
        </div>
      </div>

      <HolidayBanner :holiday="holidayForDate" />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTotals :date-label="selectedDate" :shifts="dailyShifts" />
        <ShiftSummary :week-shifts="weekShifts" :month-shifts="monthShifts" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickShiftEntry @saved="loadDailyShifts" />
        <ShiftDepositCard :date="selectedDate" @saved="loadDailyShifts" />
      </div>

      <!-- Relocated Shift Records Section -->
      <div class="space-y-4 pt-8 border-t border-slate-200">
        <div
          class="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between"
        >
          <h3 class="text-lg font-bold text-slate-900 uppercase tracking-wider">
            All Shift Records
          </h3>
          <div class="flex gap-4 items-end">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
                >Start</label
              >
              <input
                v-model="shiftFilters.start"
                type="date"
                class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
                >End</label
              >
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
          </div>
        </div>
        <ShiftsTable :shifts="allShifts" />
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import DailyTotals from "~/components/admin/mic/DailyTotals.vue";
import ShiftSummary from "~/components/admin/mic/ShiftSummary.vue";
import HolidayBanner from "~/components/admin/mic/HolidayBanner.vue";
import QuickShiftEntry from "~/components/admin/mic/QuickShiftEntry.vue";
import ShiftsTable from "~/components/admin/ShiftsTable.vue";
import ShiftDepositCard from "~/components/admin/mic/ShiftDepositCard.vue";
import { useCsrf } from "~/composables/useCsrf";
import type { HolidayOccurrence, ShiftRecord } from "~/types/admin";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{ username?: string | null; role?: string | null } | null>(
  null,
);
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const holidays = ref<HolidayOccurrence[]>([]);
const dailyShifts = ref<ShiftRecord[]>([]);
const weekShifts = ref<ShiftRecord[]>([]);
const monthShifts = ref<ShiftRecord[]>([]);

// All Shifts State
const allShifts = ref<ShiftRecord[]>([]);
const shiftFilters = ref({
  start: "",
  end: "",
});

const holidayForDate = computed(
  () =>
    holidays.value.find((holiday) => holiday.date === selectedDate.value) ??
    null,
);

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const loadHolidays = async () => {
  const year = Number(selectedDate.value.slice(0, 4));
  try {
    const response = await $fetch<{ occurrences?: HolidayOccurrence[] }>(
      "/api/admin/holiday-rules",
      {
        credentials: "include",
        params: { year },
      },
    );
    holidays.value = response.occurrences ?? [];
  } catch {
    holidays.value = [];
  }
};

const loadDailyShifts = async () => {
  try {
    dailyShifts.value = await $fetch(
      `/api/admin/shift-records?start=${selectedDate.value}&end=${selectedDate.value}`,
      {
        credentials: "include",
      },
    );
    // Also refresh the all shifts table if the date falls within range
    // But simplest is just to always refresh or let user click refresh.
    // Let's auto-refresh if current date is in range to keep it snappy.
    if (
      selectedDate.value >= shiftFilters.value.start &&
      selectedDate.value <= shiftFilters.value.end
    ) {
      await loadAllShifts();
    }
  } catch {
    dailyShifts.value = [];
  }
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

const loadWeekSummary = async () => {
  const date = new Date(`${selectedDate.value}T00:00:00Z`);
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - date.getUTCDay());
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  try {
    weekShifts.value = await $fetch(
      `/api/admin/shift-records?start=${startStr}&end=${endStr}`,
      { credentials: "include" },
    );
  } catch {
    weekShifts.value = [];
  }
};

const loadMonthSummary = async () => {
  const date = new Date(`${selectedDate.value}T00:00:00Z`);
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  );
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  try {
    monthShifts.value = await $fetch(
      `/api/admin/shift-records?start=${startStr}&end=${endStr}`,
      { credentials: "include" },
    );
  } catch {
    monthShifts.value = [];
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

// Avoid SSR calling admin APIs without forwarded cookies (can yield 403 and hard-fail the route).
if (import.meta.client) {
  watch(
    () => selectedDate.value,
    async () => {
      await loadHolidays();
      await loadDailyShifts();
      await loadWeekSummary();
      await loadMonthSummary();
    },
    { immediate: true },
  );
}

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
