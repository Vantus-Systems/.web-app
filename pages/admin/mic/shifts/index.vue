<template>
  <AdminShell
    title="Shift Management"
    subtitle="View & Manage Shift Records"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 uppercase tracking-wider">
            All Shift Records
          </h3>
          <div class="flex flex-wrap gap-4 items-end">
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
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">MIC User</label>
              <select v-model="shiftFilters.userId" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none min-w-[180px]">
                <option value="">All</option>
                <option v-for="u in micUsers" :key="u.id" :value="u.id">
                  {{ u.first_name }} {{ u.last_name }} (@{{ u.username }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Shift</label>
              <select v-model="shiftFilters.shift" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">All</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Workflow</label>
              <select v-model="shiftFilters.workflow" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none min-w-[220px]">
                <option value="">All</option>
                <option value="NORMAL">Normal</option>
                <option value="NEGATIVE_BINGO_BOX">Negative Bingo Box</option>
                <option value="RECUPERATION_BOX_RETURN">Recuperation Box Return</option>
              </select>
            </div>
            <button
              class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors h-[34px]"
              @click="loadAllShifts"
            >
              Refresh
            </button>
            <button
              class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors h-[34px]"
              @click="exportCsv"
            >
              Export CSV
            </button>
            <NuxtLink
              to="/admin/mic/shifts/new"
              class="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors h-[34px] flex items-center"
            >
              New Shift
            </NuxtLink>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deposit to Bank</span>
              <span class="font-mono font-bold">{{ formatCurrency(summary.depositBankSum) }}</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Actual Revenue</span>
                <HelpTip text="Deposit to Bank + Box Change. If Deposit is $5,000 and Box Change is +$1,265, Actual Revenue is $6,265." />
              </div>
              <span class="font-mono font-bold" :class="summary.actualRevenueSum >= 0 ? 'text-slate-900' : 'text-red-600'">{{ formatCurrency(summary.actualRevenueSum) }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pulltabs Net</span>
              <span class="font-mono">{{ formatCurrency(summary.pulltabsSum) }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bingo (Actual)</span>
              <span class="font-mono" :class="summary.bingoActualSum >= 0 ? 'text-slate-900' : 'text-red-600'">{{ formatCurrency(summary.bingoActualSum) }}</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Box Change</span>
                <HelpTip text="If the box does not start and end the period at the same amount, totals may differ by the box change." />
              </div>
              <span class="font-mono" :class="summary.boxChangeSum >= 0 ? 'text-slate-900' : 'text-red-600'">{{ formatCurrency(summary.boxChangeSum) }}</span>
            </div>
          </div>
        </div>

        <ShiftsTable :shifts="allShifts" />
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import ShiftsTable from "~/components/admin/ShiftsTable.vue";
import { useCsrf } from "~/composables/useCsrf";
import type { ShiftRecord, AdminUser } from "~/types/admin";
import HelpTip from "~/components/ui/HelpTip.vue";
import { formatCurrency } from "~/utils/format";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const { getHeaders } = useCsrf();
const session = ref<{ username?: string | null; role?: string | null } | null>(null);

const allShifts = ref<ShiftRecord[]>([]);
const micUsers = ref<AdminUser[]>([]);
const shiftFilters = ref({
  start: "",
  end: "",
  userId: "",
  shift: "",
  workflow: "",
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
    if (shiftFilters.value.userId) params.userId = shiftFilters.value.userId;
    if (shiftFilters.value.shift) params.shift = shiftFilters.value.shift;
    if (shiftFilters.value.workflow) params.workflow = shiftFilters.value.workflow;

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

const loadMicUsers = async () => {
  try {
    const users = await $fetch<AdminUser[]>("/api/admin/users", { credentials: "include" });
    micUsers.value = users.filter((u) => u.role === "MIC" && u.is_active);
  } catch (e) {
    micUsers.value = [];
  }
};

const summary = computed(() => {
  const rows = allShifts.value;
  const depositBankSum = rows.reduce((acc, r) => acc + (r.deposit_total || 0), 0);
  const actualRevenueSum = rows.reduce((acc, r) => acc + (r.actual_revenue ?? 0), 0);
  const pulltabsSum = rows.reduce((acc, r) => acc + (r.pulltabs_total || 0), 0);
  const bingoActualSum = rows.reduce((acc, r) => acc + (r.bingo_actual ?? 0), 0);
  const boxChangeSum = rows.reduce((acc, r) => acc + (r.box_delta ?? 0), 0);
  return { depositBankSum, actualRevenueSum, pulltabsSum, bingoActualSum, boxChangeSum };
});

const exportCsv = () => {
  const headers = [
    "Date",
    "Shift",
    "MIC Username",
    "Deposit to Bank",
    "Actual Revenue",
    "Pulltabs Net",
    "Bingo (Deposited)",
    "Bingo (Actual)",
    "Box Start",
    "Box End",
    "Box Change",
    "Players",
    "Workflow",
    "Notes",
  ];
  const lines = allShifts.value.map((r) => [
    r.date,
    r.shift,
    r.created_by?.username ?? "",
    (r.deposit_bank_total ?? r.deposit_total ?? 0).toString(),
    (r.actual_revenue ?? 0).toString(),
    (r.pulltabs_total ?? 0).toString(),
    ((r.bingo_deposited ?? (r.deposit_total - r.pulltabs_total)) ?? 0).toString(),
    (r.bingo_actual ?? 0).toString(),
    (r.beginning_box ?? "").toString(),
    (r.ending_box ?? "").toString(),
    (r.box_delta ?? 0).toString(),
    r.shift === "PM" ? (r.players ?? "").toString() : "",
    r.workflow_type ?? "",
    (r.notes ?? "").replace(/\n/g, " ").replace(/\r/g, " "),
  ]);
  const csvContent = [headers.join(","), ...lines.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shifts_${shiftFilters.value.start || ""}_${shiftFilters.value.end || ""}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

onMounted(async () => {
  await loadSession();
  await loadMicUsers();
  // Initialize filters for All Shifts
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  shiftFilters.value.start = firstDay.toISOString().slice(0, 10);
  shiftFilters.value.end = lastDay.toISOString().slice(0, 10);
  await loadAllShifts();
});
</script>
