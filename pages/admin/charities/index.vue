<template>
  <AdminShell
    title="Charity Dashboard"
    subtitle="Partner View"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <div
        class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6"
      >
        <!-- Charities Table -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
              >
                Partners
              </p>
              <h3 class="text-xl font-black text-primary-900">
                Charities ({{ charities.length }})
              </h3>
            </div>
          </div>

          <div v-if="charities.length === 0" class="text-center py-8">
            <p class="text-sm text-slate-500">No charities added yet</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead
                class="text-slate-500 uppercase tracking-widest bg-slate-50"
              >
                <tr>
                  <th class="px-3 py-2 text-left">Name</th>
                  <th class="px-3 py-2 text-left">Contact</th>
                  <th class="px-3 py-2 text-left">Tax ID</th>
                  <th class="px-3 py-2 text-left">Active</th>
                  <th class="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="charity in charities"
                  :key="charity.id"
                  class="border-t border-slate-200"
                >
                  <td class="px-3 py-2">
                    <div class="font-semibold text-slate-900">
                      {{ charity.name }}
                    </div>
                    <div class="text-[10px] text-slate-500">
                      {{ charity.description }}
                    </div>
                  </td>
                  <td class="px-3 py-2 text-slate-600">
                    {{ charity.contact_person }}
                  </td>
                  <td class="px-3 py-2 text-slate-600">{{ charity.tax_id }}</td>
                  <td class="px-3 py-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded text-[10px] font-bold',
                        charity.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600',
                      ]"
                    >
                      {{ charity.is_active ? "Active" : "Inactive" }}
                    </span>
                  </td>
                  <td class="px-3 py-2 flex gap-2">
                    <button
                      class="text-xs font-bold text-primary-700 hover:text-primary-900"
                      @click="selectCharity(charity)"
                    >
                      Edit
                    </button>
                    <button
                      class="text-xs font-bold text-rose-700 hover:text-rose-900"
                      @click="deleteCharity(charity.id)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Charity Form -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <p
              class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
            >
              {{ editingId ? "Edit" : "Add" }}
            </p>
            <h3 class="text-lg font-black text-primary-900">
              {{ editingId ? "Update Charity" : "New Charity" }}
            </h3>
          </div>

          <form class="space-y-3" @submit.prevent="saveCharity">
            <div>
              <label class="block">
                <span class="text-xs font-bold text-slate-600 block mb-2">
                  Charity Name *
                </span>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  placeholder="Enter charity name"
                />
              </label>
            </div>

            <div>
              <label class="block">
                <span class="text-xs font-bold text-slate-600 block mb-2">
                  Description
                </span>
                <textarea
                  v-model="form.description"
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm h-20"
                  placeholder="Charity description"
                />
              </label>
            </div>

            <div>
              <label class="block">
                <span class="text-xs font-bold text-slate-600 block mb-2">
                  Contact Person *
                </span>
                <input
                  v-model="form.contact_person"
                  type="text"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  placeholder="Contact name"
                />
              </label>
            </div>

            <div>
              <label class="block">
                <span class="text-xs font-bold text-slate-600 block mb-2">
                  Tax ID / EIN *
                </span>
                <input
                  v-model="form.tax_id"
                  type="text"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  placeholder="XX-XXXXXXX"
                />
              </label>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="rounded"
                />
                Active
              </label>
            </div>

            <div class="flex gap-2">
              <button
                class="flex-1 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] py-2 rounded-lg hover:bg-primary-800 transition-colors"
              >
                {{ editingId ? "Update" : "Create" }}
              </button>
              <button
                v-if="editingId"
                type="button"
                class="flex-1 bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-[0.3em] py-2 rounded-lg hover:bg-slate-300 transition-colors"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import { useCsrf } from "~/composables/useCsrf";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["CHARITY", "OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{ username?: string; role?: any } | null>(null);
const charities = ref<any[]>([]);
const editingId = ref<string | null>(null);
const form = ref({
  name: "",
  description: "",
  contact_person: "",
  tax_id: "",
  is_active: true,
});

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const loadCharities = () => {
  try {
    // Placeholder: In a real implementation, this would fetch from an API
    charities.value = [];
  } catch (e) {
    console.error("Error loading charities", e);
  }
};

const selectCharity = (charity: any) => {
  editingId.value = charity.id;
  form.value = { ...charity };
};

const cancelEdit = () => {
  editingId.value = null;
  resetForm();
};

const resetForm = () => {
  form.value = {
    name: "",
    description: "",
    contact_person: "",
    tax_id: "",
    is_active: true,
  };
};

const saveCharity = async () => {
  try {
    if (editingId.value) {
      // Update existing charity
      const updated = await $fetch(`/api/admin/charities/${editingId.value}`, {
        method: "PUT",
        body: form.value,
        headers: getHeaders(),
        credentials: "include",
      });
      charities.value = charities.value.map((c) =>
        c.id === editingId.value ? updated : c,
      );
    } else {
      // Create new charity
      const created = await $fetch("/api/admin/charities", {
        method: "POST",
        body: form.value,
        headers: getHeaders(),
        credentials: "include",
      });
      charities.value.push(created);
    }
    cancelEdit();
  } catch {
    alert("Error saving charity");
  }
};

const deleteCharity = async (id: string) => {
  if (!confirm("Are you sure you want to delete this charity?")) return;

  try {
    await $fetch(`/api/admin/charities/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    charities.value = charities.value.filter((c) => c.id !== id);
  } catch {
    alert("Error deleting charity");
  }
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

onMounted(async () => {
  await loadSession();
  await loadCharities();
});
</script>
