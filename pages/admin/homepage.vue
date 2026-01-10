<template>
  <AdminShell
    :user-role="sessionUser?.role"
    :user-name="sessionUser?.username"
    :breadcrumbs="[
      { label: 'Admin', path: '/admin' },
      { label: 'Homepage', path: '/admin/homepage' },
    ]"
  >
    <AdminPageHeader
      title="Homepage Editor"
      subtitle="Public Site Configuration"
      description="Manage content for the public homepage. Updates appear immediately."
    >
      <template #actions>
        <button
          class="px-5 py-2 bg-primary-600 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg disabled:opacity-50 hover:bg-primary-700 transition-colors"
          :disabled="isSaving || isLoading"
          @click="saveSettings"
        >
          {{ isSaving ? "Saving..." : "Save Changes" }}
        </button>
      </template>
    </AdminPageHeader>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div
        class="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"
      ></div>
    </div>

    <div v-else-if="settings" class="space-y-8 max-w-4xl mx-auto pb-24">
      <!-- HERO SECTION -->
      <section
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <h3 class="text-lg font-bold text-primary-900 mb-4 border-b pb-2">
          Hero Section
        </h3>
        <div class="grid gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Headline</label
            >
            <input
              v-model="settings.hero.headline"
              type="text"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Subheadline</label
            >
            <textarea
              v-model="settings.hero.subheadline"
              rows="2"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Primary CTA Label</label
              >
              <input
                v-model="settings.hero.primaryCta.label"
                type="text"
                class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Primary CTA Link</label
              >
              <input
                v-model="settings.hero.primaryCta.href"
                type="text"
                class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div class="border-t pt-4">
            <label class="flex items-center space-x-2 mb-4">
              <input
                v-model="settings.hero.showVideo"
                type="checkbox"
                class="rounded text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm font-medium text-slate-700"
                >Enable Background Video</span
              >
            </label>
            <div
              v-if="settings.hero.showVideo"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Video URL (mp4)</label
                >
                <input
                  v-model="settings.hero.videoUrl"
                  type="text"
                  placeholder="/video/hero.mp4"
                  class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Poster Image URL</label
                >
                <input
                  v-model="settings.hero.posterUrl"
                  type="text"
                  class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TICKER SECTION -->
      <section
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <div class="flex items-center justify-between mb-4 border-b pb-2">
          <h3 class="text-lg font-bold text-primary-900">Ticker (Marquee)</h3>
          <label class="flex items-center space-x-2">
            <input
              v-model="settings.ticker.enabled"
              type="checkbox"
              class="rounded text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>
        <div v-if="settings.ticker.enabled" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >As Of Date (Optional)</label
            >
            <input
              v-model="settings.ticker.asOfDate"
              type="text"
              placeholder="e.g. Oct 2023"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700"
              >Ticker Items</label
            >
            <div
              v-for="(item, idx) in settings.ticker.items"
              :key="idx"
              class="flex gap-2 items-center"
            >
              <input
                v-model="item.label"
                placeholder="Label"
                class="flex-1 rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
              <input
                v-model="item.value"
                placeholder="Value"
                class="flex-1 rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
              <button
                class="text-red-500 hover:text-red-700 px-2"
                @click="removeTickerItem(idx)"
              >
                ×
              </button>
            </div>
            <button
              class="text-sm text-primary-600 font-bold hover:text-primary-700"
              @click="addTickerItem"
            >
              + Add Item
            </button>
          </div>
        </div>
      </section>

      <!-- STATS BAR -->
      <section
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <div class="flex items-center justify-between mb-4 border-b pb-2">
          <h3 class="text-lg font-bold text-primary-900">Stats Bar</h3>
          <label class="flex items-center space-x-2">
            <input
              v-model="settings.statsBar.enabled"
              type="checkbox"
              class="rounded text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>
        <div v-if="settings.statsBar.enabled" class="space-y-4">
          <div class="space-y-4">
            <div
              v-for="(item, idx) in settings.statsBar.items"
              :key="idx"
              class="p-4 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div class="flex justify-between mb-2">
                <span class="text-xs font-bold text-slate-500"
                  >Stat #{{ idx + 1 }}</span
                >
                <button
                  class="text-red-500 text-xs hover:text-red-700"
                  @click="removeStatsItem(idx)"
                >
                  Remove
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-slate-500 mb-1"
                    >Big Text</label
                  >
                  <input
                    v-model="item.big"
                    class="w-full rounded border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1"
                    >Small Text</label
                  >
                  <input
                    v-model="item.small"
                    class="w-full rounded border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              class="text-sm text-primary-600 font-bold hover:text-primary-700"
              @click="addStatsItem"
            >
              + Add Stat
            </button>
          </div>
        </div>
      </section>

      <!-- PRIZE POOL -->
      <section
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <div class="flex items-center justify-between mb-4 border-b pb-2">
          <h3 class="text-lg font-bold text-primary-900">
            Prize Pool Highlight
          </h3>
          <label class="flex items-center space-x-2">
            <input
              v-model="settings.prizePool.enabled"
              type="checkbox"
              class="rounded text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>
        <div
          v-if="settings.prizePool.enabled"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Label</label
            >
            <input
              v-model="settings.prizePool.tonightTotalLabel"
              type="text"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Value</label
            >
            <input
              v-model="settings.prizePool.tonightTotalValue"
              type="text"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Note / Disclaimer</label
            >
            <input
              v-model="settings.prizePool.note"
              type="text"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </section>

      <!-- WINNERS CAROUSEL -->
      <section
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <div class="flex items-center justify-between mb-4 border-b pb-2">
          <h3 class="text-lg font-bold text-primary-900">Winners Carousel</h3>
          <label class="flex items-center space-x-2">
            <input
              v-model="settings.winners.enabled"
              type="checkbox"
              class="rounded text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>
        <div v-if="settings.winners.enabled" class="space-y-4">
          <div
            v-for="(winner, idx) in settings.winners.items"
            :key="idx"
            class="p-4 bg-slate-50 rounded-lg border border-slate-100"
          >
            <div class="flex justify-between mb-2">
              <span class="text-xs font-bold text-slate-500"
                >Winner #{{ idx + 1 }}</span
              >
              <button
                class="text-red-500 text-xs hover:text-red-700"
                @click="removeWinner(idx)"
              >
                Remove
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-500 mb-1">Name</label>
                <input
                  v-model="winner.name"
                  class="w-full rounded border-slate-300 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">Amount</label>
                <input
                  v-model="winner.amount"
                  class="w-full rounded border-slate-300 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">Date</label>
                <input
                  v-model="winner.date"
                  class="w-full rounded border-slate-300 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1"
                  >Photo URL</label
                >
                <input
                  v-model="winner.photoUrl"
                  class="w-full rounded border-slate-300 text-sm"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs text-slate-500 mb-1">Quote</label>
                <input
                  v-model="winner.quote"
                  class="w-full rounded border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>
          <button
            class="text-sm text-primary-600 font-bold hover:text-primary-700"
            @click="addWinner"
          >
            + Add Winner
          </button>
        </div>
      </section>

      <!-- MISSION -->
      <section
        class="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <h3 class="text-lg font-bold text-primary-900 mb-4 border-b pb-2">
          Mission Section
        </h3>
        <div class="grid gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Headline</label
            >
            <input
              v-model="settings.mission.headline"
              type="text"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Tagline</label
            >
            <input
              v-model="settings.mission.tagline"
              type="text"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Body Text</label
            >
            <textarea
              v-model="settings.mission.body"
              rows="3"
              class="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
        </div>
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import AdminPageHeader from "~/components/admin/ui/AdminPageHeader.vue";
import type { HomepageSettings } from "~/server/schemas/homepage";
import { useCsrf } from "~/composables/useCsrf";
import { useToast } from "~/composables/useToast";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const { data: sessionUser } = useAuth();
const csrf = useCsrf();
const toast = useToast();

