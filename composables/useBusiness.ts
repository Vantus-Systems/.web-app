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

// Define explicit types for Pricing to help TypeScript
export interface PricingInfo {
    daytime?: {
        sessions?: any[];
        jackpots?: any[];
        paperOnlyGames?: {
            regular_bingo?: any[];
            specials?: any[];
        };
    };
    evening?: {
        startTime?: string;
        valueProposition?: string;
        scheduleNote?: string;
        machines?: any[];
        specialtyGames?: any[];
    };
    sunday?: {
        title?: string;
        note?: string;
        specials?: any[];
    };
}

export const useBusiness = () => {
  const business = useState<BusinessInfo>("business", () => ({}));
  const pricing = useState<PricingInfo>("pricing", () => ({}));
  const schedule = useState<any[]>("schedule", () => ([]));
  const jackpot = useState("jackpot", () => ({}));
  const specials = useState("specials", () => ({}));

  const fetchBusiness = async () => {
    const { data } = await useFetch<BusinessInfo>("/api/business");
    if (data.value) business.value = data.value;
  };

  const fetchPricing = async () => {
    const { data } = await useFetch<PricingInfo>("/api/pricing");
    if (data.value) pricing.value = data.value;
  };

  const fetchSchedule = async () => {
    const { data } = await useFetch<any[]>("/api/schedule");
    if (data.value) schedule.value = data.value;
  };

  const fetchJackpot = async () => {
    const { data } = await useFetch("/api/jackpot");
    if (data.value) jackpot.value = data.value;
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
