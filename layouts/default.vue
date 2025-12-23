<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar />
    <main class="flex-grow">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from '~/components/TheNavbar.vue';
import TheFooter from '~/components/TheFooter.vue';
</script>
