<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div class="flex items-center gap-4 flex-1 w-full md:w-auto">
        <div class="relative flex-1 md:max-w-xs">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            v-model="userSearch"
            type="text"
            placeholder="Search users..."
            class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          v-model="userRoleFilter"
          class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="OWNER">Owner</option>
          <option value="MIC">MIC</option>
          <option value="CHARITY">Charity</option>
          <option value="CALLER">Caller</option>
        </select>
      </div>

      <button
        class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
        @click="openCreateUser"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add User
      </button>
    </div>

    <!-- Table -->
    <div
      class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead
            class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200"
          >
            <tr>
              <th class="px-6 py-3 text-left">User</th>
              <th class="px-6 py-3 text-left">Role</th>
              <th class="px-6 py-3 text-left">Contact</th>
              <th class="px-6 py-3 text-left">Status</th>
              <th class="px-6 py-3 text-left">Last Login</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase"
                  >
                    {{ user.username.substring(0, 2) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">
                      {{ user.username }}
                    </div>
                    <div class="text-[10px] text-slate-500">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-purple-100 text-purple-700': user.role === 'OWNER',
                    'bg-blue-100 text-blue-700': user.role === 'MIC',
                    'bg-green-100 text-green-700': user.role === 'CHARITY',
                    'bg-orange-100 text-orange-700': user.role === 'CALLER',
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600">
                <div v-if="user.email" class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    />
                    <path
                      d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    />
                  </svg>
                  {{ user.email }}
                </div>
                <div v-if="user.phone" class="flex items-center gap-1 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                    />
                  </svg>
                  {{ user.phone }}
                </div>
                <span v-if="!user.email && !user.phone" class="text-slate-300"
                  >-</span
                >
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"
                  ></div>
                  <span
                    class="text-xs font-medium"
                    :class="user.is_active ? 'text-green-700' : 'text-red-700'"
                  >
                    {{ user.is_active ? "Active" : "Inactive" }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-500">
                {{
                  user.last_login_at
                    ? new Date(user.last_login_at).toLocaleDateString()
                    : "Never"
                }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="text-primary-600 hover:text-primary-800 font-bold uppercase text-[10px] tracking-wider"
                    @click="openEditUser(user)"
                  >
                    Edit
                  </button>
                  <button
                    class="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-wider"
                    @click="confirmDeleteUser(user)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <UserModal
      :is-open="userModalOpen"
      :user="selectedUser"
      :loading="userModalLoading"
      @close="userModalOpen = false"
      @save="handleSaveUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import UserModal from "~/components/admin/UserModal.vue";
import { useCsrf } from "~/composables/useCsrf";
import type { AdminUser } from "~/types/admin";

const { getHeaders } = useCsrf();

const users = ref<AdminUser[]>([]);
const userSearch = ref("");
const userRoleFilter = ref("");
const userModalOpen = ref(false);
const selectedUser = ref<AdminUser | null>(null);
const userModalLoading = ref(false);

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const searchLower = userSearch.value.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(searchLower) ||
      (user.first_name &&
        user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower));

    const matchesRole = userRoleFilter.value
      ? user.role === userRoleFilter.value
      : true;

    return matchesSearch && matchesRole;
  });
});

const loadUsers = async () => {
  try {
    const fetched = await $fetch<AdminUser[]>("/api/admin/users", {
      credentials: "include",
    });
    users.value = (Array.isArray(fetched) ? fetched : []).map((u) => ({
      ...u,
      role: u.role ?? "",
    }));
  } catch (e) {
    console.error("Failed to load users", e);
  }
};

const openCreateUser = () => {
  selectedUser.value = null;
  userModalOpen.value = true;
};

const openEditUser = (user: AdminUser) => {
  selectedUser.value = user;
  userModalOpen.value = true;
};

const handleSaveUser = async (formData: Partial<AdminUser>) => {
  userModalLoading.value = true;
  try {
    if (selectedUser.value) {
      // Edit
      const updated = await $fetch<AdminUser>(
        `/api/admin/users/${selectedUser.value.id}`,
        {
          method: "PATCH",
          body: formData,
          headers: getHeaders(),
          credentials: "include",
        },
      );
      // Update local list
      const index = users.value.findIndex((u) => u.id === updated.id);
      if (index !== -1) {
        users.value[index] = updated;
      }
    } else {
      // Create
      const created = await $fetch<AdminUser>("/api/admin/users", {
        method: "POST",
        body: formData,
        headers: getHeaders(),
        credentials: "include",
      });
      users.value.push(created);
    }
    userModalOpen.value = false;
  } catch (e: any) {
    alert(e?.message || "Failed to save user");
  } finally {
    userModalLoading.value = false;
  }
};

const confirmDeleteUser = async (user: AdminUser) => {
  if (!confirm(`Are you sure you want to delete user ${user.username}?`))
    return;

  try {
    await $fetch("/api/admin/users", {
      method: "DELETE",
      body: { id: user.id },
      headers: getHeaders(),
      credentials: "include",
    });
    users.value = users.value.filter((u) => u.id !== user.id);
  } catch (e: any) {
    alert(e?.message || "Failed to delete user");
  }
};

onMounted(() => {
  loadUsers();
});
</script>
