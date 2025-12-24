<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl text-primary-900 mb-4">Contact Us</h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-lg">
          Have questions? We'd love to hear from you. Reach out or visit us in
          person.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <!-- Contact Form -->
        <div
          class="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100"
        >
          <h2 class="text-2xl font-bold text-primary-900 mb-8">
            Send us a Message
          </h2>

          <form class="space-y-6" @submit.prevent="onSubmit">
            <!-- Honeypot (Hidden) -->
            <input
              v-model="honeypot"
              type="text"
              class="hidden"
              autocomplete="off"
              tabindex="-1"
            />

            <div>
              <label
                for="name"
                class="block text-sm font-medium text-slate-700 mb-1"
                >Full Name</label
              >
              <input
                id="name"
                v-model="name"
                name="name"
                type="text"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50"
                :class="{ 'border-red-500': errors.name }"
                placeholder="Jane Doe"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-medium text-slate-700 mb-1"
                >Email Address</label
              >
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50"
                :class="{ 'border-red-500': errors.email }"
                placeholder="jane@example.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </p>
            </div>

            <div>
              <label
                for="message"
                class="block text-sm font-medium text-slate-700 mb-1"
                >Message</label
              >
              <textarea
                id="message"
                v-model="message"
                name="message"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50"
                :class="{ 'border-red-500': errors.message }"
                placeholder="How can we help you?"
              ></textarea>
              <p v-if="errors.message" class="mt-1 text-sm text-red-600">
                {{ errors.message }}
              </p>
            </div>

            <div class="text-xs text-slate-500 bg-slate-100 p-4 rounded-lg">
              <p>
                <strong>Privacy Notice:</strong> By submitting this form, you
                agree to allow Mary Esther Bingo to contact you regarding your
                inquiry. We do not sell your data to third parties. See our
                <NuxtLink to="/privacy" class="underline text-primary-700"
                  >Privacy Policy</NuxtLink
                >.
              </p>
            </div>

            <BaseButton
              type="submit"
              class="w-full py-4 text-lg"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Sending..." : "Send Message" }}
            </BaseButton>

            <p
              v-if="successMessage"
              class="text-green-600 text-center font-medium mt-4 p-4 bg-green-50 rounded-xl border border-green-200"
            >
              {{ successMessage }}
            </p>
            <p
              v-if="errorMessage"
              class="text-red-600 text-center font-medium mt-4 p-4 bg-red-50 rounded-xl border border-red-200"
            >
              {{ errorMessage }}
            </p>
          </form>
        </div>

        <!-- Info & Map -->
        <div class="space-y-8">
          <!-- Contact Details Card -->
          <div
            class="bg-primary-900 text-white p-8 md:p-10 rounded-3xl shadow-xl"
          >
            <h2 class="text-2xl font-bold mb-6 text-gold">
              Contact Information
            </h2>
            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <div class="bg-primary-800 p-3 rounded-lg text-gold">
                  <MapPin class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-bold text-lg mb-1">Our Location</p>
                  <p class="text-primary-100">
                    {{ BUSINESS_INFO.address.street }}<br />{{
                      BUSINESS_INFO.address.city
                    }}, {{ BUSINESS_INFO.address.state }}
                    {{ BUSINESS_INFO.address.zip }}
                  </p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <div class="bg-primary-800 p-3 rounded-lg text-gold">
                  <Phone class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-bold text-lg mb-1">Phone Number</p>
                  <a
                    :href="`tel:${BUSINESS_INFO.contact.phonePlain}`"
                    class="text-primary-100 hover:text-white transition-colors"
                    >{{ BUSINESS_INFO.contact.phone }}</a
                  >
                </div>
              </li>
              <li class="flex items-start gap-4">
                <div class="bg-primary-800 p-3 rounded-lg text-gold">
                  <Clock class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-bold text-lg mb-1">Opening Hours</p>
                  <p class="text-primary-100">{{ BUSINESS_INFO.hours }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Map Embed -->
          <div
            class="bg-slate-200 h-80 rounded-3xl overflow-hidden shadow-lg border-4 border-white"
          >
            <iframe
              :src="BUSINESS_INFO.address.mapLink"
              width="100%"
              height="100%"
              style="border: 0"
              allowfullscreen="true"
              loading="lazy"
              title="Google Map showing Mary Esther Bingo Location"
              referrerpolicy="no-referrer-when-downgrade"
            >
            </iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { MapPin, Phone, Clock } from "lucide-vue-next";
import BaseButton from "~/components/ui/BaseButton.vue";
import { BUSINESS_INFO } from "~/utils/business";

useSeoMeta({
  title: "Contact",
  description:
    "Get in touch with Mary Esther Bingo. Find our address, phone number, and hours, or send us a message directly.",
});

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  }),
);

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema,
});

const [name] = defineField("name");
const [email] = defineField("email");
const [message] = defineField("message");
const honeypot = ref("");

const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const response = await $fetch("/api/contact", {
      method: "POST",
      body: {
        ...values,
        website: honeypot.value,
      },
    });

    successMessage.value = response.message || "Message sent successfully!";
    resetForm();
  } catch (error: any) {
    console.error("Submission error", error);
    errorMessage.value =
      error.statusMessage || "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
});
</script>
