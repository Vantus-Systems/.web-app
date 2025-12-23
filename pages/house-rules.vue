<template>
  <div>
    <!-- Header -->
    <section class="bg-primary-900 py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="container mx-auto px-4 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
          House Rules
        </h1>
        <p class="text-xl text-primary-100 max-w-2xl mx-auto">
          To ensure a fun, fair, and safe environment for all our guests, please
          review our operational policies.
        </p>
      </div>
    </section>

    <!-- Rules Content -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- General Conduct -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-8 bg-gold"></div>
            <h2 class="text-2xl font-bold text-primary-900">General Conduct</h2>
          </div>
          <div class="prose prose-slate max-w-none">
            <ul class="space-y-4 text-slate-700">
              <li>
                <strong>Respectful Behavior:</strong>
                {{ BUSINESS_INFO.name }} is a community-focused venue.
                Harassment, abusive language, or disruptive behavior towards
                staff or other players will not be tolerated and may result in
                removal from the premises.
              </li>
              <li>
                <strong>Age Requirement:</strong> In accordance with Florida
                State Gaming Regulations, all players must be at least 18 years
                of age to purchase bingo packs or play electronic machines. ID
                may be requested.
              </li>
              <li>
                <strong>No Loitering:</strong> Seating is reserved for active
                players. Non-playing guests may be asked to vacate seats during
                peak hours.
              </li>
            </ul>
          </div>
        </div>

        <!-- Gameplay & Payouts -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-8 bg-gold"></div>
            <h2 class="text-2xl font-bold text-primary-900">
              Gameplay & Payouts
            </h2>
          </div>
          <div class="prose prose-slate max-w-none">
            <ul class="space-y-4 text-slate-700">
              <li>
                <strong>Bingo Verification:</strong> It is the player's
                responsibility to yell "BINGO" loud enough for the caller to
                hear. The game stops only when the caller hears you. Late calls
                may not be honored if the next number has already been started.
              </li>
              <li>
                <strong>Valid Bingos:</strong> A valid bingo must be verified on
                the master board. In the event of a dispute, the decision of the
                Floor Manager is final.
              </li>
              <li>
                <strong>Splitting Pots:</strong> If multiple players bingo on
                the same number, the prize amount will be divided equally among
                the winners.
              </li>
              <li>
                <strong>Electronics:</strong> Electronic bingo devices
                (handsets/tablets) are available. Malfunctions must be reported
                immediately. We are not responsible for unplayed games due to
                unreported device issues.
              </li>
            </ul>
          </div>
        </div>

        <!-- Facility Policies -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-8 bg-gold"></div>
            <h2 class="text-2xl font-bold text-primary-900">
              Facility Policies
            </h2>
          </div>
          <div class="prose prose-slate max-w-none">
            <ul class="space-y-4 text-slate-700">
              <li>
                <strong>Smoking/Vaping:</strong> {{ BUSINESS_INFO.name }} is a
                non-smoking facility. Designated smoking areas are provided
                outside the main entrance.
              </li>
              <li>
                <strong>Outside Food & Drink:</strong> No outside food or
                beverages are permitted. We offer a full-service
                concession/buffet for your convenience.
              </li>
              <li>
                <strong>Personal Property:</strong> Management is not
                responsible for lost or stolen items. Please keep your valuables
                with you at all times.
              </li>
            </ul>
          </div>
        </div>

        <div
          class="bg-primary-50 p-8 rounded-2xl border border-primary-100 mt-12"
        >
          <p class="text-sm text-primary-800 text-center italic">
            These rules are subject to change without notice. Management
            reserves the final right on all decisions regarding gameplay and
            facility conduct.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BUSINESS_INFO } from "~/utils/business";

useSeoMeta({
  title: "House Rules | Mary Esther Bingo",
  description: `Operational policies, gameplay rules, and code of conduct for ${BUSINESS_INFO.name}.`,
});
</script>
