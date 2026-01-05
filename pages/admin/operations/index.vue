<template>
  <AdminShell
    title="Operations Builder"
    subtitle="Operations Canvas"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div
      class="bg-white border border-slate-200 rounded-xl overflow-hidden h-[calc(100vh-8rem)]"
    >
      <OperationsBuilder :user-role="session?.role" />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import OperationsBuilder from "~/components/admin/OperationsBuilder.vue";
import { useCsrf } from "~/composables/useCsrf";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{ username?: string | null; role?: string | null } | null>(
  null,
);

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const logout = async () => {
  await refreshCsrfToken();
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

onMounted(loadSession);
</script>
