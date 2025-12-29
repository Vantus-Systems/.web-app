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
          @click="deleteShift"
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
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import ShiftForm from "~/components/admin/mic/ShiftForm.vue";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const route = useRoute();
const session = ref<{ username: string; role: string } | null>(null);
const record = ref<any | null>(null);
const draft = ref<any | null>(null);

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

const deleteShift = async () => {
  await $fetch(`/api/admin/shift-records/${route.params.id}`, {
    method: "DELETE",
    credentials: "include",
  });
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
