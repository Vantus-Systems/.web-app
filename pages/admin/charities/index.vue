<template>
  <AdminShell
    title="Charity Dashboard"
    subtitle="Partner View"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="bg-white border border-slate-200 rounded-xl p-8 text-center">
      <p class="text-xs uppercase tracking-[0.4em] text-slate-400 font-bold">
        Coming Soon
      </p>
      <h2 class="text-2xl font-black text-primary-900 mt-2">Charity Portal</h2>
      <p class="text-sm text-slate-500 mt-3">
        Placeholder for charity reporting and partnership tools.
      </p>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["CHARITY", "OWNER"],
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
