<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl text-primary-900 mb-4">House Rules</h1>
        <p class="text-slate-600 text-lg">
          To ensure a fun and fair experience for everyone, we ask that all players observe the following rules.
        </p>
      </div>

      <div class="space-y-8">
        <BaseCard class="prose prose-slate max-w-none p-8 md:p-12">
          <h2 class="text-primary-800 font-bold text-2xl mb-4">General Policies</h2>
          <ul class="list-disc pl-5 space-y-2 text-slate-700">
            <li>All players must be 18 years of age or older to play. Valid ID may be required.</li>
            <li>Admission packs must be purchased to be eligible for any prizes.</li>
            <li>Please silence all cell phones during game play to respect other players.</li>
            <li>Management reserves the right to refuse service to anyone.</li>
            <li>No outside food or beverages are allowed. Please visit our full-service buffet and snack bar.</li>
          </ul>

          <h2 class="text-primary-800 font-bold text-2xl mt-8 mb-4">Jackpot & Payouts</h2>
          <ul class="list-disc pl-5 space-y-2 text-slate-700">
            <li>You must have the last number called to have a valid bingo.</li>
            <li>It is the player's responsibility to yell "BINGO" loud enough for the caller to hear.</li>
            <li>Once the caller closes the game or starts calling the next number, no further bingos will be honored for that game.</li>
            <li>Progressive jackpots are paid out according to the specific rules posted in the hall for that game.</li>
            <li>Aggregate payouts may apply in the event of multiple winners on a single prize.</li>
          </ul>

          <h2 class="text-primary-800 font-bold text-2xl mt-8 mb-4">Equipment & Reservations</h2>
          <ul class="list-disc pl-5 space-y-2 text-slate-700">
            <li>Electronic "Tech-Assist" terminals are available on a first-come, first-served basis.</li>
            <li>Any malfunction of electronic equipment voids all pays and plays.</li>
            <li>Seating reservations can be made for groups of 10 or more by contacting us in advance.</li>
          </ul>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '~/components/ui/BaseCard.vue';

useSeoMeta({
  title: 'House Rules | Mary Esther Bingo',
  description: 'View the house rules, jackpot payout policies, and general regulations for playing at Mary Esther Bingo.',
});
</script>
