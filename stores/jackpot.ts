import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useJackpotStore = defineStore('jackpot', () => {
  const currentJackpot = ref(2500);

  // Simulate live jackpot updates
  if (import.meta.client) {
    setInterval(() => {
      currentJackpot.value += Math.floor(Math.random() * 5);
    }, 5000);
  }

  return {
    currentJackpot,
  };
});
