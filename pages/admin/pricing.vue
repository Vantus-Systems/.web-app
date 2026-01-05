<template>
  <AdminShell
    title="Pricing Manager"
    subtitle="Manage rate cards, bundles, and session pricing"
    :user-role="session?.role"
    :user-name="session?.username"
    :breadcrumbs="[
      { label: 'Admin', path: '/admin' },
      { label: 'Pricing', path: '/admin/pricing' },
    ]"
    @logout="logout"
  >
    <div class="h-[calc(100vh-64px)]">
      <PricingManagerPanel />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import PricingManagerPanel from "~/components/admin/pricing/PricingManagerPanel.vue";
import { useCsrf } from "~/composables/useCsrf";
import { normalizeRole } from "~/utils/roles";

const session = ref<{ username?: string; role?: string } | null>(null);
const { getHeaders, refreshCsrfToken } = useCsrf();
const router = useRouter();

const verifyAdminSession = async () => {
  try {
    const response = await $fetch<{
      user: { role?: string; username?: string };
    }>("/api/auth/user", { credentials: "include" });
    const role = normalizeRole(response?.user?.role ?? null);
    if (!role) {
      throw new Error("Unauthorized");
    }
    if (role === "MIC") {
      await router.push("/admin/mic");
      return null;
    }
    if (role === "CHARITY") {
      await router.push("/admin/charities");
      return null;
    }
    if (role !== "OWNER") {
      throw new Error("Unauthorized");
    }
    return response.user;
  } catch {
    try {
      await refreshCsrfToken();
      await $fetch("/api/auth/logout", {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
    } catch {
      // ignore cleanup errors
    }
    await router.push("/admin/login");
    return null;
  }
};

onMounted(async () => {
  const user = await verifyAdminSession();
  if (!user) return;
  session.value = user;
});

const logout = async () => {
  await refreshCsrfToken();
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});
</script>
