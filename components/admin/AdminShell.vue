<template>
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-900 h-screen flex flex-col overflow-hidden"
  >
    <nav
      class="bg-primary-950 shadow-2xl border-b border-primary-800 sticky top-0 z-50 shrink-0"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center gap-6">
            <div class="flex-shrink-0 flex items-center">
              <span
                class="text-gold font-black text-2xl tracking-tighter uppercase italic"
                >Mary Esther</span
              >
              <span
                class="ml-2 text-white font-light text-2xl tracking-widest uppercase"
                >Bingo</span
              >
              <div
                class="ml-4 px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-[10px] text-gold font-bold tracking-widest uppercase"
              >
                Admin
              </div>
            </div>

            <!-- Breadcrumbs -->
            <div class="hidden md:block ml-6">
              <AdminBreadcrumbs :breadcrumbs="breadcrumbs" />
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Environment Badge -->
            <AdminEnvironmentBadge :environment="environment" />

            <!-- Command Palette Button -->
            <button
              class="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary-800/50 hover:bg-primary-800 text-slate-300 rounded-lg text-xs transition-colors border border-primary-700"
              @click="commandPaletteOpen = true"
              aria-label="Open command palette"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search</span>
              <kbd class="px-1.5 py-0.5 bg-primary-900/50 rounded text-[10px] font-mono">⌘K</kbd>
            </button>

            <!-- Help Button -->
            <button
              class="p-2 bg-primary-800/50 hover:bg-primary-800 text-slate-300 rounded-lg transition-colors border border-primary-700"
              @click="helpPanelOpen = true"
              aria-label="Open help panel"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            <!-- User Info -->
            <div class="hidden md:flex flex-col items-end mr-4">
              <span class="text-white text-xs font-bold">{{ userLabel }}</span>
              <span
                class="text-[10px] text-slate-400 uppercase tracking-widest"
                >{{ roleLabelText }}</span
              >
            </div>

            <!-- Logout Button -->
            <button
              class="bg-primary-800 hover:bg-red-900/40 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold border border-primary-700 transition-colors"
              @click="$emit('logout')"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex flex-1 relative z-10 min-h-0">
      <AdminSidebar :role="userRole" />
      <main class="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
          <slot />
        </div>
      </main>
    </div>

    <!-- Command Palette -->
    <AdminCommandPalette v-model="commandPaletteOpen" />

    <!-- Help Panel -->
    <AdminHelpPanel v-model="helpPanelOpen" :title="helpTitle">
      <slot name="help">
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-primary-950 mb-2">Quick Tips</h3>
            <ul class="space-y-2 text-sm text-slate-700">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Press <kbd class="px-1 py-0.5 bg-slate-100 rounded text-xs font-mono">⌘K</kbd> to quickly search and navigate</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>All changes are logged for audit trail</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Use drafts to preview changes before publishing</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold text-primary-950 mb-2">Your Permissions</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="permission in userPermissions"
                :key="permission"
                class="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
              >
                {{ permission }}
              </span>
            </div>
          </div>
        </div>
      </slot>
    </AdminHelpPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AdminSidebar from "~/components/admin/AdminSidebar.vue";
import AdminBreadcrumbs from "~/components/admin/ui/AdminBreadcrumbs.vue";
import AdminEnvironmentBadge from "~/components/admin/ui/AdminEnvironmentBadge.vue";
import AdminCommandPalette from "~/components/admin/ui/AdminCommandPalette.vue";
import AdminHelpPanel from "~/components/admin/ui/AdminHelpPanel.vue";
import { roleLabel } from "~/utils/roles";
import { usePermissions } from "~/composables/usePermissions";

interface Breadcrumb {
  label: string;
  path: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    userRole?: string | null;
    userName?: string | null;
    breadcrumbs?: Breadcrumb[];
    helpTitle?: string;
    environment?: "production" | "staging" | "development";
  }>(),
  {
    title: "",
    subtitle: "",
    breadcrumbs: () => [
      { label: "Admin", path: "/admin" },
    ],
    helpTitle: "Help & Quick Tips",
    environment: "development",
  },
);

defineEmits(["logout"]);

const commandPaletteOpen = ref(false);
const helpPanelOpen = ref(false);

const userLabel = computed(() => props.userName || "System User");
const roleLabelText = computed(() => roleLabel(props.userRole));

const { permissions } = usePermissions(props.userRole);
const userPermissions = computed(() => permissions.value.slice(0, 8)); // Show first 8
</script>
