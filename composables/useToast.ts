/**
 * Global toast notification composable
 */

import { ref } from "vue";

interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: "success" | "error" | "warning" | "info";
  duration: number;
  visible: boolean;
}

const toasts = ref<Toast[]>([]);

let idCounter = 0;

export const useToast = () => {
  const show = (
    message: string,
    options: {
      title?: string;
      variant?: "success" | "error" | "warning" | "info";
      duration?: number;
    } = {},
  ) => {
    const id = `toast-${++idCounter}`;
    const toast: Toast = {
      id,
      message,
      title: options.title,
      variant: options.variant || "info",
      duration: options.duration !== undefined ? options.duration : 5000,
      visible: true,
    };

    toasts.value.push(toast);

    // Auto-remove after duration (if duration > 0)
    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration + 300); // Add extra time for animation
    }

    return id;
  };

  const remove = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1 && toasts.value[index]) {
      toasts.value[index]!.visible = false;
      // Remove from array after animation
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
      }, 300);
    }
  };

  const success = (message: string, options: { title?: string; duration?: number } = {}) => {
    return show(message, { ...options, variant: "success" });
  };

  const error = (message: string, options: { title?: string; duration?: number } = {}) => {
    return show(message, { ...options, variant: "error" });
  };

  const warning = (message: string, options: { title?: string; duration?: number } = {}) => {
    return show(message, { ...options, variant: "warning" });
  };

  const info = (message: string, options: { title?: string; duration?: number } = {}) => {
    return show(message, { ...options, variant: "info" });
  };

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
  };
};
