<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-primary-900 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div
              class="flex-shrink-0 flex items-center text-gold font-bold text-xl"
            >
              Admin Portal
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                v-for="tab in visibleTabs"
                :key="tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-gold text-white'
                    : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                ]"
                @click="currentTab = tab.id"
              >
                {{ tab.name }}
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span v-if="user" class="text-gray-300 text-sm">Hello, {{ user.name }} ({{ user.role }})</span>
            <button
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ currentTabName }}
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Loading State -->
            <div v-if="pending" class="text-center py-12">
              <div
                class="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto"
              ></div>
              <p class="mt-4 text-gray-600">Loading data...</p>
            </div>

            <!-- Tab Content -->
            <div v-else class="bg-white shadow rounded-lg p-6">

              <!-- Users Tab -->
              <div v-if="currentTab === 'users' && isAdmin">
                <div class="flex justify-end mb-4">
                    <button @click="openUserModal()" class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600">
                        Add New User
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="u in usersData" :key="u.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ u.name }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ u.username }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span :class="u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                        {{ u.role === 'mic' ? 'MIC' : 'Admin' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="openUserModal(u)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button v-if="u.id !== user?.id" @click="deleteUser(u.id)" class="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- User Modal -->
                <div v-if="showUserModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeUserModal"></div>
                        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {{ editingUser ? 'Edit User' : 'Add New User' }}
                                </h3>
                                <div class="mt-4 space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Name</label>
                                        <input v-model="userForm.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Username</label>
                                        <input v-model="userForm.username" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Role</label>
                                        <select v-model="userForm.role" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                            <option value="admin">Admin</option>
                                            <option value="mic">MIC</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Password {{ editingUser ? '(Leave blank to keep current)' : '' }}</label>
                                        <input v-model="userForm.password" type="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gold text-base font-medium text-primary-900 hover:bg-gold-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" @click="saveUser">
                                    Save
                                </button>
                                <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="closeUserModal">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <!-- Business Info Tab -->
              <div v-if="currentTab === 'business'">
                <form class="space-y-6" @submit.prevent="saveBusinessInfo">
                  <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                      <label class="block text-sm font-medium text-gray-700"
                        >Phone</label
                      >
                      <input
                        v-model="businessData.phone"
                        type="text"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div class="sm:col-span-3">
                      <label class="block text-sm font-medium text-gray-700"
                        >Email</label
                      >
                      <input
                        v-model="businessData.email"
                        type="email"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label class="block text-sm font-medium text-gray-700"
                        >Address</label
                      >
                      <input
                        v-model="businessData.address"
                        type="text"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label class="block text-sm font-medium text-gray-700"
                        >Map Embed URL</label
                      >
                      <input
                        v-model="businessData.mapUrl"
                        type="text"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <!-- Jackpot Tab -->
              <div v-if="currentTab === 'jackpot'">
                <form class="space-y-6" @submit.prevent="saveJackpot">
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Current Jackpot Amount</label
                    >
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span class="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        v-model="jackpotData.amount"
                        type="number"
                        step="0.01"
                        class="focus:ring-gold-500 focus:border-gold-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Last Updated</label
                    >
                    <input
                      v-model="jackpotData.lastUpdated"
                      type="text"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g. Today at 5PM"
                    />
                  </div>
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Update Jackpot
                    </button>
                  </div>
                </form>
              </div>

              <!-- Pricing Tab (JSON Editor for flexibility) -->
              <div v-if="currentTab === 'pricing'">
                <p class="mb-4 text-sm text-gray-600">
                  Edit the pricing JSON directly to update the website pricing
                  tables.
                </p>
                <form @submit.prevent="savePricing">
                  <textarea
                    v-model="pricingJsonString"
                    rows="20"
                    class="font-mono text-sm w-full border border-gray-300 rounded p-4 bg-gray-50"
                  ></textarea>
                  <div class="flex justify-end mt-4">
                    <button
                      type="submit"
                      class="bg-gold text-primary-900 px-4 py-2 rounded font-bold hover:bg-gold-600"
                    >
                      Save Pricing
                    </button>
                  </div>
                </form>
              </div>

              <!-- Messages Tab -->
              <div v-if="currentTab === 'messages'">
                <div
                  v-if="messagesData.length === 0"
                  class="text-gray-500 text-center py-8"
                >
                  No messages yet.
                </div>
                <ul v-else class="divide-y divide-gray-200">
                  <li
                    v-for="msg in messagesData"
                    :key="msg.timestamp"
                    class="py-4"
                  >
                    <div class="flex space-x-3">
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-medium">{{ msg.name }}</h3>
                          <p class="text-sm text-gray-500">
                            {{ new Date(msg.timestamp).toLocaleString() }}
                          </p>
                        </div>
                        <p class="text-sm text-gray-500">
                          {{ msg.email }} | {{ msg.phone }}
                        </p>
                        <p class="text-sm text-gray-800 mt-2">
                          {{ msg.message }}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const user = ref<any>(null);

// Data refs
const businessData = ref<any>({});
const jackpotData = ref<any>({});
const pricingData = ref<any>({});
const pricingJsonString = ref("");
const messagesData = ref<any[]>([]);
const usersData = ref<any[]>([]);
const pending = ref(true);

// User Management State
const showUserModal = ref(false);
const editingUser = ref<any>(null);
const userForm = ref({
    name: '',
    username: '',
    role: 'mic',
    password: ''
});

const isAdmin = computed(() => user.value?.role === 'admin');

const tabs = computed(() => {
    const baseTabs = [
        { id: "business", name: "Business Info" },
        { id: "jackpot", name: "Jackpot" },
        { id: "pricing", name: "Pricing" },
        { id: "messages", name: "Messages" },
    ];
    if (isAdmin.value) {
        return [{ id: "users", name: "Users" }, ...baseTabs];
    }
    return baseTabs;
});

const visibleTabs = computed(() => tabs.value);

const currentTab = ref("business");
const currentTabName = computed(
  () => tabs.value.find((t) => t.id === currentTab.value)?.name || "Dashboard",
);

// Fetch all data
const loadData = async () => {
  pending.value = true;
  try {
    // Fetch user info first
    user.value = await $fetch('/api/auth/user');

    // Set default tab based on role if needed
    if (user.value.role === 'admin' && currentTab.value === 'business') {
        currentTab.value = 'users';
    }

    const promises: Promise<any>[] = [
      $fetch("/api/business"),
      $fetch("/api/jackpot"),
      $fetch("/api/pricing"),
      $fetch("/api/admin/messages").catch(() => []),
    ];

    if (user.value.role === 'admin') {
        promises.push($fetch("/api/admin/users").catch(() => []));
    }

    const results = await Promise.all(promises);

    businessData.value = results[0];
    jackpotData.value = results[1];
    pricingData.value = results[2];
    pricingJsonString.value = JSON.stringify(results[2], null, 2);
    messagesData.value = results[3];

    if (user.value.role === 'admin') {
        usersData.value = results[4];
    }

  } catch (e: any) {
    console.error("Failed to load data", e);
    if (e.response?.status === 401) {
        router.push('/admin/login');
    }
  } finally {
    pending.value = false;
  }
};

onMounted(loadData);

// Watch for tab changes to fetch data if needed (though we load all upfront for simplicity here)
// If we had pagination we would fetch on demand.

// Save Handlers
const saveBusinessInfo = async () => {
  await $fetch("/api/admin/business", {
    method: "POST",
    body: businessData.value,
  });
  alert("Business Info Saved!");
};

const saveJackpot = async () => {
  await $fetch("/api/admin/jackpot", {
    method: "POST",
    body: jackpotData.value,
  });
  alert("Jackpot Updated!");
};

const savePricing = async () => {
  try {
    const parsed = JSON.parse(pricingJsonString.value);
    await $fetch("/api/admin/pricing", { method: "POST", body: parsed });
    pricingData.value = parsed;
    alert("Pricing Updated!");
  } catch {
    alert("Invalid JSON format!");
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/admin/login"; // Full reload to clear state
};

// User Management Functions
const openUserModal = (u: any = null) => {
    if (u) {
        editingUser.value = u;
        userForm.value = {
            name: u.name,
            username: u.username,
            role: u.role,
            password: ''
        };
    } else {
        editingUser.value = null;
        userForm.value = {
            name: '',
            username: '',
            role: 'mic',
            password: ''
        };
    }
    showUserModal.value = true;
};

const closeUserModal = () => {
    showUserModal.value = false;
    editingUser.value = null;
    userForm.value = { name: '', username: '', role: 'mic', password: '' };
};

const saveUser = async () => {
    try {
        const body: any = { ...userForm.value };
        if (editingUser.value) {
            body.id = editingUser.value.id;
        }

        const { user: savedUser } = await $fetch('/api/admin/users', {
            method: 'POST',
            body
        });

        if (editingUser.value) {
            const index = usersData.value.findIndex(u => u.id === savedUser.id);
            if (index !== -1) usersData.value[index] = savedUser;
        } else {
            usersData.value.push(savedUser);
        }

        closeUserModal();
    } catch (e: any) {
        alert(e.data?.statusMessage || "Failed to save user");
    }
};

const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
        await $fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
        usersData.value = usersData.value.filter(u => u.id !== id);
    } catch (e: any) {
        alert(e.data?.statusMessage || "Failed to delete user");
    }
};
</script>
