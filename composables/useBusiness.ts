import { useState, useFetch } from "#imports";

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  full?: string;
  mapLink?: string;
}

export interface BusinessContact {
  phone?: string;
  phonePlain?: string;
  email?: string;
}

export interface BusinessMeta {
  description?: string;
  themeColor?: string;
  url?: string;
}

export interface BusinessInfo {
  name?: string;
  address?: BusinessAddress;
  contact?: BusinessContact;
  hours?: string;
  social?: Record<string, string>;
  meta?: BusinessMeta;
}

export const useBusiness = () => {
  const business = useState<BusinessInfo>("business", () => ({}));
  const pricing = useState("pricing", () => ({}));
  const schedule = useState("schedule", () => ({}));
  const jackpot = useState("jackpot", () => ({}));
  const specials = useState("specials", () => ({}));

  const fetchBusiness = async () => {
    const { data } = await useFetch("/api/business");
    if (data.value) business.value = data.value;
  };

  const fetchPricing = async () => {
    const { data } = await useFetch("/api/pricing");
    if (data.value) pricing.value = data.value;
  };

  const fetchSchedule = async () => {
    const { data } = await useFetch("/api/schedule");
    if (data.value) schedule.value = data.value;
  };

  const fetchJackpot = async () => {
    const { data } = await useFetch("/api/jackpot");
    // Debug: log what the API returned so we can diagnose client-side updates
    try {
      // eslint-disable-next-line no-console
      console.log("[useBusiness] fetchJackpot ->", data.value);
    } catch (e) {}

    // If useFetch returns no `data.value` for some reason, try a low-level fetch to see what's coming back
    if (!data.value) {
      try {
        // eslint-disable-next-line no-console
        const manual = await (globalThis.$fetch ? globalThis.$fetch('/api/jackpot') : fetch('/api/jackpot').then(r => r.json()));
        // eslint-disable-next-line no-console
        console.log('[useBusiness] manual fallback ->', manual);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[useBusiness] manual fallback error ->', err);
      }
    }
    if (data.value) {
      // Normalize number/shape to a consistent object { value, lastUpdated }
      const payload = data.value;
      if (typeof payload === "number" || typeof payload === "string") {
        jackpot.value = { value: Number(payload) } as any;
      } else {
        jackpot.value = payload as any;
      }
    }
  };

  const fetchSpecials = async () => {
    const { data } = await useFetch("/api/specials");
    if (data.value) specials.value = data.value;
  };

  return {
    business,
    pricing,
    schedule,
    jackpot,
    specials,
    fetchBusiness,
    fetchPricing,
    fetchSchedule,
    fetchJackpot,
    fetchSpecials,
  };
};
