import { computed } from "vue";

export const useBingoData = () => {
  const { data: pricing, refresh: refreshPricing, pending: pricingLoading } = useFetch("/api/pricing", {
    default: () => ({})
  });

  const pricingGroups = computed(() => {
    if (!pricing.value) return [];

    return Object.entries(pricing.value)
      .filter(([, items]) => Array.isArray(items))
      .map(([category, items]) => ({
        category,
        items: (items as any[]).map((item) => ({ ...item, category }))
      }));
  });

  const allPricing = computed(() => pricingGroups.value.flatMap((group) => group.items));

  const currentPricing = computed(() => {
    if (!allPricing.value.length) return null;
    return allPricing.value.find((item) => item.featured) || allPricing.value[0] || null;
  });

  const loading = computed(() => pricingLoading.value);

  return {
    pricing,
    currentPricing,
    allPricing,
    pricingGroups,
    loading,
    refresh: refreshPricing
  };
};