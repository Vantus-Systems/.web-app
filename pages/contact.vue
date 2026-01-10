<script setup lang="ts">
import { ref } from "vue";
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";
import BaseButton from "~/components/ui/BaseButton.vue";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

const name = ref("");
const email = ref("");
const message = ref("");
const honeypot = ref("");
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const errors = ref({ name: "", email: "", message: "" });

const onSubmit = async () => {
  if (honeypot.value) return; // Silent discard
  
  errors.value = { name: "", email: "", message: "" };
  let hasError = false;
  
  if (!name.value) { errors.value.name = "Callsign required"; hasError = true; }
  if (!email.value) { errors.value.email = "Comm link required"; hasError = true; }
  if (!message.value) { errors.value.message = "Intel required"; hasError = true; }
  
  if (hasError) return;

  isSubmitting.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    // Simulated contact API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    successMessage.value = "Message received. Our volunteers will contact you shortly.";
    name.value = "";
    email.value = "";
    message.value = "";
  } catch (err) {
    errorMessage.value = "Message final delivery failed. Please try again later.";
  } finally {
    isSubmitting.value = false;
  }
};

useSeoMeta({
  title: "Comm Link | Mary Esther Bingo",
  description: `Secure channel for contacting ${BUSINESS_INFO.value.name}. Report intel or request support.`,
});
</script>

