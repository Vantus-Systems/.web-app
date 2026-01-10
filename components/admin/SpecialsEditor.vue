<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Plus, Trash2, GripVertical } from "lucide-vue-next";
import { useCsrf } from "~/composables/useCsrf";
import { useToast } from "~/composables/useToast";

const emit = defineEmits(["saving"]);
const { getHeaders } = useCsrf();
const toast = useToast();

const loading = ref(true);
const items = ref<any[]>([]);

const loadSpecials = async () => {
  loading.value = true;
  try {
    const data = await $fetch("/api/specials");
    items.value = Array.isArray(data?.items) ? data.items : [];
  } catch (e) {
    console.error(e);
    toast.error("Failed to load specials");
  } finally {
    loading.value = false;
  }
};

const addItem = () => {
  items.value.push({
    id: crypto.randomUUID(),
    title: "",
    description: "",
    active: true,
  });
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const triggerSave = async () => {
  emit("saving", true);
  try {
    await $fetch("/api/admin/specials", {
      method: "POST",
      body: { items: items.value },
      headers: getHeaders(),
      credentials: "include",
    });
    toast.success("Specials published successfully.");
  } catch (e: any) {
    toast.error(e?.message || "Failed to save specials.");
  } finally {
    emit("saving", false);
  }
};

defineExpose({ triggerSave });

onMounted(() => {
  loadSpecials();
});
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-black text-slate-900">Daily Specials & Announcements</h2>
        <p class="text-sm text-slate-500">Manage content displayed on the public specials page.</p>
      </div>
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition-colors"
        @click="addItem"
      >
        <Plus class="w-4 h-4" />
        Add Special
      </button>
    </div>

    <div v-if="loading" class="py-12 flex justify-center">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-12 bg-surface rounded-xl border border-dashed border-divider">
      <p class="text-slate-500 font-medium">No specials configured.</p>
      <button class="mt-2 text-accent-primary text-sm font-bold hover:underline" @click="addItem">Create one now</button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(item, idx) in items"
        :key="item.id"
        class="bg-surface p-4 rounded-xl border border-divider shadow-sm flex gap-4 group"
      >
        <div class="pt-2 text-slate-400 cursor-move">
          <GripVertical class="w-5 h-5" />
        </div>
        <div class="flex-1 space-y-3">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
              <input v-model="item.title" type="text" class="w-full bg-base border-divider rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-accent-primary/50 outline-none" placeholder="e.g. Half Price Paper" />
            </div>
            <div class="w-32">
               <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
               <select v-model="item.active" class="w-full bg-base border-divider rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-accent-primary/50 outline-none">
                 <option :value="true">Active</option>
                 <option :value="false">Hidden</option>
               </select>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
            <textarea v-model="item.description" rows="2" class="w-full bg-base border-divider rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-accent-primary/50 outline-none" placeholder="Details about this special..."></textarea>
          </div>
        </div>
        <button class="text-red-400 hover:text-red-600 self-start p-2 opacity-0 group-hover:opacity-100 transition-opacity" @click="removeItem(idx)">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>