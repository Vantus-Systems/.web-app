<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl text-primary-900 mb-4">Contact Us</h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-lg">
          Have questions? We'd love to hear from you. Reach out or visit us in person.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <!-- Contact Form -->
        <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
          <h2 class="text-2xl font-bold text-primary-900 mb-8">Send us a Message</h2>

          <form @submit.prevent="onSubmit" class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50"
                :class="{ 'border-red-500': errors.name }"
                placeholder="Jane Doe"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50"
                :class="{ 'border-red-500': errors.email }"
                placeholder="jane@example.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea
                id="message"
                v-model="message"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50"
                :class="{ 'border-red-500': errors.message }"
                placeholder="How can we help you?"
              ></textarea>
              <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
            </div>

            <BaseButton type="submit" class="w-full py-4 text-lg" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </BaseButton>

            <p v-if="successMessage" class="text-green-600 text-center font-medium mt-4">
              {{ successMessage }}
            </p>
          </form>
        </div>

        <!-- Info & Map -->
        <div class="space-y-8">
           <!-- Contact Details Card -->
           <div class="bg-primary-900 text-white p-8 md:p-10 rounded-3xl shadow-xl">
              <h2 class="text-2xl font-bold mb-6 text-gold">Contact Information</h2>
              <ul class="space-y-6">
                <li class="flex items-start gap-4">
                  <div class="bg-primary-800 p-3 rounded-lg text-gold">
                    <MapPin class="w-6 h-6" />
                  </div>
                  <div>
                    <p class="font-bold text-lg mb-1">Our Location</p>
                    <p class="text-primary-100">481 Mary Esther Blvd,<br>Mary Esther, FL 32569</p>
                  </div>
                </li>
                 <li class="flex items-start gap-4">
                  <div class="bg-primary-800 p-3 rounded-lg text-gold">
                    <Phone class="w-6 h-6" />
                  </div>
                  <div>
                    <p class="font-bold text-lg mb-1">Phone Number</p>
                    <a href="tel:8502264359" class="text-primary-100 hover:text-white transition-colors">(850) 226-4359</a>
                  </div>
                </li>
                 <li class="flex items-start gap-4">
                  <div class="bg-primary-800 p-3 rounded-lg text-gold">
                    <Clock class="w-6 h-6" />
                  </div>
                  <div>
                    <p class="font-bold text-lg mb-1">Opening Hours</p>
                    <p class="text-primary-100">Daily: 10:00 AM – 12:30 AM</p>
                  </div>
                </li>
              </ul>
           </div>

           <!-- Map Embed -->
           <div class="bg-slate-200 h-80 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3446.8524479633845!2d-86.66212568488026!3d30.416568981748365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88913f412c906667%3A0xc30070656209b552!2s481%20Mary%20Esther%20Blvd%2C%20Mary%20Esther%2C%20FL%2032569!5e0!3m2!1sen!2sus!4v1677610000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen="true"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { MapPin, Phone, Clock } from 'lucide-vue-next';
import BaseButton from '~/components/ui/BaseButton.vue';

useSeoMeta({
  title: 'Contact | Mary Esther Bingo',
  description: 'Get in touch with Mary Esther Bingo. Find our address, phone number, and hours, or send us a message directly.',
});

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  })
);

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema,
});

const [name] = defineField('name');
const [email] = defineField('email');
const [message] = defineField('message');

const isSubmitting = ref(false);
const successMessage = ref('');

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  // Simulate API call
  console.log('Form Submitted:', values);

  await new Promise(resolve => setTimeout(resolve, 1000));

  successMessage.value = 'Thank you! Your message has been sent.';
  isSubmitting.value = false;
  resetForm();

  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
});
</script>
