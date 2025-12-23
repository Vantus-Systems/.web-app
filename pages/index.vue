<template>
  <div>
    <!-- Hero Section -->
    <section
      class="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-primary-900"
    >
      <div
        class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1757689216934-8c7907b44a28?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0')] bg-cover bg-center opacity-20"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-primary-950/90 to-transparent"
      ></div>

      <div
        v-motion-fade-visible
        class="container relative mx-auto px-4 text-center z-10"
      >
        <div
          class="inline-block bg-primary-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gold/30"
        >
          <span class="text-gold font-bold tracking-wider text-sm uppercase"
            >Volunteer-Run • 100% Charity Support</span
          >
        </div>
        <h1
          class="text-5xl md:text-7xl font-heading font-black text-white mb-6 tracking-tight drop-shadow-xl"
        >
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-100 to-gold-400"
            >PLAY FOR CASH</span
          ><br />
          SUPPORT THE COMMUNITY
        </h1>
        <p
          class="text-xl md:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto font-light"
        >
          Northwest Florida's Premier Bingo Destination. Join us for high-stakes
          games, comfortable seating, and a friendly atmosphere.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <NuxtLink to="/schedule">
            <BaseButton
              variant="gold"
              class="text-lg px-8 py-4 shadow-xl shadow-gold/20"
            >
              Join the Game
            </BaseButton>
          </NuxtLink>
          <NuxtLink to="/pricing">
            <BaseButton
              variant="outline"
              class="text-lg px-8 py-4 border-white text-white hover:bg-white/10"
            >
              View Pricing
            </BaseButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Jackpot Ticker -->
    <div
      class="bg-primary-800 border-y-4 border-gold py-6 overflow-hidden relative"
    >
      <div
        class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center"
      >
        <span
          class="text-gold font-bold uppercase tracking-widest text-lg md:text-xl"
          >Shamrock Progressive Jackpot</span
        >
        <span
          v-motion-pop
          class="text-4xl md:text-6xl font-mono font-bold text-white tabular-nums drop-shadow-lg"
        >
          {{ formatCurrency(jackpotStore.currentJackpot) }}
        </span>
        <span
          class="text-xs text-primary-300 mt-2 md:mt-0 uppercase tracking-wider"
          >* Current Posted Jackpot</span
        >
      </div>
    </div>

    <!-- Features Grid -->
    <section class="py-24 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl text-primary-900 mb-4">
            Why Play With Us?
          </h2>
          <p class="text-slate-600 max-w-2xl mx-auto text-lg">
            More than just a game. We offer a premium entertainment experience
            with community at its heart.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BaseCard
            v-for="(feature, idx) in features"
            :key="idx"
            class="h-full hover:-translate-y-2 transition-transform duration-300 border-t-4 border-t-gold"
          >
            <div
              class="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-primary-700"
            >
              <component
                :is="feature.icon"
                class="w-8 h-8"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-xl font-bold text-primary-900 mb-3">
              {{ feature.title }}
            </h3>
            <p class="text-slate-600 leading-relaxed">
              {{ feature.description }}
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Location CTA -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div
          class="bg-primary-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          <div class="p-12 md:w-1/2 flex flex-col justify-center">
            <h2 class="text-3xl md:text-4xl text-white mb-6">Visit Us Today</h2>
            <p class="text-primary-100 mb-8 text-lg">
              Located conveniently at {{ BUSINESS_INFO.address.street }}. We're
              open {{ BUSINESS_INFO.hours }}. Ample parking and security
              provided.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink to="/contact">
                <BaseButton variant="gold">Get Directions</BaseButton>
              </NuxtLink>
            </div>
          </div>
          <div class="md:w-1/2 h-64 md:h-auto bg-slate-200 min-h-[300px]">
            <NuxtImg
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2940&auto=format&fit=crop"
              class="w-full h-full object-cover"
              alt="Friends enjoying a game of bingo at Mary Esther Bingo hall"
              width="800"
              height="600"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Utensils, Heart } from "lucide-vue-next";
import { useJackpotStore } from "~/stores/jackpot";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import { BUSINESS_INFO } from "~/utils/business";

const jackpotStore = useJackpotStore();

useSeoMeta({
  title: "Mary Esther Bingo | Premier Charity Bingo Hall in FL",
  description:
    "Play high-stakes bingo at Mary Esther Bingo in Florida. Volunteer-run charity hall with daily jackpots, electronic bingo, and full-service buffet. Join us today!",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: BUSINESS_INFO.name,
        image: "https://images.unsplash.com/photo-1757689216934-8c7907b44a28", // Example image
        "@id": BUSINESS_INFO.meta.url,
        url: BUSINESS_INFO.meta.url,
        telephone: BUSINESS_INFO.contact.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS_INFO.address.street,
          addressLocality: BUSINESS_INFO.address.city,
          addressRegion: BUSINESS_INFO.address.state,
          postalCode: BUSINESS_INFO.address.zip,
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 30.416569, // Approximate from map link
          longitude: -86.662126,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "10:00",
            closes: "00:30",
          },
        ],
        priceRange: "$",
      }),
    },
  ],
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

const features = [
  {
    title: "Daily Games",
    description:
      "Join us every day for Morning, Matinee, and Evening sessions. There is always a game starting soon!",
    icon: Trophy,
  },
  {
    title: "Full Service Buffet",
    description:
      "Enjoy a culinary experience while you play. Our Great Buffet offers delicious dining options for every taste.",
    icon: Utensils,
  },
  {
    title: "Charity Support",
    description:
      "Playing here helps the community. We are a volunteer-run organization supporting local charities like Brain Injury Connection and Mary Esther Fire Rescue.",
    icon: Heart,
  },
];
</script>
