<template>
  <div
    class="min-h-screen bg-primary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-primary-900">
          Admin Portal
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm"
              placeholder="Username"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-900 bg-gold hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <span
                v-if="isLoading"
                class="animate-spin h-4 w-4 border-2 border-primary-900 border-t-transparent rounded-full"
              ></span>
            </span>
            Sign in
          </button>
        </div>
        <p v-if="error" class="text-red-500 text-center text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const username = ref("admin");
const password = ref("");
const error = ref("");
const isLoading = ref(false);
const router = useRouter();

// Simple auth check
const handleLogin = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const { error: apiError } = await useFetch("/api/auth/login", {
      method: "POST",
      body: { username: username.value, password: password.value },
    });

    if (apiError.value) {
      error.value = "Invalid username or password";
    } else {
      // Store a simple token/flag
      const authCookie = useCookie("admin_auth");
      authCookie.value = "true";
      router.push("/admin");
    }
  } catch {
    error.value = "An error occurred";
  } finally {
    isLoading.value = false;
  }
};
</script>
