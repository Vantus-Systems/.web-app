<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[70vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-palette-title"
        >
          <!-- Search Input -->
          <div class="border-b border-slate-200 p-4">
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Search pages, actions, and help..."
                class="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @keydown.down.prevent="selectNext"
                @keydown.up.prevent="selectPrevious"
                @keydown.enter.prevent="executeSelected"
                @keydown.esc="close"
              />
            </div>
          </div>

          <!-- Results -->
          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="filteredItems.length === 0" class="p-8 text-center">
              <p class="text-slate-500 text-sm">
                No results found for "{{ searchQuery }}"
              </p>
            </div>
            <div v-else class="space-y-1">
              <button
                v-for="(item, index) in filteredItems"
                :key="item.id"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                :class="
                  selectedIndex === index
                    ? 'bg-primary-50 text-primary-900'
                    : 'hover:bg-slate-50 text-slate-700'
                "
                @click="execute(item)"
                @mouseenter="selectedIndex = index"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5 flex-shrink-0"
                  :class="
                    selectedIndex === index ? 'text-primary-600' : 'text-slate-400'
                  "
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm">{{ item.label }}</div>
                  <div class="text-xs text-slate-500 truncate">
                    {{ item.description }}
                  </div>
                </div>
                <kbd
                  v-if="item.shortcut"
                  class="hidden sm:inline-block px-2 py-1 text-xs font-mono bg-slate-100 rounded border border-slate-300"
                >
                  {{ item.shortcut }}
                </kbd>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500"
          >
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-slate-100 rounded border">↑↓</kbd>
                Navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-slate-100 rounded border">↵</kbd>
                Select
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-slate-100 rounded border">Esc</kbd>
                Close
              </span>
            </div>
            <div>Press <kbd class="px-1.5 py-0.5 bg-slate-100 rounded border">⌘K</kbd> to open</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  action: () => void;
  shortcut?: string;
  keywords?: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
  }>(),
  {
    modelValue: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const router = useRouter();
const searchInput = ref<HTMLInputElement>();
const searchQuery = ref("");
const selectedIndex = ref(0);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Define available commands
const allItems = computed<CommandItem[]>(() => [
  {
    id: "admin-home",
    label: "Admin Home",
    description: "Go to admin dashboard",
    icon: "svg",
    action: () => router.push("/admin"),
    keywords: ["home", "dashboard"],
  },
  {
    id: "operations",
    label: "Operations Builder",
    description: "Configure schedules and pricing",
    icon: "svg",
    action: () => router.push("/admin/operations"),
    keywords: ["ops", "schedule", "pricing", "builder"],
  },
  {
    id: "mic",
    label: "MIC Dashboard",
    description: "View MIC metrics and shifts",
    icon: "svg",
    action: () => router.push("/admin/mic"),
    keywords: ["mic", "shifts", "records"],
  },
  {
    id: "people",
    label: "People & Shifts",
    description: "Manage users and permissions",
    icon: "svg",
    action: () => router.push("/admin/people"),
    keywords: ["users", "people", "permissions", "roles"],
  },
  {
    id: "owner",
    label: "Owner Dashboard",
    description: "View KPIs and approvals",
    icon: "svg",
    action: () => router.push("/admin/owner"),
    keywords: ["owner", "kpi", "finance", "approval"],
  },
  {
    id: "charities",
    label: "Charities",
    description: "Manage charity organizations",
    icon: "svg",
    action: () => router.push("/admin/charities"),
    keywords: ["charity", "charities", "organizations"],
  },
]);

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return allItems.value;
  }

  const query = searchQuery.value.toLowerCase();
  return allItems.value.filter((item) => {
    return (
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords?.some((k) => k.includes(query))
    );
  });
});

const close = () => {
  isOpen.value = false;
  searchQuery.value = "";
  selectedIndex.value = 0;
};

const selectNext = () => {
  selectedIndex.value = (selectedIndex.value + 1) % filteredItems.value.length;
};

const selectPrevious = () => {
  selectedIndex.value =
    selectedIndex.value === 0
      ? filteredItems.value.length - 1
      : selectedIndex.value - 1;
};

const execute = (item: CommandItem) => {
  item.action();
  close();
};

const executeSelected = () => {
  const selectedItem = filteredItems.value[selectedIndex.value];
  if (selectedItem) {
    execute(selectedItem);
  }
};

// Focus search input when opened
watch(isOpen, async (value) => {
  if (value) {
    await nextTick();
    searchInput.value?.focus();
  }
});

// Global keyboard shortcut (⌘K or Ctrl+K)
const handleGlobalKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleGlobalKeydown);
});
</script>
