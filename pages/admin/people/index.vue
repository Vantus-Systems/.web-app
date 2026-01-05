<template>
  <AdminShell
    title="People Directory"
    subtitle="Manage Users"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <PeopleDirectory />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AdminShell from "~/components/admin/AdminShell.vue";
import PeopleDirectory from "~/components/admin/users/PeopleDirectory.vue";
import { useCsrf } from "~/composables/useCsrf";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{
  id: string;
  username: string;
  role: string;
  is_active: boolean;
} | null>(null);

const logout = async () => {
  await refreshCsrfToken();
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

onMounted(async () => {
  try {
    const sessionData = await $fetch<{
      user: {
        id: string;
        username: string;
        role: string;
        is_active: boolean;
      };
    }>("/api/auth/user", {
      credentials: "include",
    });
    session.value = sessionData.user;
  } catch (e) {
    console.error("Failed to load session", e);
    router.push("/admin/login");
  }
});
</script>
