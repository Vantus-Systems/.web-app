<template>
  <div class="bg-primary-50">
    <!-- Hero Section -->
    <div class="bg-primary-900 text-white py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gold-500/10 pattern-grid-lg"></div>
      <div class="container mx-auto px-4 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gold mb-6">
          Pricing & Sessions
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
          Experience world-class bingo with flexible options for every player.
          Join us for our daily sessions or drop in for our pay-as-you-go games.
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12 -mt-10 relative z-20">
      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center py-20">
        <div
          class="animate-spin h-12 w-12 border-4 border-gold border-t-transparent rounded-full"
        ></div>
      </div>

      <div v-else class="space-y-12">
        <!-- Main Session Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-gold">
          <div class="bg-primary-800 p-6 text-center">
            <h2 class="text-3xl font-bold text-white mb-2">
              Evening Session
            </h2>
            <p v-if="pricing?.session?.schedule_note" class="text-gold-300 uppercase tracking-widest text-sm font-semibold">
              {{ pricing.session.schedule_note }}
            </p>
          </div>

          <div class="p-8">
            <div class="grid md:grid-cols-2 gap-12">
              <!-- Machines -->
              <div>
                <h3 class="text-2xl font-bold text-primary-900 mb-6 flex items-center">
                  <span class="bg-gold text-primary-900 rounded-full h-8 w-8 flex items-center justify-center mr-3 text-sm">1</span>
                  Tech-Assist Bundles
                </h3>
                <div v-if="pricing?.session?.machines" class="space-y-4">
                  <div
                    v-for="(machine, idx) in pricing.session.machines"
                    :key="idx"
                    class="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div>
                      <span class="text-lg font-bold text-gray-800">{{ machine.description }}</span>
                      <p v-if="machine.details" class="text-sm text-gray-500 mt-1">{{ machine.details }}</p>
                    </div>
                    <span class="text-xl font-bold text-gold-600">{{ machine.price }}</span>
                  </div>
                </div>

                <!-- Value Highlight -->
                <div class="mt-6 bg-gold-50 border border-gold-200 rounded-lg p-4">
                  <p class="text-primary-900 font-semibold text-center">
                    <span class="text-gold-600 mr-2">★</span>
                    Best Value: 2 Machines include 6-packs, double actions & Letter X!
                  </p>
                </div>
              </div>

              <!-- Paper Specials -->
              <div>
                <h3 class="text-2xl font-bold text-primary-900 mb-6 flex items-center">
                  <span class="bg-gold text-primary-900 rounded-full h-8 w-8 flex items-center justify-center mr-3 text-sm">2</span>
                  Paper Specials
                </h3>
                <div v-if="pricing?.session?.paper_specials" class="space-y-4">
                  <div
                    v-for="(special, idx) in pricing.session.paper_specials"
                    :key="idx"
                    class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg"
                  >
                    <div>
                      <h4 class="font-bold text-gray-900">{{ special.name }}</h4>
                      <p class="text-xs text-gray-500">{{ special.note }}</p>
                    </div>
                    <div class="text-right mt-2 sm:mt-0">
                      <div class="font-bold text-gold-600">{{ special.price }}</div>
                      <div class="text-sm text-gray-600">{{ special.bundle }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sunday Specials -->
            <div class="mt-12 border-t border-gray-200 pt-8">
              <h3 class="text-xl font-bold text-primary-900 mb-6 text-center">Sunday Night Exclusives</h3>
              <div v-if="pricing?.session?.sunday_specials" class="grid md:grid-cols-3 gap-6">
                <div class="text-center p-4 bg-primary-50 rounded-lg">
                  <h4 class="font-bold text-primary-800 mb-2">Speedy</h4>
                  <p class="text-gold-600 font-bold">{{ pricing.session.sunday_specials.speedy?.price }}</p>
                  <p class="text-sm text-gray-600">{{ pricing.session.sunday_specials.speedy?.bundle }}</p>
                </div>
                <div class="text-center p-4 bg-primary-50 rounded-lg">
                  <h4 class="font-bold text-primary-800 mb-2">Super 3 & U-PIK</h4>
                  <p class="text-gold-600 font-bold">{{ pricing.session.sunday_specials.super3_upik?.price }}</p>
                  <p class="text-sm text-gray-600">{{ pricing.session.sunday_specials.super3_upik?.bundle }}</p>
                </div>
                <div class="text-center p-4 bg-gold-100 rounded-lg border border-gold-300">
                  <h4 class="font-bold text-primary-800 mb-2">Loyalty Bonus</h4>
                  <p class="text-sm text-primary-900">{{ pricing.session.sunday_specials.upik_bonus }}</p>
                </div>
              </div>
            </div>

            <!-- Extra Info -->
            <div v-if="pricing?.session?.extras" class="mt-8 flex flex-wrap justify-center gap-2">
                <span v-for="(extra, i) in pricing.session.extras" :key="i" class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {{ extra }}
                </span>
            </div>
          </div>
        </div>

        <!-- Pay As You Go Section -->
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Early Bird -->
             <div class="bg-white rounded-xl shadow-lg p-6">
                 <h3 class="text-xl font-bold text-primary-900 mb-2">Morning Play</h3>
                 <p v-if="pricing?.pay_as_you_go?.early_bird?.time" class="text-gold-600 font-semibold mb-6">{{ pricing.pay_as_you_go.early_bird.time }}</p>

                 <div v-if="pricing?.pay_as_you_go?.early_bird?.machine_prices" class="space-y-3 mb-6">
                     <div v-for="(price, idx) in pricing.pay_as_you_go.early_bird.machine_prices" :key="idx" class="flex justify-between border-b border-gray-100 pb-2">
                         <span class="text-gray-700">{{ price.description }}</span>
                         <span class="font-bold text-primary-900">{{ price.price }}</span>
                     </div>
                 </div>

                 <div v-if="pricing?.pay_as_you_go?.early_bird?.paper_bonus" class="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                     <strong>Bonus:</strong> {{ pricing.pay_as_you_go.early_bird.paper_bonus }}
                 </div>
             </div>

             <!-- Afternoon -->
             <div class="bg-white rounded-xl shadow-lg p-6">
                 <h3 class="text-xl font-bold text-primary-900 mb-2">Afternoon Play</h3>
                 <p v-if="pricing?.pay_as_you_go?.regular?.time" class="text-gold-600 font-semibold mb-6">{{ pricing.pay_as_you_go.regular.time }}</p>

                 <div v-if="pricing?.pay_as_you_go?.regular?.machine_prices" class="space-y-3 mb-6">
                     <div v-for="(price, idx) in pricing.pay_as_you_go.regular.machine_prices" :key="idx" class="flex justify-between border-b border-gray-100 pb-2">
                         <span class="text-gray-700">{{ price.description }}</span>
                         <span class="font-bold text-primary-900">{{ price.price }}</span>
                     </div>
                 </div>

                  <div v-if="pricing?.pay_as_you_go?.regular?.paper_bonus" class="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                     <strong>Bonus:</strong> {{ pricing.pay_as_you_go.regular.paper_bonus }}
                 </div>
             </div>
        </div>

        <!-- Paper Only -->
        <div class="bg-white rounded-xl shadow-lg p-8">
            <h3 class="text-xl font-bold text-primary-900 mb-6 border-b pb-4">Paper Only Options</h3>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 class="font-bold text-gray-700 mb-4">Regular Bingo</h4>
                    <ul v-if="pricing?.pay_as_you_go?.paper_only?.regular_bingo" class="space-y-2">
                        <li v-for="(opt, idx) in pricing.pay_as_you_go.paper_only.regular_bingo" :key="idx" class="flex justify-between">
                            <span>{{ opt.description }}</span>
                            <span class="font-bold text-gold-600">{{ opt.price }}</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-700 mb-4">Specials</h4>
                     <ul v-if="pricing?.pay_as_you_go?.paper_only?.specials" class="space-y-2">
                        <li v-for="(opt, idx) in pricing.pay_as_you_go.paper_only.specials" :key="idx" class="flex justify-between">
                            <span>{{ opt.name }}</span>
                            <div class="text-right">
                                <span class="font-bold text-gold-600 block">{{ opt.price }}</span>
                                <span class="text-xs text-gray-500">{{ opt.bundle }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Pricing & Sessions | Mary Esther Bingo",
  description: "View our session prices, machine bundles, and special game rates. Affordable entertainment daily!",
});

const { data: pricing, pending } = await useFetch("/api/pricing");
</script>
