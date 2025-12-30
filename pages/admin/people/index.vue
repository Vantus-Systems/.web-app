<template>
  <AdminShell
    title="People & Shifts"
    subtitle="User Profiles"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <!-- Search and Filters -->
      <UserSearchFilters
        :search="searchQuery"
        :filters="activeFilters"
        @update="updateFilters"
      />

      <!-- Bulk Actions -->
      <BulkActions
        :selected="selectedUsers"
        @bulk-approve="handleBulkApprove"
        @bulk-deactivate="handleBulkDeactivate"
      />

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
              <h3 class="text-xl font-black text-primary-900">
                Profiles ({{ filteredUsers.length }})
              </h3>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead class="text-slate-500 uppercase tracking-widest bg-slate-50">
                <tr>
                  <th class="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      :checked="allSelected"
                      @change="toggleSelectAll"
                      class="rounded"
                    />
                  </th>
                  <th class="px-3 py-2 text-left">User</th>
                  <th class="px-3 py-2 text-left">Role</th>
                  <th class="px-3 py-2 text-left">Active</th>
                  <th class="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="border-t border-slate-200"
                >
                  <td class="px-3 py-2">
                    <input
                      type="checkbox"
                      :checked="selectedUsers.includes(user.id)"
                      @change="toggleUserSelection(user.id)"
                      class="rounded"
                    />
                  </td>
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
              name="username"
              autocomplete="username"
              class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Username"
            />
            <input
              v-model="newUser.password"
              type="password"
              name="password"
              autocomplete="new-password"
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
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import UserSearchFilters from "~/components/admin/UserSearchFilters.vue";
import BulkActions from "~/components/admin/BulkActions.vue";
import type { AdminUser } from "~/types/admin";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const session = ref<{ username: string; role: string } | null>(null);
const users = ref<AdminUser[]>([]);
const selectedUsers = ref<string[]>([]);
const searchQuery = ref("");
const activeFilters = ref({
  role: "",
  status: "",
});

const newUser = ref({
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "MIC",
  isActive: true,
});

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    // Search filter
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(searchLower) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // Role filter
    if (activeFilters.value.role && user.role !== activeFilters.value.role) {
      return false;
    }

    // Status filter
    if (activeFilters.value.status === "active" && !user.is_active) {
      return false;
    }
    if (activeFilters.value.status === "inactive" && user.is_active) {
      return false;
    }

    return true;
  });
});

const allSelected = computed(() => {
  return (
    filteredUsers.value.length > 0 &&
    filteredUsers.value.every((u) => selectedUsers.value.includes(u.id))
  );
});

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value = selectedUsers.value.filter(
      (id) => !filteredUsers.value.map((u) => u.id).includes(id),
    );
  } else {
    filteredUsers.value.forEach((u) => {
      if (!selectedUsers.value.includes(u.id)) {
        selectedUsers.value.push(u.id);
      }
    });
  }
};

const toggleUserSelection = (userId: string) => {
  const idx = selectedUsers.value.indexOf(userId);
  if (idx > -1) {
    selectedUsers.value.splice(idx, 1);
  } else {
    selectedUsers.value.push(userId);
  }
};

const updateFilters = (payload: { search: string; filters: any }) => {
  searchQuery.value = payload.search;
  activeFilters.value = payload.filters;
  selectedUsers.value = []; // Reset selection on filter change
};

const handleBulkApprove = async () => {
  // Implementation for bulk approve
  alert(`Approved ${selectedUsers.value.length} user(s)`);
  selectedUsers.value = [];
};

const handleBulkDeactivate = async () => {
  // Implementation for bulk deactivate
  for (const userId of selectedUsers.value) {
    const user = users.value.find((u) => u.id === userId);
    if (user) {
      user.is_active = false;
      await saveUser(user);
    }
  }
  selectedUsers.value = [];
};

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
