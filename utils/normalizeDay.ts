export function normalizeDay(input: Date | string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (input instanceof Date) {
    return days[input.getDay()];
  }

  if (typeof input === "string") {
    const lower = input.toLowerCase().trim();
    if (lower.startsWith("su")) return "Sun";
    if (lower.startsWith("mo")) return "Mon";
    if (lower.startsWith("tu")) return "Tue";
    if (lower.startsWith("we")) return "Wed";
    if (lower.startsWith("th")) return "Thu";
    if (lower.startsWith("fr")) return "Fri";
    if (lower.startsWith("sa")) return "Sat";
  }

  return days[new Date().getDay()];
}
