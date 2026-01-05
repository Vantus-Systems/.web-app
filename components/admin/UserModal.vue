<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"
      >
        <h3 class="text-lg font-black text-slate-800 uppercase tracking-wide">
          {{ isEditing ? "Edit User" : "Create User" }}
        </h3>
        <button
          class="text-slate-400 hover:text-slate-600 transition-colors"
          @click="close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        <form id="userForm" class="space-y-4" @submit.prevent="submit">
          <!-- Identity -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                Username <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="jdoe"
                :disabled="isEditing"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                Role <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.role"
                required
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
                <option value="OWNER">Owner</option>
                <option value="MIC">MIC</option>
                <option value="CHARITY">Charity</option>
                <option value="CALLER">Caller</option>
              </select>
            </div>
          </div>

          <!-- Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                First Name
              </label>
              <input
                v-model="form.firstName"
                type="text"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="John"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                Last Name
              </label>
              <input
                v-model="form.lastName"
                type="text"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Contact -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                Email
              </label>
              <input
                v-model="form.email"
                type="email"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                Phone
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <!-- Security & Status -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
              >
                Password {{ isEditing ? "(Leave blank to keep)" : "*" }}
              </label>
              <input
                v-model="form.password"
                type="password"
                :required="!isEditing"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="••••••••••••"
              />
              <p v-if="!isEditing" class="text-[10px] text-slate-400 mt-1">
                Must be at least 12 chars, incl. uppercase, lowercase, number,
                special char.
              </p>
            </div>
            <div class="flex items-end pb-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.isActive"
                  type="checkbox"
                  class="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 border-slate-300"
                />
                <span class="text-sm font-semibold text-slate-700"
                  >Account Active</span
                >
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"
      >
        <button
          type="button"
          class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors uppercase tracking-wider"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="userForm"
          :disabled="loading"
          class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "Saving..." : "Save User" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { AdminUser } from "~/types/admin";

const props = defineProps<{
  isOpen: boolean;
  user: AdminUser | null;
  loading: boolean;
}>();

const emit = defineEmits(["close", "save"]);

const isEditing = computed(() => !!props.user);

const form = ref({
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "MIC",
  isActive: true,
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.value = {
        username: newUser.username,
        password: "", // Always blank on edit
        firstName: newUser.first_name || "",
        lastName: newUser.last_name || "",
        email: newUser.email || "",
        phone: newUser.phone || "",
        role: newUser.role || "MIC",
        isActive: newUser.is_active,
      };
    } else {
      // Reset for create
      form.value = {
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "MIC",
        isActive: true,
      };
    }
  },
  { immediate: true },
);

const close = () => {
  emit("close");
};

const submit = () => {
  emit("save", { ...form.value, id: props.user?.id });
};
</script>
