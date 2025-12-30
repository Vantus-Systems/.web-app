<template>
  <AdminShell
    title="Shift Detail"
    subtitle="MIC Operations"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Shift Record
          </p>
          <h3 class="text-xl font-black text-primary-900">
            {{ record?.date?.slice(0, 10) }} • {{ record?.shift }}
          </h3>
        </div>
        <button
          class="text-xs font-bold text-rose-600 border border-rose-200 rounded-lg px-3 py-2"
          @click="isDeleteOpen = true"
        >
          Delete
        </button>
      </div>

      <ShiftForm
        v-if="record"
        v-model="draft"
        :available-shifts="['AM', 'PM']"
        :prev-ending-box="record.prev_shift?.ending_box ?? null"
        submit-label="Update Shift"
        @submit="updateShift"
      />
    </div>

    <BaseModal v-model="isDeleteOpen" title="Delete shift record">
      <p class="text-sm text-slate-600">
        This will archive the shift record and remove it from daily totals. This
        action cannot be undone.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-2 text-xs font-bold text-slate-500"
            @click="isDeleteOpen = false"
          >
            Cancel
          </button>
          <button
            class="px-3 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg"
            @click="confirmDelete"
          >
            Delete Shift
          </button>
        </div>
      </template>
    </BaseModal>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import ShiftForm from "~/components/admin/mic/ShiftForm.vue";
import BaseModal from "~/components/ui/BaseModal.vue";
import type { ShiftRecord } from "~/types/admin";

type ShiftFormValue = {
  date: string;
  shift: "AM" | "PM";
  pulltabs_total: number;
  deposit_total: number;
  players?: number;
  workflow_type: "NORMAL" | "NEGATIVE_BINGO_BOX" | "RECUPERATION_BOX_RETURN";
  beginning_box?: number;
  ending_box?: number;
  bingo_actual?: number;
  deposit_actual?: number;
  notes?: string;
  prev_shift_id?: string;
};

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const route = useRoute();
const session = ref<{ username: string; role: string } | null>(null);
const record = ref<ShiftRecord | null>(null);
const draft = ref<ShiftFormValue | null>(null);
const isDeleteOpen = ref(false);

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const loadShift = async () => {
  const data = await $fetch(`/api/admin/shift-records/${route.params.id}`, {
    credentials: "include",
  });
  record.value = data;
  draft.value = {
    date: data.date.slice(0, 10),
    shift: data.shift,
    pulltabs_total: data.pulltabs_total,
    deposit_total: data.deposit_total,
    players: data.players ?? 0,
    workflow_type: data.workflow_type,
    beginning_box: data.beginning_box ?? undefined,
    ending_box: data.ending_box ?? undefined,
    bingo_actual: data.bingo_actual ?? undefined,
    deposit_actual: data.deposit_actual ?? undefined,
    notes: data.notes ?? "",
    prev_shift_id: data.prev_shift_id ?? undefined,
  };
};

const updateShift = async (payload: any) => {
  record.value = await $fetch(`/api/admin/shift-records/${route.params.id}`, {
    method: "PUT",
    body: payload,
    credentials: "include",
  });
};

const confirmDelete = async () => {
  await $fetch(`/api/admin/shift-records/${route.params.id}`, {
    method: "DELETE",
    credentials: "include",
  });
  isDeleteOpen.value = false;
  router.push("/admin/mic/shifts");
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  router.push("/admin/login");
};

onMounted(async () => {
  await loadSession();
  await loadShift();
});
</script>
