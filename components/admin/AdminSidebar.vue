<template>
  <aside
    class="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-200 h-full"
  >
    <div class="px-6 py-8">
      <p class="text-xs uppercase tracking-[0.4em] text-slate-400">
        Control Center
      </p>
      <h2 class="text-2xl font-black text-primary-950 mt-2">Admin Suite</h2>
      <p class="text-xs text-slate-500 mt-2">{{ roleLabelText }} Workspace</p>
    </div>
    <div class="px-4 space-y-2">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200"
        :class="
          isActive(item.to)
            ? 'bg-primary-900 text-gold shadow-inner'
            : 'bg-white text-slate-600 hover:bg-slate-100'
        "
      >
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { normalizeRole, roleLabel } from "~/utils/roles";

const props = defineProps<{
  role?: string | null;
}>();

const route = useRoute();

const navItems = computed(() => {
  const role = normalizeRole(props.role);
  if (role === "OWNER") {
    return [
      { label: "Admin Home", to: "/admin" },
      { label: "People & Shifts", to: "/admin/people" },
      { label: "MIC Dashboard", to: "/admin/mic" },
      { label: "Operations Builder", to: "/admin/operations" },
      { label: "Owner", to: "/admin/owner" },
      { label: "Charities", to: "/admin/charities" },
    ];
  }
  if (role === "MIC") {
    return [
      { label: "MIC Dashboard", to: "/admin/mic" },
      { label: "Shift Records", to: "/admin/mic/shifts" },
      { label: "Operations Builder", to: "/admin/operations" },
    ];
  }
  if (role === "CHARITY") {
    return [{ label: "Charity Dashboard", to: "/admin/charities" }];
  }
  return [];
});

const roleLabelText = computed(() => roleLabel(props.role));

const isActive = (path: string) => route.path === path;
</script>
