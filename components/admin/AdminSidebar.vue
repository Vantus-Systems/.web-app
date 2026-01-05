<template>
  <!-- Mobile Overlay -->
  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="$emit('close')"
  ></div>

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-divider transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full flex flex-col"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="px-6 py-8 flex-shrink-0">
      <div class="flex items-center justify-between lg:block">
        <div>
          <p
            class="text-[10px] uppercase tracking-widest text-secondary font-bold"
          >
            Control Center
          </p>
          <h2 class="text-2xl font-bold text-primary mt-2">Admin Suite</h2>
          <p class="text-xs text-secondary mt-2">
            {{ roleLabelText }} Workspace
          </p>
        </div>
        <button
          class="lg:hidden p-2 text-secondary hover:text-primary"
          @click="$emit('close')"
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
    </div>
    <div class="px-4 space-y-1 overflow-y-auto flex-1">
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
        @click="$emit('close')"
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
  mobileOpen?: boolean;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const route = useRoute();

const navItems = computed(() => {
  const role = normalizeRole(props.role);
  if (role === "OWNER") {
    return [
      { label: "Admin Home", to: "/admin" },
      { label: "Progressives", to: "/admin/progressives" },
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
