export type NormalizedRole = "OWNER" | "CHARITY" | "MIC";

export const normalizeRole = (role?: string | null): NormalizedRole | null => {
  if (!role) return null;
  const value = role.toUpperCase();
  if (value === "ADMIN") return "OWNER";
  if (value === "CALLER") return "MIC";
  if (value === "MIC") return "MIC";
  if (value === "OWNER") return "OWNER";
  if (value === "CHARITY" || value === "CHARITIES") return "CHARITY";
  return null;
};

export const hasRole = (role: string | null | undefined, allowed: NormalizedRole[]) => {
  const normalized = normalizeRole(role);
  return normalized !== null && allowed.includes(normalized);
};

export const roleLabel = (role?: string | null) => {
  const normalized = normalizeRole(role);
  if (normalized === "OWNER") return "Owner";
  if (normalized === "CHARITY") return "Charity";
  if (normalized === "MIC") return "MIC";
  return "Unknown";
};
