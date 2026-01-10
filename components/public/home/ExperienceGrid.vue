<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div
      class="group relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4]"
    >
      <!-- Background Image Placeholder - In real app, use optimized NuxtImg -->
      <div class="absolute inset-0 bg-slate-900">
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"
        ></div>
        <!-- Replace with real images -->
        <div
          class="absolute inset-0 bg-[url('https://placehold.co/600x800/1e293b/FFF?text=Morning')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
        ></div>
      </div>

      <div class="absolute bottom-0 left-0 w-full p-6 z-20">
        <h3 class="text-2xl font-bold text-white mb-2">Morning Social</h3>
        <p class="text-slate-200 text-sm mb-4">
          Start your day with coffee, conversation, and casual play. Perfect for
          meeting friends.
        </p>
        <span
          class="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-bold uppercase tracking-wider rounded-full"
          >10:30 AM Daily</span
        >
      </div>
    </div>

    <div
      class="group relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4] ring-4 ring-gold-400/30"
    >
      <div class="absolute inset-0 bg-slate-900">
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"
        ></div>
        <div
          class="absolute inset-0 bg-[url('https://placehold.co/600x800/0f172a/FFF?text=Evening')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
        ></div>
      </div>

      <div class="absolute top-4 right-4 z-20">
        <span
          class="px-3 py-1 bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded shadow-lg"
          >Most Popular</span
        >
      </div>

      <div class="absolute bottom-0 left-0 w-full p-6 z-20">
        <h3 class="text-2xl font-bold text-white mb-2">Evening Gala</h3>
        <p class="text-slate-200 text-sm mb-4">
          High stakes, big jackpots, and an electric atmosphere. The premier
          bingo experience.
        </p>
        <span
          class="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-bold uppercase tracking-wider rounded-full"
          >7:30 PM Daily</span
        >
      </div>
    </div>

    <div
      class="group relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4]"
    >
      <div class="absolute inset-0 bg-slate-900">
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"
        ></div>
        <div
          class="absolute inset-0 bg-[url('https://placehold.co/600x800/334155/FFF?text=Late+Night')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
        ></div>
      </div>

      <div class="absolute bottom-0 left-0 w-full p-6 z-20">
        <h3 class="text-2xl font-bold text-white mb-2">Late Night</h3>
        <p class="text-slate-200 text-sm mb-4">
          Fast-paced games for the night owls. Quick wins and great vibes until
          midnight.
        </p>
        <span
          class="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-bold uppercase tracking-wider rounded-full"
          >Fri & Sat Nights</span
        >
      </div>
    </div>
  </div>
</template>