const settings = ref<HomepageSettings | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);

const fetchSettings = async () => {
  try {
    isLoading.value = true;
    const data = await $fetch<HomepageSettings>("/api/homepage");
    settings.value = data;
  } catch {
    toast.error("Failed to load homepage settings");
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = async () => {
  if (!settings.value) return;
  try {
    isSaving.value = true;
    await $fetch("/api/admin/homepage", {
      method: "POST",
      body: settings.value,
      headers: csrf.getHeaders(),
    });
    toast.success("Homepage updated successfully");
  } catch {
    toast.error("Failed to save homepage settings");
  } finally {
    isSaving.value = false;
  }
};

const addTickerItem = () => {
  settings.value?.ticker.items.push({ label: "", value: "" });
};
const removeTickerItem = (idx: number) => {
  settings.value?.ticker.items.splice(idx, 1);
};

const addStatsItem = () => {
  settings.value?.statsBar.items.push({ big: "", small: "" });
};
const removeStatsItem = (idx: number) => {
  settings.value?.statsBar.items.splice(idx, 1);
};

const addWinner = () => {
  settings.value?.winners.items.push({ name: "", amount: "" });
};
const removeWinner = (idx: number) => {
  settings.value?.winners.items.splice(idx, 1);
};

onMounted(() => {
  fetchSettings();
});
</script>
