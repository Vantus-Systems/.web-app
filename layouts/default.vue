<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar />
    <main id="main-content" tabindex="-1" class="flex-grow pt-20 outline-none">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from "~/components/TheNavbar.vue";
import TheFooter from "~/components/TheFooter.vue";
</script>
