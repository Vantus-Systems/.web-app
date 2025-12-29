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
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex flex-col items-end mr-4">
              <span class="text-white text-xs font-bold">{{ userLabel }}</span>
              <span
                class="text-[10px] text-slate-400 uppercase tracking-widest"
                >{{ roleLabelText }}</span
              >
            </div>
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
          <header class="mb-8">
            <p
              class="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-1"
            >
              {{ subtitle }}
            </p>
            <h1 class="text-4xl font-black text-primary-950 tracking-tight">
              {{ title }}
            </h1>
          </header>
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AdminSidebar from "~/components/admin/AdminSidebar.vue";
import { roleLabel } from "~/utils/roles";

const props = defineProps<{
  title: string;
  subtitle?: string;
  userRole?: string | null;
  userName?: string | null;
}>();

defineEmits(["logout"]);

const userLabel = computed(() => props.userName || "System User");
const roleLabelText = computed(() => roleLabel(props.userRole));
</script>
