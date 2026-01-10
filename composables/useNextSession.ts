import { computed, useFetch } from "#imports";

export const useNextSession = () => {
  const { data: nextSession, pending, refresh } = useFetch("/api/next-session");

  const ctaLink = computed(() => {
    if (!nextSession.value?.programSlug) return "/schedule";
    return `/programs/${nextSession.value.programSlug}`;
  });

  const ctaText = computed(() => {
    if (!nextSession.value?.programName) return "View Schedule";
    return `Next: ${nextSession.value.programName}`;
  });

  return {
    nextSession,
    ctaLink,
    ctaText,
    pending,
    refresh,
  };
};