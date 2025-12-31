import { ref, watch, onUnmounted, onMounted } from "vue";
import type { Ref } from "vue";

interface AutosaveOptions<T> {
  data: Ref<T>;
  key: string;
  interval?: number; // milliseconds
  saveToServer?: (data: T) => Promise<void>;
  onSave?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface AutosaveReturn {
  isDirty: Ref<boolean>;
  isSaving: Ref<boolean>;
  lastSavedAt: Ref<Date | null>;
  saveDraft: () => Promise<void>;
  discardDraft: () => void;
  hasDraft: () => boolean;
}

export function useAutosave<T>(options: AutosaveOptions<T>): AutosaveReturn {
  const {
    data,
    key,
    interval = 30000, // 30 seconds default
    saveToServer,
    onSave,
    onError,
  } = options;

  const isDirty = ref(false);
  const isSaving = ref(false);
  const lastSavedAt = ref<Date | null>(null);
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let initialData: T | null = null;

  const localStorageKey = `draft:${key}`;

  // Load draft from localStorage on mount
  onMounted(() => {
    try {
      const draft = localStorage.getItem(localStorageKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        // Store initial data for dirty checking
        initialData = JSON.parse(JSON.stringify(data.value));
        // Optionally restore draft (caller should handle this)
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load draft from localStorage:", error);
    }
  });

  // Watch for changes to mark as dirty
  watch(
    data,
    (newVal) => {
      if (initialData === null) {
        initialData = JSON.parse(JSON.stringify(newVal));
        return;
      }

      isDirty.value = JSON.stringify(newVal) !== JSON.stringify(initialData);

      // Reset autosave timer on change
      if (isDirty.value) {
        resetAutosaveTimer();
      }
    },
    { deep: true },
  );

  const saveDraft = async (): Promise<void> => {
    if (!isDirty.value || isSaving.value) return;

    isSaving.value = true;
    try {
      // Save to localStorage
      localStorage.setItem(localStorageKey, JSON.stringify(data.value));

      // Optionally save to server
      if (saveToServer) {
        await saveToServer(data.value);
      }

      lastSavedAt.value = new Date();
      isDirty.value = false;
      initialData = JSON.parse(JSON.stringify(data.value));

      if (onSave) {
        onSave(data.value);
      }
    } catch (error) {
      console.error("Autosave failed:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      isSaving.value = false;
    }
  };

  const discardDraft = (): void => {
    try {
      localStorage.removeItem(localStorageKey);
      isDirty.value = false;
      initialData = null;
    } catch (error) {
      console.error("Failed to discard draft:", error);
    }
  };

  const hasDraft = (): boolean => {
    try {
      return localStorage.getItem(localStorageKey) !== null;
    } catch {
      return false;
    }
  };

  const resetAutosaveTimer = () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
    autosaveTimer = setTimeout(() => {
      saveDraft();
    }, interval);
  };

  // Cleanup on unmount
  onUnmounted(() => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
  });

  return {
    isDirty,
    isSaving,
    lastSavedAt,
    saveDraft,
    discardDraft,
    hasDraft,
  };
}
