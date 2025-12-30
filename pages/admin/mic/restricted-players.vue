<template>
  <AdminShell
    title="Restricted Players"
    subtitle="MIC Ops"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Search
          <input
            v-model="search"
            type="text"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            placeholder="Search name"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Name
          <input
            v-model="form.name"
            type="text"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Notes
          <input
            v-model="form.notes"
            type="text"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </label>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="px-4 py-2 bg-primary-900 text-white font-bold rounded-lg"
          @click="create"
        >
          Add
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-slate-200 rounded-lg"
          @click="reset"
        >
          Reset
        </button>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div
          v-for="player in filtered"
          :key="player.id"
          class="flex items-center justify-between"
        >
          <div>
            <p class="font-semibold text-slate-700">{{ player.name }}</p>
            <p class="text-xs text-slate-500">{{ player.notes }}</p>
          </div>
          <button
            type="button"
            class="text-xs text-rose-600 font-semibold"
            @click="deactivate(player.id)"
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AdminShell from "~/components/admin/AdminShell.vue";

const router = useRouter();
const session = ref<{ username: string; role: string } | null>(null);
const allPlayers = ref<Array<{ id: string; name: string; notes?: string }>>([]);
const search = ref("");
const form = ref({ name: "", notes: "" });

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const loadPlayers = async () => {
  const response = await $fetch("/api/admin/mic/restricted-players", {
    credentials: "include",
  });
  allPlayers.value = response;
};

const filtered = computed(() => {
  if (!search.value) {
    return allPlayers.value;
  }
  return allPlayers.value.filter((player) =>
    player.name.toLowerCase().includes(search.value.toLowerCase()),
  );
});

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  router.push("/admin/login");
};

const create = async () => {
  if (!form.value.name) {
    return;
  }
  await $fetch("/api/admin/mic/restricted-players", {
    method: "POST",
    body: form.value,
    credentials: "include",
  });
  await loadPlayers();
  reset();
};

const deactivate = async (id: string) => {
  await $fetch(`/api/admin/mic/restricted-players/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await loadPlayers();
};

const reset = () => {
  form.value = { name: "", notes: "" };
};

const enforceOwner = () => {
  if (session.value?.role !== "OWNER") {
    router.push("/admin");
  }
};

onMounted(async () => {
  await loadSession();
  await loadPlayers();
  enforceOwner();
});
</script>
