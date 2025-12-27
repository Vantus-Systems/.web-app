import { ref, computed, onMounted, onUnmounted } from "vue";

export function useScheduleClock() {
  const timeZone = "America/Chicago";

  // State
  const mode = ref<"now" | "custom">("now");
  const customDate = ref<string>(""); // YYYY-MM-DD
  const customTime = ref<string>(""); // HH:mm
  const now = ref(new Date());

  // Timer
  let timer: any = null;

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date();
    }, 1000 * 60); // update every minute
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  // Computed Current Time in Chicago
  const chicagoTime = computed(() => {
    if (mode.value === "custom" && customDate.value && customTime.value) {
      // Create date from custom input
      // Input is usually local time context or specifically intended as Chicago time
      // Let's assume the user inputs "Chicago Time"
      const [y, m, d] = customDate.value.split("-").map(Number);
      const [hr, min] = customTime.value.split(":").map(Number);

      // We construct a date that represents that time in Chicago
      // It's a bit tricky without a library, but let's try to interpret it as local for display purposes logic
      // Actually, simplest is to treat the comparison logic based on HH:mm string matching or minutes from midnight

      return {
        dateStr: customDate.value, // YYYY-MM-DD
        minutes: hr * 60 + min,
        dayOfWeek: new Date(y, m - 1, d).toLocaleDateString("en-US", {
          weekday: "short",
        }) as any, // "Mon"
      };
    }

    // "now" mode
    const date = now.value;
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

    const y = getPart("year");
    const m = getPart("month");
    const d = getPart("day");
    const h = Number(getPart("hour"));
    const min = Number(getPart("minute"));
    const weekday = getPart("weekday"); // "Mon", "Tue", etc.

    return {
      dateStr: `${y}-${m}-${d}`,
      minutes: h * 60 + min,
      dayOfWeek: weekday,
    };
  });

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const getStatus = (block: any) => {
    // Check if block is available today
    const currentDay = chicagoTime.value.dayOfWeek; // "Mon", "Tue"...
    // block.availableDays might be ["Mon", "Tue"]
    if (!block.availableDays || !block.availableDays.includes(currentDay)) {
      return "inactive"; // Not today
    }

    const start = parseTime(block.startTime);
    const end = parseTime(block.endTime);
    const current = chicagoTime.value.minutes;

    if (current >= start && current < end) return "live";
    if (current < start) return "upcoming";
    return "past";
  };

  // Helper to initialize custom time inputs
  const initCustom = () => {
    const ct = chicagoTime.value;
    customDate.value = ct.dateStr;
    const h = Math.floor(ct.minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (ct.minutes % 60).toString().padStart(2, "0");
    customTime.value = `${h}:${m}`;
  };

  return {
    mode,
    customDate,
    customTime,
    chicagoTime,
    getStatus,
    initCustom,
  };
}
