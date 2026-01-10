<script setup lang="ts">
import { ShieldCheck, Info } from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

useSeoMeta({
  title: "Data Protection | Mary Esther Bingo",
  description:
    "Data protection Guide for Mary Esther Bingo. Secure handling of operator information.",
  robots: "noindex, follow",
});
</script>

<template>
  <div class="bg-richBlack text-white min-h-screen py-32 relative overflow-hidden">
    <!-- Kinetic Background Particles -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
        <div class="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
    </div>

    <div class="container mx-auto px-4 max-w-4xl relative z-10">
      <div class="text-center mb-24">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-8">
          <ShieldCheck class="w-4 h-4 text-primary" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Data Integrity</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
          Privacy <span class="text-primary drop-shadow-[0_0_20px_rgba(78,221,97,0.4)]">Guide</span>
        </h1>
        <p class="text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
          Standardized procedures for handling sensitive player information.
        </p>
      </div>

      <div
        class="bg-charcoal p-10 md:p-14 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-2 border-zinc-900 group relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-primary opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-1000"></div>
        
        <div class="space-y-16 relative z-10">
          <section>
            <h2 class="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-4">
               <span class="text-primary">01</span> Information Intake
            </h2>
            <div class="text-zinc-400 font-bold text-sm leading-relaxed uppercase tracking-wider space-y-6">
              <p>
                At Mary Esther Bingo, we respect player confidentiality. The only information we collect is what you voluntarily provide via secure intake forms.
              </p>
              <p>
                We do not deploy cookies for behavioral tracking across external networks. Basic analytics may be utilized for traffic coordination.
              </p>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-4">
               <span class="text-primary">02</span> Tactical Usage
            </h2>
            <div class="text-zinc-400 font-bold text-sm leading-relaxed uppercase tracking-wider">
              <p class="mb-6">Information is utilized solely for:</p>
              <ul class="space-y-4">
                <li class="flex items-center gap-4">
                  <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Responding to authorized inquiries.
                </li>
                <li class="flex items-center gap-4">
                  <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Coordinating schedule, jackpot, or charity lists.
                </li>
                <li class="flex items-center gap-4">
                  <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Optimizing facility deployment based on operator feedback.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-4">
               <span class="text-primary">03</span> Data Defense
            </h2>
            <div class="text-zinc-400 font-bold text-sm leading-relaxed uppercase tracking-wider">
              <div class="p-6 bg-primary/10 border border-primary/30 rounded-2xl text-primary font-black mb-8">
                COMMAND DIRECTIVE: Operator identification is never sold, traded, or rented to external units.
              </div>
              <p>
                We implement hardened storage and processing protocols to protect against unauthorized access, alteration, or disclosure of mission-sensitive data.
              </p>
            </div>
          </section>

          <section class="pt-12 border-t border-zinc-800">
            <h2 class="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
               <Info class="w-6 h-6 text-primary" />
               Contact Command
            </h2>
            <address class="not-italic bg-black/40 p-10 rounded-3xl border border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <strong class="text-white uppercase tracking-widest block mb-2">{{ BUSINESS_INFO.name || "Mary Esther Bingo" }}</strong>
                <span v-if="BUSINESS_INFO.address" class="text-zinc-500 font-bold uppercase tracking-widest text-xs block mb-1">
                  {{ BUSINESS_INFO.address.street }}, {{ BUSINESS_INFO.address.city }}, {{ BUSINESS_INFO.address.state }}
                </span>
                <span class="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">Base Coordinates</span>
              </div>
              <a
                v-if="BUSINESS_INFO.contact?.phonePlain"
                :href="`tel:${BUSINESS_INFO.contact.phonePlain}`"
                class="px-8 py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all shadow-lg"
              >
                {{ BUSINESS_INFO.contact.phone ?? "Call Command" }}
              </a>
            </address>
          </section>
        </div>
      </div>
      
      <div class="mt-12 text-center">
        <NuxtLink to="/" class="text-[10px] font-black text-zinc-600 hover:text-primary transition-colors uppercase tracking-[0.4em]">
          Return to Hub
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
