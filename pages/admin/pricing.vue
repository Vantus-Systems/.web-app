<template>
  <AdminShell
    title="Pricing Manager"
    subtitle="Manage rate cards, bundles, and session pricing"
    :user-role="session?.role"
    :user-name="session?.username"
    :breadcrumbs="[{ label: 'Admin', path: '/admin' }, { label: 'Pricing', path: '/admin/pricing' }]"
    @logout="logout"
  >
    <div class="min-h-screen bg-base p-6">
    <div class="max-w-[1600px] mx-auto space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-black text-primary-900">Pricing Manager</h1>
          <p class="text-sm text-slate-500">
            Manage rate cards, bundles, and session pricing.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div
            v-if="store.saving"
            class="text-xs font-bold text-slate-400 uppercase tracking-wider animate-pulse"
          >
            Saving Draft...
          </div>
          <div
            v-else-if="store.dirty"
            class="text-xs font-bold text-amber-600 uppercase tracking-wider"
          >
            Unsaved Changes
          </div>
          <div
            v-else
            class="text-xs font-bold text-emerald-600 uppercase tracking-wider"
          >
            Draft Saved
          </div>

          <div class="h-6 w-px bg-slate-200 mx-2"></div>

          <BaseButton
            variant="outline"
            class-name="px-4 py-2 text-xs uppercase tracking-[0.1em]"
            @click="showHistory = true"
          >
            History
          </BaseButton>
        </div>
      </div>

      <!-- Main Editor -->
      <div v-if="store.loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"
        ></div>
      </div>

      <PricingEditor
        v-else
        :model-value="store.draftContent"
        :is-saving="store.publishing"
        @update:model-value="handleUpdate"
        @save="handlePublish"
      />
    </div>

    <!-- History Slide-over -->
    <div
      v-if="showHistory"
      class="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute inset-0 bg-slate-900/50 transition-opacity"
          @click="showHistory = false"
        ></div>
        <div
          class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
        >
          <div class="pointer-events-auto w-screen max-w-md">
            <div
              class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl"
            >
              <div class="bg-primary-900 px-4 py-6 sm:px-6">
                <div class="flex items-center justify-between">
                  <h2
                    id="slide-over-title"
                    class="text-base font-semibold leading-6 text-white"
                  >
                    Version History
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      class="relative rounded-md bg-primary-900 text-primary-200 hover:text-white focus:outline-none"
                      @click="showHistory = false"
                    >
                      <span class="absolute -inset-2.5"></span>
                      <span class="sr-only">Close panel</span>
                      <svg
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-1">
                  <p class="text-sm text-primary-200">
                    View and restore previous pricing versions.
                  </p>
                </div>
              </div>
              <div class="relative flex-1 px-4 py-6 sm:px-6">
                <div v-if="loadingHistory" class="text-center py-8">
                  <div
                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"
                  ></div>
                </div>
                <ul v-else role="list" class="space-y-4">
                  <li
                    v-for="version in store.versions"
                    :key="version.id"
                    class="relative flex items-center space-x-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition"
                  >
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span
                          v-if="version.status === 'ACTIVE'"
                          class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                          >Active</span
                        >
                        <span
                          v-else
                          class="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
                          >Archived</span
                        >
                        <span class="text-xs text-slate-400">
                          {{
                            new Date(version.created_at).toLocaleDateString()
                          }}
                        </span>
                      </div>
                      <p class="truncate text-sm font-medium text-slate-900">
                        Version {{ version.id.slice(-6) }}
                      </p>
                      <p class="text-xs text-slate-500">
                        Published by {{ version.published_by || "Unknown" }}
                      </p>
                    </div>
                    <div>
                      <button
                        v-if="version.status !== 'ACTIVE'"
                        type="button"
                        class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        :disabled="store.rollingBack"
                        @click="handleRollback(version.id)"
                      >
                        {{ store.rollingBack ? "..." : "Rollback" }}
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { usePricingStore } from "~/stores/pricing";
import PricingEditor from "~/components/admin/PricingEditor.vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import { useCsrf } from "~/composables/useCsrf";
import { normalizeRole } from "~/utils/roles";

const store = usePricingStore();
const showHistory = ref(false);
const loadingHistory = ref(false);

const session = ref<{ username?: string; role?: string } | null>(null);
const { getHeaders, refreshCsrfToken } = useCsrf();
const router = useRouter();

const verifyAdminSession = async () => {
  try {
    const response = await $fetch<{ user: { role?: string; username?: string } }>(
      "/api/auth/user",
      { credentials: "include" }
    );
    const role = normalizeRole(response?.user?.role ?? null);
    if (!role) {
      throw new Error("Unauthorized");
    }
    if (role === "MIC") {
      await router.push("/admin/mic");
      return null;
    }
    if (role === "CHARITY") {
      await router.push("/admin/charities");
      return null;
    }
    if (role !== "OWNER") {
      throw new Error("Unauthorized");
    }
    return response.user;
  } catch {
    try {
      await refreshCsrfToken();
      await $fetch("/api/auth/logout", {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
    } catch {
      // ignore cleanup errors
    }
    await router.push("/admin/login");
    return null;
  }
};

onMounted(async () => {
  const user = await verifyAdminSession();
  if (!user) return;
  session.value = user;
  await store.fetchDraft();
});

watch(showHistory, async (val) => {
  if (val) {
    loadingHistory.value = true;
    await store.fetchVersions();
    loadingHistory.value = false;
  }
});

const handleUpdate = (content: any) => {
  store.updateDraftContent(content);
  debouncedSave();
};

const debouncedSave = useDebounceFn(async () => {
  await store.saveDraft();
}, 2000);

const handlePublish = async () => {
  if (
    confirm(
      "Are you sure you want to publish this pricing configuration? This will go live immediately.",
    )
  ) {
    await store.publish();
    // Refresh history if open
    if (showHistory.value) {
      await store.fetchVersions();
    }
  }
};

const handleRollback = async (versionId: string) => {
  if (
    confirm(
      "Are you sure you want to rollback to this version? This will overwrite the current active version.",
    )
  ) {
    await store.rollback(versionId);
    await store.fetchVersions();
    await store.fetchDraft(); // Reload draft to match new active
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

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});
</script>
