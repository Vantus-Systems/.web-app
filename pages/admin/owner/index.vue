<template>
  <AdminShell
    title="Owner Dashboard"
    subtitle="Executive View"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="space-y-6">
      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-6">
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Total Users
          </p>
          <p class="text-4xl font-black text-primary-900 mt-2">
            {{ kpis.totalUsers }}
          </p>
          <p class="text-xs text-slate-500 mt-2">
            Active: {{ kpis.activeUsers }}
          </p>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-6">
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Pending Approvals
          </p>
          <p class="text-4xl font-black text-amber-600 mt-2">
            {{ kpis.pendingApprovals }}
          </p>
          <p class="text-xs text-slate-500 mt-2">Awaiting review</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-6">
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Live Schemas
          </p>
          <p class="text-4xl font-black text-emerald-600 mt-2">
            {{ kpis.liveSchemas }}
          </p>
          <p class="text-xs text-slate-500 mt-2">Active Operations</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-6">
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Drafts
          </p>
          <p class="text-4xl font-black text-slate-600 mt-2">
            {{ kpis.draftSchemas }}
          </p>
          <p class="text-xs text-slate-500 mt-2">In development</p>
        </div>
      </div>

      <!-- Approval Queue -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
            >
              Approvals
            </p>
            <h3 class="text-xl font-black text-primary-900">
              Pending Requests
            </h3>
          </div>
        </div>

        <div v-if="approvalQueue.length === 0" class="text-center py-8">
          <p class="text-sm text-slate-500">No pending approvals</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-xs">
            <thead class="text-slate-500 uppercase tracking-widest bg-slate-50">
              <tr>
                <th class="px-3 py-2 text-left">Type</th>
                <th class="px-3 py-2 text-left">Submitted By</th>
                <th class="px-3 py-2 text-left">Date</th>
                <th class="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="approval in approvalQueue"
                :key="approval.id"
                class="border-t border-slate-200"
              >
                <td class="px-3 py-2 font-semibold">{{ approval.type }}</td>
                <td class="px-3 py-2">{{ approval.userId }}</td>
                <td class="px-3 py-2">
                  {{ formatDate(approval.requestedAt) }}
                </td>
                <td class="px-3 py-2 flex gap-2">
                  <button
                    class="text-xs font-bold text-emerald-700 hover:text-emerald-900"
                    @click="approveRequest(approval.id)"
                  >
                    Approve
                  </button>
                  <button
                    class="text-xs font-bold text-rose-700 hover:text-rose-900"
                    @click="rejectRequest(approval.id)"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Changes Feed -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Activity
          </p>
          <h3 class="text-xl font-black text-primary-900">Recent Changes</h3>
        </div>

        <div v-if="recentChanges.length === 0" class="text-center py-8">
          <p class="text-sm text-slate-500">No recent activity</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="change in recentChanges"
            :key="change.id"
            class="p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <p class="text-xs font-bold text-slate-700">{{ change.title }}</p>
            <p class="text-xs text-slate-500 mt-1">
              {{ change.description }}
            </p>
            <p class="text-[10px] text-slate-400 mt-2">
              {{ formatDate(change.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import { useCsrf } from "~/composables/useCsrf";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["OWNER"],
});

const router = useRouter();
const { getHeaders } = useCsrf();
const session = ref<{ username?: string; role?: any } | null>(null);
const kpis = ref({
  totalUsers: 0,
  activeUsers: 0,
  pendingApprovals: 0,
  liveSchemas: 0,
  draftSchemas: 0,
});
const approvalQueue = ref<any[]>([]);
const recentChanges = ref<any[]>([]);

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const loadSession = async () => {
  session.value = (
    await $fetch("/api/auth/user", { credentials: "include" })
  ).user;
};

const loadKPIs = async () => {
  try {
    const users: any = await $fetch("/api/admin/users", {
      credentials: "include",
    });
    if (Array.isArray(users)) {
      kpis.value.totalUsers = users.length;
      kpis.value.activeUsers = users.filter((u: any) => u.is_active).length;
    } else {
      kpis.value.totalUsers = 0;
      kpis.value.activeUsers = 0;
    }
  } catch {
    // Error loading users
  }

  try {
    const approvalsRes: any = await $fetch("/api/admin/approval-requests", {
      credentials: "include",
    });
    const approvalsData = Array.isArray(approvalsRes?.data)
      ? approvalsRes.data
      : approvalsRes?.data
        ? [approvalsRes.data]
        : [];
    const pending = approvalsData.filter((a: any) => a.status === "pending");
    kpis.value.pendingApprovals = pending.length;
  } catch {
    // Error loading approvals
  }
};

const loadApprovalQueue = async () => {
  try {
    const response: any = await $fetch("/api/admin/approval-requests", {
      credentials: "include",
      query: { status: "pending" },
    });
    approvalQueue.value = Array.isArray(response?.data)
      ? response.data
      : response?.data
        ? [response.data]
        : [];
  } catch {
    // Error loading approval queue
  }
};

const loadRecentChanges = () => {
  // Populate with sample data
  recentChanges.value = [
    {
      id: "1",
      title: "Operations Schema Published",
      description: "Standard Operations schema was published to production",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      title: "User Role Changed",
      description: "john.doe changed from MIC to OWNER",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      title: "Bingo Pattern Created",
      description: "New pattern 'Lucky 7' was added to the system",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
};

const approveRequest = async (id: string) => {
  try {
    await $fetch(`/api/admin/approval-requests/${id}`, {
      method: "PUT",
      body: {
        status: "approved",
        respondedBy: session.value?.username,
      },
      headers: getHeaders(),
      credentials: "include",
    });
    await loadApprovalQueue();
    await loadKPIs();
  } catch {
    alert("Error approving request");
  }
};

const rejectRequest = async (id: string) => {
  const reason = prompt("Enter rejection reason:");
  if (!reason) return;

  try {
    await $fetch(`/api/admin/approval-requests/${id}`, {
      method: "PUT",
      body: {
        status: "rejected",
        respondedBy: session.value?.username,
        rejectionReason: reason,
      },
      headers: getHeaders(),
      credentials: "include",
    });
    await loadApprovalQueue();
    await loadKPIs();
  } catch {
    alert("Error rejecting request");
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

onMounted(async () => {
  await loadSession();
  await loadKPIs();
  await loadApprovalQueue();
  await loadRecentChanges();
});
</script>
