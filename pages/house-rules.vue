<script setup lang="ts">
import { ShieldAlert, Terminal, Info, Zap } from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

useSeoMeta({
  title: "Operational Directives | Mary Esther Bingo",
  description: `Standard operating procedures and house rules for ${BUSINESS_INFO.value.name}.`,
});
</script>

<template>
  <div class="bg-richBlack text-white min-h-screen">
    <!-- Header -->
    <section class="relative py-32 overflow-hidden border-b border-zinc-900">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-richBlack to-richBlack z-10"></div>
        <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>
      
      <div class="container mx-auto px-4 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-8">
          <ShieldAlert class="w-4 h-4 text-primary" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Security Protocol</span>
        </div>
        
        <h1 class="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
          Operational <span class="text-primary drop-shadow-[0_0_20px_rgba(78,221,97,0.4)]">Directives</span>
        </h1>
        <p class="text-xl text-zinc-400 max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
          To maintain mission integrity, please adhere to our standardized house manifests.
        </p>
      </div>
    </section>

    <!-- Rules Content -->
    <section class="py-32 bg-charcoal">
      <div class="container mx-auto px-4 max-w-5xl">
        <!-- General Conduct -->
        <div class="mb-24 group">
          <div class="flex items-center gap-6 mb-10 transition-transform group-hover:translate-x-2 duration-500">
            <div class="w-2 h-10 bg-primary shadow-[0_0_15px_rgba(78,221,97,0.8)]"></div>
            <h2 class="text-4xl font-black text-white uppercase tracking-tighter">I. Conduct Manifest</h2>
          </div>
          
          <div class="grid gap-8">
            <div class="bg-black/40 p-10 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden transition-all duration-500 hover:border-primary/30">
              <div class="absolute inset-0 bg-primary opacity-[0.01]"></div>
              <ul class="space-y-8">
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">01</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Protocol: Mutual Respect</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       Disruptive behavior is unauthorized. Maintain high-level coordination with staff and other operators.
                     </p>
                   </div>
                </li>
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">02</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Requirement: Access Verification</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       Operators must meet age requirements for electronic asset usage. Identification required upon request.
                     </p>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Gameplay -->
        <div class="mb-24 group">
          <div class="flex items-center gap-6 mb-10 transition-transform group-hover:translate-x-2 duration-500">
            <div class="w-2 h-10 bg-primary shadow-[0_0_15px_rgba(78,221,97,0.8)]"></div>
            <h2 class="text-4xl font-black text-white uppercase tracking-tighter">II. Engagement Guidelines</h2>
          </div>
          
          <div class="grid gap-8">
            <div class="bg-black/40 p-10 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden transition-all duration-500 hover:border-primary/30">
              <ul class="space-y-8">
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">01</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Victory Affirmation</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       It is the operator's responsibility to announce "BINGO" clearly for the MIC. Late signals may not be synchronized.
                     </p>
                   </div>
                </li>
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">02</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Asset Verification</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       All valid manifests are subject to master-board synchronization. Decisions by Command are final.
                     </p>
                   </div>
                </li>
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">03</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Resource Allocation</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       In cases of simultaneous manifest validation, prize allocation will be divided equally among successful units.
                     </p>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Facility -->
        <div class="mb-24 group">
          <div class="flex items-center gap-6 mb-10 transition-transform group-hover:translate-x-2 duration-500">
            <div class="w-2 h-10 bg-primary shadow-[0_0_15px_rgba(78,221,97,0.8)]"></div>
            <h2 class="text-4xl font-black text-white uppercase tracking-tighter">III. Base Operations</h2>
          </div>
          
          <div class="grid gap-8">
            <div class="bg-black/40 p-10 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden transition-all duration-500 hover:border-primary/30">
              <ul class="space-y-8">
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">01</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Environmental Standard</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       Smoking and vaping are strictly prohibited within the mission perimeter. Use designated external zones only.
                     </p>
                   </div>
                </li>
                <li class="flex gap-6">
                   <div class="text-primary font-black text-xl">02</div>
                   <div>
                     <span class="block text-white font-black uppercase tracking-widest mb-2">Gear Accountability</span>
                     <p class="text-zinc-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                       Operators are solely responsible for personal gear and property. Keep assets within visual range at all times.
                     </p>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          class="bg-primary/5 p-12 rounded-[3rem] border border-primary/20 mt-12 text-center relative group overflow-hidden"
        >
          <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.05] transition-opacity duration-1000"></div>
          <p class="text-[10px] text-primary font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4">
            <Zap class="w-4 h-4 animate-bounce" />
            Directives are subject to update at the discretion of Command.
            <Zap class="w-4 h-4 animate-bounce" />
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
