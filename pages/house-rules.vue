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
          To ensure a positive environment for all our guests, please review our
          operational guidelines.
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
                {{ BUSINESS_INFO.name }} is a community-focused venue. We ask
                that all guests maintain a respectful environment for staff and
                other players. Disruptive behavior is not permitted.
              </li>
              <li>
                <strong>Age Requirement:</strong>
                Guests must meet the minimum age requirements to purchase bingo
                packs or play electronic machines, in accordance with applicable
                regulations. Identification may be requested.
              </li>
              <li>
                <strong>Seating:</strong> Seating is first-come, first-served
                for active players. Guests may be asked to vacate seats during
                peak times if not participating.
              </li>
            </ul>
          </div>
        </div>

        <!-- Gameplay & Payouts -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-8 bg-gold"></div>
            <h2 class="text-2xl font-bold text-primary-900">
              Gameplay Guidelines
            </h2>
          </div>
          <div class="prose prose-slate max-w-none">
            <ul class="space-y-4 text-slate-700">
              <li>
                <strong>Bingo Verification:</strong> It is the player's
                responsibility to announce "BINGO" clearly for the MIC to
                hear. The game concludes when the MIC acknowledges the win.
                Late calls may not be honored if the next number has already
                been started.
              </li>
              <li>
                <strong>Valid Bingos:</strong> A valid bingo is subject to
                verification on the master board. All results are subject to
                standard operational procedures.
              </li>
              <li>
                <strong>Splitting Prizes:</strong> If multiple players bingo on
                the same number, the prize amount is typically divided equally
                among the winners.
              </li>
              <li>
                <strong>Electronics:</strong> Electronic bingo devices are
                available. Please report any technical issues immediately. We
                are not responsible for unplayed games due to unreported device
                issues.
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
                non-smoking facility. Designated smoking areas are generally
                provided outside the main entrance.
              </li>
              <li>
                <strong>Personal Property:</strong> Guests are responsible for
                their own personal belongings. Please keep valuables with you.
              </li>
            </ul>
          </div>
        </div>

        <div
          class="bg-primary-50 p-8 rounded-2xl border border-primary-100 mt-12"
        >
          <p class="text-sm text-primary-800 text-center italic">
            These guidelines are subject to change. All activities are subject
            to posted policies and procedures.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

useSeoMeta({
  title: "House Rules | Mary Esther Bingo",
  description: `Operational policies and guidelines for ${BUSINESS_INFO.value.name}.`,
});
</script>
