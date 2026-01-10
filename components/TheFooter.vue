<script setup lang="ts">
import { MapPin, Phone, Clock, Shield } from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

const links = [
  { name: "Hub", path: "/" },
  { name: "Schedule", path: "/schedule" },
  { name: "Pricing", path: "/pricing" },
  { name: "Intelligence", path: "/about" },
  { name: "Contact", path: "/contact" },
];
</script>

<template>
  <footer class="bg-[#050505] text-white pt-32 pb-16 relative overflow-hidden border-t border-white/5">
    <!-- Subliminal Branding -->
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="container mx-auto px-4 md:px-8 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
        <!-- Sector 1: Brand -->
        <div class="lg:col-span-4 space-y-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-primary rounded shadow-[0_0_15px_rgba(78,221,97,0.4)]"></div>
            <span class="text-3xl font-black italic tracking-tighter text-white uppercase">
              MEB<span class="text-primary not-italic">.</span>
            </span>
          </div>
          <p class="text-zinc-500 text-lg leading-relaxed font-bold uppercase tracking-tight max-w-sm">
            Florida's premier high-stakes bingo destination. Real jackpots. Real community. <span class="text-zinc-200 underline decoration-primary/40 underline-offset-8">Always Bet on Green.</span>
          </p>
          <div class="flex items-center gap-2 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
            <Shield class="w-3 h-3 text-primary" />
            Authorized Personnel Only
          </div>
        </div>

        <!-- Sector 2: Uplinks -->
        <div class="lg:col-span-2">
          <h3 class="text-primary font-black mb-10 uppercase tracking-[0.3em] text-[10px]">
            Uplinks
          </h3>
          <ul class="space-y-5">
            <li v-for="link in links" :key="link.name">
              <NuxtLink
                :to="link.path"
                class="text-zinc-500 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-[0.2em] focus:outline-none flex items-center gap-3 group"
              >
                <div class="w-1 h-1 bg-zinc-800 group-hover:bg-primary rounded-full transition-colors"></div>
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Sector 3: Base Coordinates -->
        <div v-if="BUSINESS_INFO?.address" class="lg:col-span-3">
          <h3 class="text-zinc-600 font-black mb-10 uppercase tracking-[0.3em] text-[10px]">
            Base Coordinates
          </h3>
          <ul class="space-y-8 text-zinc-400 text-sm font-medium">
            <li class="flex items-start space-x-5">
              <MapPin class="w-5 h-5 text-primary shrink-0 relative top-1" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <span class="text-white font-black uppercase tracking-widest leading-none">{{ BUSINESS_INFO.address.street }}</span>
                <span class="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">{{ BUSINESS_INFO.address.city }}, {{ BUSINESS_INFO.address.state }} {{ BUSINESS_INFO.address.zip }}</span>
              </div>
            </li>
            <li v-if="BUSINESS_INFO?.contact?.phone" class="flex items-center space-x-5">
              <Phone class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <a :href="`tel:${BUSINESS_INFO?.contact?.phonePlain}`" class="text-white font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">{{ BUSINESS_INFO?.contact?.phone }}</a>
            </li>
            <li class="flex items-center space-x-5">
              <Clock class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <span class="text-white font-black uppercase tracking-widest text-xs">{{ BUSINESS_INFO.hours }}</span>
            </li>
          </ul>
        </div>

        <!-- Sector 4: Directives -->
        <div class="lg:col-span-3">
          <h3 class="text-zinc-600 font-black mb-10 uppercase tracking-[0.3em] text-[10px]">
            Directives
          </h3>
          <p class="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-10 italic">
            Standard engagement rules apply. Operator discretion is advised. 18+ to play.
          </p>
          <ul class="space-y-5">
            <li>
              <NuxtLink
                to="/house-rules"
                class="group text-zinc-500 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center justify-between"
              >
                <span>Operational Rules</span>
                <span class="text-[10px] text-zinc-800 group-hover:text-primary transition-colors">01</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/privacy"
                class="group text-zinc-500 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center justify-between"
              >
                <span>Data Protection</span>
                <span class="text-[10px] text-zinc-800 group-hover:text-primary transition-colors">02</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- System Status Bar -->
      <div class="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-6">
            <p class="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">
              &copy; {{ new Date().getFullYear() }} {{ BUSINESS_INFO?.name }} // INTERNAL USE ONLY
            </p>
        </div>
        
        <div class="flex items-center gap-6 text-zinc-700">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
            <span class="text-[9px] uppercase font-black tracking-[0.4em]">Uplink Active</span>
          </div>
          <div class="w-px h-4 bg-zinc-900 ml-2"></div>
          <span class="text-[9px] uppercase font-black tracking-[0.4em] text-zinc-800">V.4.0.0-PRO</span>
        </div>
      </div>
    </div>
  </footer>
</template>
