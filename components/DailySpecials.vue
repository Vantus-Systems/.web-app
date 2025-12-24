<template>
  <!-- Full-Width Immersive Hero Section -->
  <section
    class="relative w-full overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white"
  >
    <!-- Background Pattern Overlay -->
    <div
      class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596706062103-3a7b95399c71?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-primary-950/95 via-primary-900/80 to-transparent"
    ></div>

    <!-- Content Container -->
    <div class="relative z-10 container mx-auto px-4 py-16 md:py-24">
      <!-- Top Badge & Headline -->
      <div class="text-center mb-12">
        <div
          v-motion-fade-visible
          class="inline-flex items-center gap-2 bg-gold-500/20 backdrop-blur-sm border border-gold-400/50 text-gold-300 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-[0.3em] mb-6 shadow-lg shadow-gold/20"
        >
          <span
            class="inline-block w-2 h-2 bg-gold-400 rounded-full animate-pulse"
          ></span>
          Daily Specials • Fort Walton's Only Daily-Session Hall
        </div>
        <h2
          v-motion-fade-visible
          class="font-heading text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-100 to-gold-300 drop-shadow-2xl"
        >
          Every Day is Game Day
        </h2>
        <p
          v-motion-fade-visible
          class="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed font-light"
        >
          {{ heroNoteComputed }}
        </p>
      </div>

      <!-- Today's Feature Spotlight (Premium Card) -->
      <div v-motion-fade-visible class="max-w-5xl mx-auto mb-12 relative group">
        <!-- Glow Effect -->
        <div
          class="absolute -inset-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
        ></div>

        <div
          class="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div
            class="flex flex-col lg:flex-row gap-8 items-start lg:items-center"
          >
            <!-- Left: Today's Info -->
            <div class="flex-1 space-y-4">
              <div class="flex items-center gap-3 flex-wrap">
                <span
                  class="inline-block bg-gradient-to-r from-gold-500 to-gold-400 text-primary-900 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg"
                >
                  {{ highlightLabel }}
                </span>
                <span
                  class="inline-flex items-center gap-2 text-primary-200 text-sm"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ highlight?.time ?? "Bingo daily starting at 10:30 AM" }}
                </span>
              </div>

              <h3
                class="text-3xl md:text-4xl font-black text-white leading-tight"
              >
                {{ highlight?.title ?? "Daily Excitement Awaits" }}
              </h3>

              <p class="text-lg text-primary-100 leading-relaxed">
                {{
                  highlight?.description ??
                  "Join us for fast-paced games, friendly faces, and chances to win big every single day."
                }}
              </p>

              <!-- Offers List -->
              <div
                v-if="highlight?.offers?.length"
                class="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <p
                  class="text-sm font-bold uppercase tracking-widest text-gold-300 mb-3"
                >
                  ✨ Today's Offers
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="offer in highlight.offers"
                    :key="offer"
                    class="flex items-start gap-3 text-primary-100"
                  >
                    <svg
                      class="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-base">{{ offer }}</span>
                  </li>
                </ul>
              </div>

              <!-- Special Note or Default -->
              <p
                v-if="highlight?.note"
                class="text-sm italic text-gold-200 border-l-4 border-gold-500 pl-4 py-2"
              >
                💡 {{ highlight.note }}
              </p>
              <p
                v-else
                class="text-sm text-primary-300 border-l-4 border-primary-600 pl-4 py-2"
              >
                🎯 Mary Esther Bingo • Fort Walton Beach's exclusive
                daily-session venue
              </p>
            </div>

            <!-- Right: Social Proof & CTA -->
            <div class="lg:w-80 space-y-4">
              <div
                class="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-400/30 rounded-2xl p-6 text-center"
              >
                <p class="text-sm uppercase tracking-wider text-gold-300 mb-2">
                  Active Community
                </p>
                <p
                  class="text-4xl md:text-5xl font-black text-white mb-1 tabular-nums"
                >
                  200+
                </p>
                <p class="text-sm text-primary-200">players join us daily</p>
              </div>

              <div class="flex flex-col gap-3">
                <NuxtLink to="/schedule" class="block">
                  <BaseButton
                    variant="gold"
                    class="w-full text-lg py-4 shadow-xl shadow-gold/30 hover:shadow-2xl hover:shadow-gold/40 transition-all duration-300 hover:-translate-y-1"
                  >
                    See Full Schedule →
                  </BaseButton>
                </NuxtLink>
                <NuxtLink to="/pricing" class="block">
                  <BaseButton
                    variant="outline"
                    class="w-full border-2 border-white/70 text-white hover:bg-white/10 transition-all duration-300"
                  >
                    View All Pricing
                  </BaseButton>
                </NuxtLink>
              </div>

              <p class="text-xs text-center text-primary-300 italic">
                🔒 Secure parking • Professional staff • Family-friendly<sup
                  class="text-red-400"
                  >*</sup
                >
                <span class="text-xs">18+</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Preview Grid -->
      <div class="max-w-6xl mx-auto">
        <h3 class="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
          This Week's Lineup
        </h3>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="day in weeklyPreview"
            :key="day.day"
            v-motion-fade-visible
            class="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/20 cursor-pointer"
          >
            <!-- Day Badge -->
            <div
              class="absolute -top-3 -right-3 bg-gradient-to-br from-gold-500 to-gold-600 text-primary-900 w-12 h-12 rounded-full flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              {{ day.day.slice(0, 3).toUpperCase() }}
            </div>

            <div class="space-y-2">
              <p class="text-xs uppercase tracking-wider text-primary-300">
                {{ day.day }}
              </p>
              <h4 class="text-lg font-bold text-white leading-tight">
                {{ day.title }}
              </h4>
              <p class="text-sm text-primary-200 flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-gold-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ day.time ?? "Check schedule" }}
              </p>
              <p
                v-if="day.description"
                class="text-sm text-primary-300 line-clamp-2"
              >
                {{ day.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { useSpecialsStore } from "~/stores/specials";

const specialsStore = useSpecialsStore();
const fallbackHeroNote =
  "Mary Esther Bingo is the only hall in Fort Walton that plays session every day — closest halls are Crestview, Pensacola, and Panama City.";

const heroNoteComputed = computed(
  () => specialsStore.heroNote || fallbackHeroNote,
);

const highlight = computed(
  () => specialsStore.today ?? specialsStore.weekly[0] ?? null,
);

const highlightLabel = computed(() =>
  highlight.value ? `${highlight.value.day} Spotlight` : "Daily Spotlight",
);

const weeklyPreview = computed(() => specialsStore.weekly.slice(0, 7));
</script>
