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

export const useAutoRefresh = (intervalSeconds = 30) => {
  const { fetchBusiness, fetchPricing, fetchSchedule, fetchJackpot, fetchSpecials } = useBusiness();
  let intervalId: any = null;

  const refreshAll = () => {
    fetchBusiness();
    fetchPricing();
    fetchSchedule();
    fetchJackpot();
    fetchSpecials();
  };

  const startPolling = (immediate = true) => {
    if (intervalId) return;
    if (immediate) refreshAll();
    intervalId = setInterval(refreshAll, intervalSeconds * 1000);
  };

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return { startPolling, stopPolling, refreshAll };
};
