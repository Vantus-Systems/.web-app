<template>
  <div class="bg-gray-50 font-sans text-slate-800">
    <!-- Hero Section -->
    <div class="relative bg-primary-900 text-white overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="h-full w-full" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" class="text-gold-500" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div class="container mx-auto px-4 py-24 md:py-32 relative z-10 text-center">
        <span class="inline-block py-1 px-3 rounded-full bg-gold-500/20 border border-gold-500/50 text-gold-300 text-sm font-semibold tracking-wider uppercase mb-6">
          World-Class Entertainment
        </span>
        <h1 class="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          Pricing & <span class="text-gold-400">Sessions</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light mb-10 leading-relaxed">
          Flexible play options designed for your schedule. <br class="hidden md:block" />
          Choose from our casual daytime games or the premier evening experience.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#pay-as-you-go" class="bg-white text-primary-900 px-8 py-4 rounded-lg font-bold shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1">
            Daytime Play
          </a>
           <a href="#evening-session" class="bg-transparent border-2 border-gold-500 text-gold-400 px-8 py-4 rounded-lg font-bold hover:bg-gold-500 hover:text-primary-900 transition-all">
            Evening Session
          </a>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 -mt-10 relative z-20">
      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin h-12 w-12 border-4 border-gold-500 border-t-transparent rounded-full"></div>
      </div>
    </div>

      <div v-else class="space-y-24">

        <!-- SECTION 1: PAY AS YOU GO (Daytime) -->
        <section id="pay-as-you-go">
           <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Pay-As-You-Go</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">Perfect for a quick game or a relaxed afternoon. Drop in anytime during our daytime hours.</p>
          </div>

          <div class="grid lg:grid-cols-2 gap-8 items-stretch">
            <!-- Morning Card -->
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div class="p-8 border-b border-gray-100 bg-gray-50/50">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-2xl font-bold text-primary-900">Morning Play</h3>
                    <p class="text-sm font-semibold text-gold-600 uppercase tracking-wide mt-1">
                       {{ pricing?.pay_as_you_go?.early_bird?.time }}
                    </p>
                  </div>
                  <div class="bg-primary-100 text-primary-800 p-2 rounded-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                </div>
                <div class="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 flex items-start">
                   <span class="mr-2 text-lg">💡</span>
                   <span><strong>Pro Tip:</strong> {{ pricing?.pay_as_you_go?.early_bird?.paper_bonus }}</span>
                </div>
              </div>
              <div class="p-8 flex-grow">
                 <ul class="space-y-4">
                     <li v-for="(price, idx) in pricing?.pay_as_you_go?.early_bird?.machine_prices" :key="idx" class="flex justify-between items-center group">
                         <span class="text-gray-700 font-medium group-hover:text-primary-700 transition-colors">{{ price.description }}</span>
                         <span class="text-xl font-bold text-primary-900">{{ price.price }}</span>
                     </li>
                 </ul>
              </div>
            </div>

            <!-- Afternoon Card -->
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div class="p-8 border-b border-gray-100 bg-gray-50/50">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-2xl font-bold text-primary-900">Afternoon Play</h3>
                    <p class="text-sm font-semibold text-gold-600 uppercase tracking-wide mt-1">
                      {{ pricing?.pay_as_you_go?.regular?.time }}
                    </p>
                  </div>
                  <div class="bg-primary-100 text-primary-800 p-2 rounded-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>
                <div class="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 flex items-start">
                   <span class="mr-2 text-lg">💡</span>
                   <span><strong>Pro Tip:</strong> {{ pricing?.pay_as_you_go?.regular?.paper_bonus }}</span>
                </div>
              </div>
              <div class="p-8 flex-grow">
                 <ul class="space-y-4">
                     <li v-for="(price, idx) in pricing?.pay_as_you_go?.regular?.machine_prices" :key="idx" class="flex justify-between items-center group">
                         <span class="text-gray-700 font-medium group-hover:text-primary-700 transition-colors">{{ price.description }}</span>
                         <span class="text-xl font-bold text-primary-900">{{ price.price }}</span>
                     </li>
                 </ul>
              </div>
            </div>
          </div>

          <!-- Paper Only Sub-section -->
          <div class="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h4 class="text-lg font-bold text-gray-500 uppercase tracking-widest mb-6 border-b pb-2">Paper Only Options</h4>
            <div class="grid md:grid-cols-2 gap-12">
               <div>
                  <h5 class="font-bold text-primary-900 text-lg mb-4">Regular Bingo</h5>
                  <ul class="space-y-3">
                     <li v-for="(opt, idx) in pricing?.pay_as_you_go?.paper_only?.regular_bingo" :key="idx" class="flex justify-between items-center">
                        <span class="text-gray-600">{{ opt.description }}</span>
                        <span class="font-bold text-gold-600 text-lg">{{ opt.price }}</span>
                     </li>
                  </ul>
               </div>
               <div>
                  <h5 class="font-bold text-primary-900 text-lg mb-4">Specials</h5>
                  <ul class="space-y-3">
                     <li v-for="(opt, idx) in pricing?.pay_as_you_go?.paper_only?.specials" :key="idx" class="flex justify-between items-center">
                        <span class="text-gray-600">{{ opt.name }}</span>
                        <div class="text-right">
                           <span class="font-bold text-gold-600 text-lg block">{{ opt.price }}</span>
                           <span class="text-xs text-gray-400 uppercase">{{ opt.bundle }}</span>
                        </div>
                     </li>
                  </ul>
               </div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: EVENING SESSION (Premium) -->
        <section id="evening-session" class="relative">
          <div class="absolute inset-0 bg-primary-900 transform -skew-y-2 rounded-3xl shadow-2xl z-0"></div>

          <div class="relative z-10 py-12 px-6 md:px-12 text-white">
            <div class="text-center mb-16">
              <span class="bg-gold-500 text-primary-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">The Main Event</span>
              <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-4">Evening Session</h2>
              <p class="text-gold-200 text-lg font-medium tracking-wide">{{ pricing?.session?.schedule_note }}</p>
            </div>

            <div class="grid lg:grid-cols-2 gap-12">
              <!-- Machines Column -->
              <div class="bg-primary-800/50 backdrop-blur-lg rounded-2xl p-8 border border-primary-700">
                <div class="flex items-center mb-8">
                  <div class="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center text-primary-900 font-bold text-xl mr-4">1</div>
                  <h3 class="text-3xl font-bold text-white">Tech-Assist Bundles</h3>
                </div>

                <div class="space-y-6">
                   <div v-for="(machine, idx) in pricing?.session?.machines" :key="idx" class="group">
                      <div class="flex justify-between items-baseline mb-1">
                        <span class="text-xl font-medium text-gray-100 group-hover:text-gold-400 transition-colors">{{ machine.description }}</span>
                        <span class="text-2xl font-bold text-gold-400">{{ machine.price }}</span>
                      </div>
                      <p v-if="machine.details" class="text-primary-200 text-sm">{{ machine.details }}</p>
                   </div>
                </div>

                <div class="mt-8 bg-gradient-to-r from-gold-600 to-gold-400 rounded-xl p-1">
                  <div class="bg-primary-900 rounded-lg p-4 h-full flex items-center justify-center text-center">
                    <p class="text-gold-100 font-medium">
                      <span class="text-gold-400 text-xl mr-2">★</span>
                      <strong>Best Value:</strong> 2 Machines include 6-packs, double actions & Letter X!
                    </p>
                  </div>
                </div>
              </div>

              <!-- Paper Specials Column -->
              <div class="bg-primary-800/50 backdrop-blur-lg rounded-2xl p-8 border border-primary-700">
                 <div class="flex items-center mb-8">
                  <div class="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary-900 font-bold text-xl mr-4">2</div>
                  <h3 class="text-3xl font-bold text-white">Paper Specials</h3>
                </div>

                <div class="space-y-6">
                   <div v-for="(special, idx) in pricing?.session?.paper_specials" :key="idx" class="flex items-center justify-between p-4 rounded-xl bg-primary-900/40 border border-primary-700 hover:bg-primary-700/50 transition-colors">
                      <div>
                        <h4 class="font-bold text-white text-lg">{{ special.name }}</h4>
                        <p class="text-xs text-primary-300 uppercase tracking-wider mt-1">{{ special.note }}</p>
                      </div>
                      <div class="text-right">
                         <div class="text-xl font-bold text-gold-400">{{ special.price }}</div>
                         <div class="text-xs text-primary-300">{{ special.bundle }}</div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <!-- Sunday Specials Footer -->
            <div class="mt-16 pt-10 border-t border-primary-700">
               <h3 class="text-2xl font-bold text-center text-white mb-10">Sunday Night Exclusives</h3>
               <div class="grid md:grid-cols-3 gap-6">
                 <!-- Special 1 -->
                 <div class="bg-primary-800 rounded-xl p-6 text-center border border-primary-600">
                   <h4 class="text-gold-400 font-bold text-lg mb-2">Speedy</h4>
                   <p class="text-2xl font-bold text-white mb-1">{{ pricing?.session?.sunday_specials?.speedy?.price }}</p>
                   <p class="text-sm text-primary-300">{{ pricing?.session?.sunday_specials?.speedy?.bundle }}</p>
                 </div>
                 <!-- Special 2 -->
                 <div class="bg-primary-800 rounded-xl p-6 text-center border border-primary-600">
                   <h4 class="text-gold-400 font-bold text-lg mb-2">Super 3 & U-PIK</h4>
                   <p class="text-2xl font-bold text-white mb-1">{{ pricing?.session?.sunday_specials?.super3_upik?.price }}</p>
                   <p class="text-sm text-primary-300">{{ pricing?.session?.sunday_specials?.super3_upik?.bundle }}</p>
                 </div>
                 <!-- Special 3 -->
                 <div class="bg-gold-500 rounded-xl p-6 text-center text-primary-900 shadow-lg transform scale-105">
                   <h4 class="font-black text-lg mb-2 uppercase tracking-wide">Loyalty Bonus</h4>
                   <p class="font-bold leading-tight">{{ pricing?.session?.sunday_specials?.upik_bonus }}</p>
                 </div>
               </div>
            </div>
          </div>
        </section>

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

<style scoped>
.pattern-grid-lg {
  background-image: radial-gradient(rgba(234, 179, 8, 0.2) 1px, transparent 1px);
  background-size: 32px 32px;
}
html {
  scroll-behavior: smooth;
}
</style>
