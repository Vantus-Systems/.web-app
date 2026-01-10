<script setup lang="ts">
import { computed } from "vue";
import ProgramGamesTable from "./ProgramGamesTable.vue";
import ProgramGamesCards from "./ProgramGamesCards.vue";

const props = defineProps<{
  program: any;
}>();

const emit = defineEmits(["select-game"]);

const games = computed(() => props.program?.games || []);
</script>

<template>
  <div>
    <!-- Desktop View -->
    <div class="hidden md:block">
      <ProgramGamesTable
        :games="games"
        @select-game="(g) => emit('select-game', g)"
      />
    </div>

    <!-- Mobile View -->
    <div class="md:hidden">
      <ProgramGamesCards
        :games="games"
        @select-game="(g) => emit('select-game', g)"
      />
    </div>
  </div>
</template>
