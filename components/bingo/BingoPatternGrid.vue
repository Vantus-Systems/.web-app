<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    name: string;
    definition: { frames: number[][]; interval?: number };
    fillColor?: string;
    size?: "xs" | "sm" | "md";
    animate?: boolean;
  }>(),
  {
    fillColor: "#eab308", // gold-500 equivalent default
    size: "md",
    animate: false,
  },
);

const currentFrameIndex = ref(0);
const intervalId = ref<any>(null);

const frames = computed<number[][]>(() => {
  if (!props.definition || !props.definition.frames) return [Array(25).fill(0) as number[]];
  return props.definition.frames as number[][];
});

const activeFrame = computed<number[]>(() => {
  const frame = frames.value[currentFrameIndex.value] || frames.value[0];
  return frame as number[];
});

// helper array for rendering 25 cells without an unused "cell" variable
const cells = computed(() => Array.from({ length: 25 }));

// avoid using the reserved/deprecated "name" identifier in templates
const displayName = computed(() => props.name);

const startAnimation = () => {
  stopAnimation();
  if (props.animate && frames.value.length > 1) {
    const interval = props.definition.interval || 1000;
    intervalId.value = setInterval(() => {
      currentFrameIndex.value =
        (currentFrameIndex.value + 1) % frames.value.length;
    }, interval);
  }
};

const stopAnimation = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
  currentFrameIndex.value = 0;
};

watch(
  () => props.animate,
  (val) => {
    if (val) startAnimation();
    else stopAnimation();
  },
);

onMounted(() => {
  if (props.animate) startAnimation();
});

onUnmounted(() => {
  stopAnimation();
});

// Size classes
const containerClass = computed(() => {
  switch (props.size) {
    case "xs":
      return "w-8 h-8 gap-px text-[0px]";
    case "sm":
      return "w-16 h-16 gap-0.5 text-[6px]";
    case "md":
      return "w-32 h-32 gap-1 text-[10px]";
    default:
      return "w-32 h-32 gap-1 text-[10px]";
  }
});

const cellClass = computed(() => {
  switch (props.size) {
    case "xs":
      return "rounded-[1px]";
    case "sm":
      return "rounded-sm";
    case "md":
      return "rounded";
    default:
      return "rounded";
  }
});
</script>

<template>
  <div
    class="grid grid-cols-5 bg-neutral-200 p-px border border-neutral-300 rounded overflow-hidden"
    :class="containerClass"
    :title="name"
    role="img"
    :aria-label="`Bingo pattern: ${name}`"
  >
    <div
      v-for="(cell, index) in 25"
      :key="index"
      class="flex items-center justify-center bg-white transition-colors duration-200"
      :class="cellClass"
      :style="
        activeFrame[index] === 1 || index === 12
          ? { backgroundColor: index === 12 ? undefined : fillColor }
          : {}
      "
    >
      <span v-if="index === 12" class="font-bold text-neutral-400 select-none"
        >FREE</span
      >
    </div>
  </div>
</template>
