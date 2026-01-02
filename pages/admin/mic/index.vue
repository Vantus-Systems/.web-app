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

      <ShiftDepositCard :date="selectedDate" @saved="loadDailyShifts" />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import DailyTotals from "~/components/admin/mic/DailyTotals.vue";
import ShiftSummary from "~/components/admin/mic/ShiftSummary.vue";
import HolidayBanner from "~/components/admin/mic/HolidayBanner.vue";
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
  const response = await $fetch<{ occurrences?: HolidayOccurrence[] }>(
    "/api/admin/holiday-rules",
    {
      credentials: "include",
      params: { year },
    },
  );
  holidays.value = response.occurrences ?? [];
};

const loadDailyShifts = async () => {
  dailyShifts.value = await $fetch(
    `/api/admin/shift-records?start=${selectedDate.value}&end=${selectedDate.value}`,
    {
      credentials: "include",
    },
  );
};

const loadWeekSummary = async () => {
  const date = new Date(`${selectedDate.value}T00:00:00Z`);
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - date.getUTCDay());
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  weekShifts.value = await $fetch(
    `/api/admin/shift-records?start=${startStr}&end=${endStr}`,
    { credentials: "include" },
  );
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
  monthShifts.value = await $fetch(
    `/api/admin/shift-records?start=${startStr}&end=${endStr}`,
    { credentials: "include" },
  );
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

onMounted(loadSession);
</script>
