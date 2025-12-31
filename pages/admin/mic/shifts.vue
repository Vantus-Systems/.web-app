<template>
  <AdminShell
    title="Shift Records"
    subtitle="MIC Operations"
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
        <label
          class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <input v-model="overrideClosed" type="checkbox" class="rounded" />
          Override closure
        </label>
      </div>

      <HolidayBanner :holiday="holidayForDate" />

      <div
        class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6"
      >
        <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
              >
                Shifts
              </p>
              <h3 class="text-xl font-black text-primary-900">Daily List</h3>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead
                class="text-slate-500 uppercase tracking-widest bg-slate-50"
              >
                <tr>
                  <th class="px-3 py-2 text-left">Shift</th>
                  <th class="px-3 py-2 text-right">Pull Tabs</th>
                  <th class="px-3 py-2 text-right">Deposit</th>
                  <th class="px-3 py-2 text-right">Bingo</th>
                  <th class="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="shift in shifts"
                  :key="shift.id"
                  class="border-t border-slate-200"
                >
                  <td class="px-3 py-2 font-semibold text-slate-700">
                    {{ shift.shift }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    ${{ formatCurrency(shift.pulltabs_total, 2) }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    ${{ formatCurrency(shift.deposit_total, 2) }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    ${{ formatCurrency(shift.bingo_total, 2) }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    <NuxtLink
                      :to="`/admin/mic/shifts/${shift.id}`"
                      class="text-primary-700 font-bold"
                    >
                      View
                    </NuxtLink>
                  </td>
                </tr>
                <tr v-if="shifts.length === 0">
                  <td colspan="5" class="px-3 py-4 text-center text-slate-400">
                    No shifts recorded for this date.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <p
              class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
            >
              New Shift
            </p>
            <h3 class="text-lg font-black text-primary-900">Record Totals</h3>
            <p class="text-xs text-slate-500 mt-2">
              Available shifts:
              <span v-if="availableShifts.length > 0">{{
                availableShifts.join(", ")
              }}</span>
              <span v-else class="text-rose-600">Closed</span>
            </p>
            <p v-if="shiftHint" class="text-xs text-slate-400">
              {{ shiftHint }}
            </p>
          </div>
          <ShiftWizard @submit="submitMicShift" />
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import ShiftWizard from "~/components/admin/mic/ShiftWizard.vue";
import HolidayBanner from "~/components/admin/mic/HolidayBanner.vue";
import { formatCurrency } from "~/utils/format";
import type { HolidayOccurrence, ShiftRecord } from "~/types/admin";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
type SessionUser = { username?: string; role: string | null } | null;
const session = ref<SessionUser>(null);
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const overrideClosed = ref(false);
const holidays = ref<HolidayOccurrence[]>([]);
const shifts = ref<ShiftRecord[]>([]);
const prevEndingBox = ref<number | null>(null);

const holidayForDate = computed(
  () =>
    holidays.value.find((holiday) => holiday.date === selectedDate.value) ??
    null,
);

const availableShifts = computed(() => {
  if (overrideClosed.value) return ["AM", "PM"];
  if (holidayForDate.value?.closureType === "CLOSED") return [];
  return ["AM", "PM"];
});

const shiftHint = computed(() => {
  if (holidayForDate.value?.closureType === "CLOSE_EARLY") {
    return `PM closes early at ${holidayForDate.value.closeTime ?? "early close"}.`;
  }
  return "";
});

const loadSession = async () => {
  const res = await $fetch("/api/auth/user", { credentials: "include" });
  session.value = res?.user ?? null;
};

const loadHolidays = async () => {
  const year = Number(selectedDate.value.slice(0, 4));
  const response = await $fetch<{ occurrences?: HolidayOccurrence[] }>(
    `/api/admin/holiday-rules?year=${year}`,
    { credentials: "include" },
  );
  holidays.value = response?.occurrences ?? [];
};

const loadShifts = async () => {
  shifts.value = await $fetch<ShiftRecord[]>(
    `/api/admin/shift-records?start=${selectedDate.value}&end=${selectedDate.value}`,
    { credentials: "include" },
  );
  const lastShift = shifts.value.length
    ? shifts.value[shifts.value.length - 1]
    : null;
  prevEndingBox.value = lastShift ? (lastShift.ending_box ?? null) : null;
};

const submitMicShift = async (payload: Record<string, unknown>) => {
  const record = await $fetch<ShiftRecord>("/api/admin/mic/shifts", {
    method: "POST",
    body: payload,
    credentials: "include",
  });
  shifts.value.unshift(record);
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  router.push("/admin/login");
};

watch(
  () => selectedDate.value,
  async () => {
    await loadHolidays();
    await loadShifts();
  },
  { immediate: true },
);

onMounted(loadSession);
</script>
