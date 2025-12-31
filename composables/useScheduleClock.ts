import { ref, computed, onMounted, onUnmounted } from "vue";
import { parseTime as parseTimeToMinutes } from "~/utils/time.utils";

export function useScheduleClock() {
  const timeZone = "America/Chicago";

  type ChicagoTime = {
    dateStr: string;
    minutes: number;
    dayOfWeek: string;
  };

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
  const chicagoTime = computed<ChicagoTime>(() => {
    if (mode.value === "custom" && customDate.value && customTime.value) {
      // Parse custom date/time with safe fallbacks
      const dateParts = customDate.value.split("-").map(Number);
      const y = dateParts[0] ?? new Date().getFullYear();
      const m = dateParts[1] ?? 1;
      const d = dateParts[2] ?? 1;

      const timeParts = customTime.value.split(":").map(Number);
      const hr = timeParts[0] ?? 0;
      const min = timeParts[1] ?? 0;

      return {
        dateStr: customDate.value, // YYYY-MM-DD
        minutes: hr * 60 + min,
        dayOfWeek: new Date(y, m - 1, d).toLocaleDateString("en-US", {
          weekday: "short",
        }),
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

    const y = getPart("year") ?? "1970";
    const m = getPart("month") ?? "01";
    const d = getPart("day") ?? "01";
    const h = Number(getPart("hour") ?? "0");
    const min = Number(getPart("minute") ?? "0");
    const weekday = getPart("weekday") ?? ""; // "Mon", "Tue", etc.

    return {
      dateStr: `${y}-${m}-${d}`,
      minutes: h * 60 + min,
      dayOfWeek: weekday,
    };
  });

  const normalizeRangeForNow = (
    start: number,
    end: number,
    nowMins: number,
  ) => {
    // If end <= start, interpret as a spans-midnight range.
    if (end <= start) {
      const endNorm = end + 24 * 60;
      const nowNorm = nowMins < start ? nowMins + 24 * 60 : nowMins;
      return { start, end: endNorm, now: nowNorm };
    }
    return { start, end, now: nowMins };
  };

  const getStatus = (block: any) => {
    // Check if block is available today
    const currentDay = chicagoTime.value.dayOfWeek; // "Mon", "Tue"...
    // block.availableDays might be ["Mon", "Tue"]
    if (!block.availableDays || !block.availableDays.includes(currentDay)) {
      return "inactive"; // Not today
    }

    const start = parseTimeToMinutes(block.startTime);
    const end = parseTimeToMinutes(block.endTime);
    const current = chicagoTime.value.minutes;

    const normalized = normalizeRangeForNow(start, end, current);

    if (normalized.now >= normalized.start && normalized.now < normalized.end)
      return "live";
    if (normalized.now < normalized.start) return "upcoming";
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
