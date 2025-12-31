<template>
  <aside
    class="hidden lg:flex lg:flex-col lg:w-72 bg-surface border-r border-divider h-full"
  >
    <div class="px-6 py-8">
      <p class="text-[10px] uppercase tracking-widest text-secondary font-bold">
        Control Center
      </p>
      <h2 class="text-2xl font-bold text-primary mt-2">Admin Suite</h2>
      <p class="text-xs text-secondary mt-2">{{ roleLabelText }} Workspace</p>
    </div>
    <div class="px-4 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
        :class="
          isActive(item.to)
            ? 'bg-accent-primary/10 text-accent-primary'
            : 'text-secondary hover:bg-base hover:text-primary'
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
      { label: "Restricted Players", to: "/admin/mic/restricted-players" },
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
