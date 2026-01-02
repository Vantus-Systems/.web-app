<template>
  <AdminShell
    :user-role="sessionUser?.role"
    :user-name="sessionUser?.username"
    :breadcrumbs="[
      { label: 'Admin', path: '/admin' },
      { label: 'Progressives', path: '/admin/progressives' },
    ]"
    @logout="logout"
  >
    <AdminPageHeader
      title="Progressive Jackpots"
      subtitle="Jackpot Management & W-2G"
      description="Manage daily progressive jackpots and process winner payouts."
      :instructions="`
        <ul>
          <li><strong>Daily Updates</strong> - Update current jackpot amounts</li>
          <li><strong>No Winner</strong> - Use 'Session Played - No Winner' to auto-increment ($100)</li>
          <li><strong>W-2G Forms</strong> - Process payouts and generate tax forms for winners</li>
        </ul>
      `"
    >
      <template #actions>
        <div class="flex items-center space-x-4">
          <ClientOnly>
            <div
              class="text-xs text-slate-500 font-bold uppercase tracking-wider"
            >
              Last Synced: {{ lastSystemSync }}
            </div>
          </ClientOnly>
          <button
            class="px-5 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg disabled:opacity-50 hover:bg-primary-800 transition-colors"
            :disabled="isSavingJackpot"
            @click="saveJackpot"
          >
            {{ isSavingJackpot ? "Saving..." : "Save Progressives" }}
          </button>
        </div>
      </template>
    </AdminPageHeader>

    <div v-if="pending" class="flex flex-col items-center justify-center py-24">
      <div class="relative">
        <div class="h-16 w-16 border-4 border-primary-100 rounded-full"></div>
        <div
          class="absolute top-0 left-0 h-16 w-16 border-4 border-gold border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <p class="mt-6 text-primary-900 font-bold animate-pulse">
        Loading Progressives...
      </p>
    </div>

    <div v-else class="space-y-8">
      <!-- Progressive Editor Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2
            class="text-xl font-black text-primary-900 uppercase tracking-tight"
          >
            Jackpot Configuration
          </h2>
        </div>
        <ProgressiveEditor
          v-model="jackpotData"
          :is-saving="isSavingJackpot"
          @save="saveJackpot"
        />
      </section>

      <!-- W-2G Generator Section -->
      <section class="border-t border-slate-200 pt-8">
        <div class="flex items-center justify-between mb-4">
          <h2
            class="text-xl font-black text-primary-900 uppercase tracking-tight"
          >
            Winner Processing & W-2G
          </h2>
          <span class="text-sm text-slate-500 font-medium">
            Auto-fill enabled for scanned IDs
          </span>
        </div>
        <W2GGenerator
          :progressive-amounts="{
            babes: jackpotData?.babes?.current,
            hornet: jackpotData?.hornet?.current,
          }"
        />
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import AdminPageHeader from "~/components/admin/ui/AdminPageHeader.vue";
import ProgressiveEditor from "~/components/admin/ProgressiveEditor.vue";
import W2GGenerator from "~/components/admin/W2GGenerator.vue";
import { normalizeRole } from "~/utils/roles";
import { useCsrf } from "~/composables/useCsrf";
import { useToast } from "~/composables/useToast";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const toast = useToast();

const sessionUser = ref<{ username: string; role: string } | null>(null);
const jackpotData = ref<any>({});
const pending = ref(true);
const isSavingJackpot = ref(false);
const lastSystemSync = ref("");
let lastSyncInterval: ReturnType<typeof setInterval> | null = null;

const verifyAdminSession = async () => {
  try {
    const response = await $fetch<{
      user: { role?: string; username?: string };
    }>("/api/auth/user", { credentials: "include" });
    const role = normalizeRole(response?.user?.role ?? null);
    if (!role || role !== "OWNER") {
      throw new Error("Unauthorized");
    }
    return response.user;
  } catch {
    router.push("/admin/login");
    return null;
  }
};

const loadData = async () => {
  pending.value = true;
  try {
    const user = await verifyAdminSession();
    if (!user) return;
    sessionUser.value = user as { username: string; role: string };

    const jack = await $fetch("/api/jackpot", { credentials: "include" });
    jackpotData.value = jack;
  } catch (e: any) {
    console.error("Failed to load data", e);
    toast.error("Failed to load progressive data");
  } finally {
    pending.value = false;
  }
};

const saveJackpot = async () => {
  isSavingJackpot.value = true;
  try {
    jackpotData.value.lastUpdated = new Date().toLocaleString();
    await $fetch("/api/admin/jackpot", {
      method: "POST",
      body: jackpotData.value,
      headers: getHeaders(),
      credentials: "include",
    });
    toast.success("Progressives updated successfully.", { title: "Saved" });
  } catch (e: any) {
    toast.error(e?.message || "Failed to update progressives.", {
      title: "Error",
    });
  } finally {
    isSavingJackpot.value = false;
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

onMounted(() => {
  lastSystemSync.value = new Date().toLocaleTimeString();
  lastSyncInterval = setInterval(() => {
    lastSystemSync.value = new Date().toLocaleTimeString();
  }, 1000 * 60);
  loadData();
});

onBeforeUnmount(() => {
  if (lastSyncInterval) {
    clearInterval(lastSyncInterval);
    lastSyncInterval = null;
  }
});
</script>
