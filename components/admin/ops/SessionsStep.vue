<template>
  <div class="space-y-6 p-6">
    <div>
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold mb-2">
        Operating Sessions
      </p>
      <h3 class="text-xl font-black text-primary-900 mb-4">
        Define Your Daily Sessions (AM, PM, etc.)
      </h3>
    </div>

    <div class="space-y-4">
      <div
        v-for="session in sessions"
        :key="session"
        class="p-4 bg-slate-50 border border-slate-200 rounded-lg"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold text-slate-900">{{ session }}</span>
          <button
            type="button"
            @click="removeSession(session)"
            class="text-xs text-rose-700 font-bold"
          >
            Remove
          </button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <label class="block">
            <span class="text-xs font-bold text-slate-600 block mb-2">
              Start Time
            </span>
            <input
              :value="getSessionConfig(session)?.startTime || ''"
              type="time"
              @change="(e: Event) => updateSessionField(session, 'startTime', (e.target as HTMLInputElement).value)"
              class="w-full rounded-lg border-slate-200 bg-white text-sm"
            />
          </label>
          <label class="block">
            <span class="text-xs font-bold text-slate-600 block mb-2">
              End Time
            </span>
            <input
              :value="getSessionConfig(session)?.endTime || ''"
              type="time"
              @change="(e: Event) => updateSessionField(session, 'endTime', (e.target as HTMLInputElement).value)"
              class="w-full rounded-lg border-slate-200 bg-white text-sm"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        @click="addSession"
        class="w-full py-3 px-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-700 font-bold text-sm hover:bg-primary-50 transition-colors"
      >
        + Add Session
      </button>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-900">
        <strong>Sessions:</strong> Morning, Afternoon, Evening sessions that your operation
        runs. Each session has its own start and end times.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface SessionConfig {
  startTime: string;
  endTime: string;
}

const props = defineProps<{
  sessions: string[];
  sessionConfigs: Record<string, SessionConfig>;
}>();

const emit = defineEmits<{
  update: [payload: { sessions: string[]; sessionConfigs: Record<string, SessionConfig> }];
}>();

const sessions = ref<string[]>([...props.sessions]);
const sessionConfigs = ref<Record<string, SessionConfig>>({
  ...props.sessionConfigs,
});

const getSessionConfig = (session: string) => {
  return sessionConfigs.value[session];
};

const updateSessionField = (session: string, field: string, value: string) => {
  if (!sessionConfigs.value[session]) {
    sessionConfigs.value[session] = { startTime: "", endTime: "" };
  }
  (sessionConfigs.value[session] as any)[field] = value;
  emitUpdate();
};

const addSession = () => {
  const newSession = `Session ${sessions.value.length + 1}`;
  sessions.value.push(newSession);
  sessionConfigs.value[newSession] = { startTime: "09:00", endTime: "17:00" };
  emitUpdate();
};

const removeSession = (session: string) => {
  sessions.value = sessions.value.filter((s) => s !== session);
  delete sessionConfigs.value[session];
  emitUpdate();
};

const emitUpdate = () => {
  emit("update", {
    sessions: sessions.value,
    sessionConfigs: sessionConfigs.value,
  });
};

watch(() => props.sessions, (newVal) => {
  sessions.value = [...newVal];
}, { deep: true });
</script>