<template>
  <div class="bg-richBlack text-white min-h-screen py-32 relative overflow-hidden">
    <!-- Kinetic Background Particles (Pseudo) -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
        <div class="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-primary/20 blur-[150px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="text-center mb-24">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-8">
          <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Contact Us</span>
        </div>
        
        <h1 class="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
          Get In <span class="text-primary drop-shadow-[0_0_20px_rgba(78,221,97,0.4)]">Touch</span>
        </h1>
        <p class="text-zinc-500 max-w-2xl mx-auto text-xl font-bold uppercase tracking-widest leading-relaxed">
          Questions or feedback? Reach out below.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-7xl mx-auto items-start">
        <!-- Contact Form -->
        <div
          class="bg-charcoal p-10 md:p-14 rounded-[3rem] border-2 border-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative group overflow-hidden"
        >
          <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <h2 class="text-3xl font-black text-white mb-10 uppercase tracking-tighter flex items-center gap-4">
             <Send class="w-8 h-8 text-primary" />
             Send Message
          </h2>

          <form class="space-y-8 relative z-10" @submit.prevent="onSubmit">
            <input v-model="honeypot" type="text" class="hidden" autocomplete="off" tabindex="-1" />

            <div class="space-y-2">
              <label for="name" class="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4">Name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                class="w-full px-8 py-5 rounded-2xl bg-black border border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white font-bold outline-none"
                :class="{ 'border-red-500': errors.name }"
                placeholder="YOUR NAME"
              />
              <p v-if="errors.name" class="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-4">
                {{ errors.name }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="w-full px-8 py-5 rounded-2xl bg-black border border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white font-bold outline-none"
                :class="{ 'border-red-500': errors.email }"
                placeholder="YOUR EMAIL"
              />
              <p v-if="errors.email" class="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-4">
                {{ errors.email }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="message" class="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4">Message</label>
              <textarea
                id="message"
                v-model="message"
                rows="5"
                class="w-full px-8 py-5 rounded-2xl bg-black border border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white font-bold outline-none resize-none"
                :class="{ 'border-red-500': errors.message }"
                placeholder="HOW CAN WE HELP?"
              ></textarea>
              <p v-if="errors.message" class="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-4">
                {{ errors.message }}
              </p>
            </div>

            <div class="bg-black/50 p-6 rounded-2xl border border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex gap-4 items-start">
              <AlertCircle class="w-4 h-4 text-primary shrink-0" />
              <p>
                By sending this message, you agree to our terms of service and privacy policy.
              </p>
            </div>

            <button
              type="submit"
              class="w-full py-6 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.4em] text-[12px] hover:bg-white transition-all shadow-[0_20px_40px_rgba(78,221,97,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
              :disabled="isSubmitting"
            >
              <Send v-if="!isSubmitting" class="w-5 h-5" />
              <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              {{ isSubmitting ? "SENDING..." : "SEND MESSAGE" }}
            </button>

            <div
              v-if="successMessage"
              class="flex items-center gap-4 p-6 bg-primary/10 border border-primary/40 rounded-2xl text-primary font-black uppercase text-[10px] tracking-widest animate-bounce"
            >
              <CheckCircle2 class="w-6 h-6" />
              {{ successMessage }}
            </div>
            
            <div
              v-if="errorMessage"
              class="flex items-center gap-4 p-6 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-500 font-black uppercase text-[10px] tracking-widest"
            >
              <AlertCircle class="w-6 h-6" />
              {{ errorMessage }}
            </div>
          </form>
        </div>

        <!-- Info & Sidebar -->
        <div v-if="BUSINESS_INFO.address" class="space-y-12">
          <div class="bg-charcoal border-2 border-primary/20 p-12 rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)] relative overflow-hidden group">
            <div class="absolute inset-0 bg-primary opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"></div>
            
            <h2 class="text-3xl font-black mb-10 uppercase tracking-tighter text-white">
              Location <span class="text-primary">& Info</span>
            </h2>
            
            <ul class="space-y-10 relative z-10">
              <li class="flex items-start gap-6 group/item">
                <div class="bg-primary/10 p-4 rounded-2xl text-primary group-hover/item:bg-primary group-hover/item:text-black transition-all">
                  <MapPin class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-black text-white text-lg uppercase tracking-widest mb-2">Address</p>
                  <p class="text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                    {{ BUSINESS_INFO.address.street }}<br />
                    {{ BUSINESS_INFO.address.city }}, {{ BUSINESS_INFO.address.state }} {{ BUSINESS_INFO.address.zip }}
                  </p>
                </div>
              </li>
              
              <li class="flex items-start gap-6 group/item" v-if="BUSINESS_INFO.contact?.phone">
                <div class="bg-primary/10 p-4 rounded-2xl text-primary group-hover/item:bg-primary group-hover/item:text-black transition-all">
                  <Phone class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-black text-white text-lg uppercase tracking-widest mb-2">Phone</p>
                  <a :href="`tel:${BUSINESS_INFO.contact.phonePlain}`" class="text-zinc-400 hover:text-primary transition-colors font-bold text-xl uppercase tracking-tighter">
                    {{ BUSINESS_INFO.contact.phone }}
                  </a>
                </div>
              </li>
              
              <li class="flex items-start gap-6 group/item" v-if="BUSINESS_INFO.contact?.email">
                <div class="bg-primary/10 p-4 rounded-2xl text-primary group-hover/item:bg-primary group-hover/item:text-black transition-all">
                  <Mail class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-black text-white text-lg uppercase tracking-widest mb-2">Email</p>
                  <a :href="`mailto:${BUSINESS_INFO.contact.email}`" class="text-zinc-400 hover:text-primary transition-colors font-bold text-xl uppercase tracking-tighter break-all">
                    {{ BUSINESS_INFO.contact.email }}
                  </a>
                </div>
              </li>
            </ul>
          </div>
          
          <div class="bg-black/40 border border-zinc-800 p-12 rounded-[2.5rem] relative overflow-hidden group">
             <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <h3 class="text-xl font-black text-white uppercase tracking-tighter mb-4">Support Info</h3>
             <p class="text-zinc-500 font-bold uppercase tracking-widest text-sm leading-relaxed mb-8">
                For immediate assistance during live sessions, please reach out via phone.
             </p>
             <div class="flex items-center gap-4 text-primary font-black uppercase text-[10px] tracking-[0.2em] bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div class="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                Live Support Range: 4:00 PM - 10:00 PM
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
