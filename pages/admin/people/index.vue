<template>
  <AdminShell
    title="People & Shifts"
    subtitle="User Profiles"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6"
    >
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
            >
              Users
            </p>
            <h3 class="text-xl font-black text-primary-900">Profiles</h3>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-xs">
            <thead class="text-slate-500 uppercase tracking-widest bg-slate-50">
              <tr>
                <th class="px-3 py-2 text-left">User</th>
                <th class="px-3 py-2 text-left">Role</th>
                <th class="px-3 py-2 text-left">Active</th>
                <th class="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-t border-slate-200"
              >
                <td class="px-3 py-2">
                  <div class="font-semibold text-slate-900">
                    {{ user.username }}
                  </div>
                  <div class="text-[10px] text-slate-500">
                    {{ user.first_name || "" }} {{ user.last_name || "" }}
                  </div>
                </td>
                <td class="px-3 py-2">
                  <select
                    v-model="user.role"
                    class="rounded-lg border-slate-200 bg-slate-50 text-xs"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="MIC">MIC</option>
                    <option value="CHARITY">Charity</option>
                  </select>
                </td>
                <td class="px-3 py-2">
                  <input
                    v-model="user.is_active"
                    type="checkbox"
                    class="rounded"
                  />
                </td>
                <td class="px-3 py-2">
                  <button
                    class="text-xs font-bold text-primary-700"
                    @click="saveUser(user)"
                  >
                    Save
                  </button>
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
            Add User
          </p>
          <h3 class="text-lg font-black text-primary-900">Create Profile</h3>
        </div>

        <form class="space-y-3" @submit.prevent="createUser">
          <input
            v-model="newUser.username"
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            placeholder="Username"
          />
          <input
            v-model="newUser.password"
            type="password"
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            placeholder="Password"
          />
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="newUser.firstName"
              class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="First name"
            />
            <input
              v-model="newUser.lastName"
              class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Last name"
            />
          </div>
          <select
            v-model="newUser.role"
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="OWNER">Owner</option>
            <option value="MIC">MIC</option>
            <option value="CHARITY">Charity</option>
          </select>
          <label
            class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            <input v-model="newUser.isActive" type="checkbox" class="rounded" />
            Active
          </label>
          <button
            class="w-full bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] py-2 rounded-lg"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const session = ref<{ username: string; role: string } | null>(null);
const users = ref<any[]>([]);
const newUser = ref({
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "MIC",
  isActive: true,
});

const loadUsers = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
  users.value = await $fetch("/api/admin/users", { credentials: "include" });
};

const createUser = async () => {
  const user = await $fetch("/api/admin/users", {
    method: "POST",
    body: newUser.value,
    credentials: "include",
  });
  users.value.push(user);
  newUser.value = {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "MIC",
    isActive: true,
  };
};

const saveUser = async (user: any) => {
  const updated = await $fetch(`/api/admin/users/${user.id}`, {
    method: "PATCH",
    body: {
      role: user.role,
      isActive: user.is_active,
    },
    credentials: "include",
  });
  users.value = users.value.map((entry) =>
    entry.id === updated.id ? updated : entry,
  );
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  router.push("/admin/login");
};

onMounted(loadUsers);
</script>
