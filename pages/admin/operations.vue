<template>
  <AdminShell
    title="Operations Builder"
    subtitle="Operations Canvas"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="bg-white border border-slate-200 rounded-xl p-4">
      <OperationsBuilder />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import OperationsBuilder from "~/components/admin/OperationsBuilder.vue";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const session = ref<{ username: string; role: string } | null>(null);

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  router.push("/admin/login");
};

onMounted(loadSession);
</script>
