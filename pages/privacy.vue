<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-4xl font-bold text-primary-900 mb-8 text-center">
        Privacy Policy
      </h1>

      <div
        class="bg-white p-8 md:p-12 rounded-3xl shadow-xl space-y-8 text-slate-700"
      >
        <section>
          <h2 class="text-2xl font-bold text-primary-800 mb-4">
            1. Information We Collect
          </h2>
          <p class="mb-4">
            At Mary Esther Bingo, we respect your privacy. The only personal
            information we collect is what you voluntarily provide via our
            contact forms, such as your name, email address, and message
            content.
          </p>
          <p>
            We do not use cookies for tracking personal behavior across other
            sites, though we may use basic analytics to understand site traffic.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-primary-800 mb-4">
            2. How We Use Your Information
          </h2>
          <p>We use the information you provide solely to:</p>
          <ul class="list-disc pl-6 mt-2 space-y-2">
            <li>Respond to your inquiries and questions.</li>
            <li>
              Provide information about our schedule, jackpots, or charity
              events if requested.
            </li>
            <li>Improve our services and facility based on your feedback.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-primary-800 mb-4">
            3. Data Sharing & Security
          </h2>
          <p class="mb-4">
            <strong
              >We do not sell, trade, or rent your personal identification
              information to others.</strong
            >
          </p>
          <p>
            We implement appropriate data collection, storage, and processing
            practices and security measures to protect against unauthorized
            access, alteration, disclosure, or destruction of your personal
            information.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-primary-800 mb-4">
            4. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <address class="mt-4 not-italic">
            <strong>{{ BUSINESS_INFO.name || "Mary Esther Bingo" }}</strong>
            <br />
            <span v-if="BUSINESS_INFO.address">
              {{ BUSINESS_INFO.address.full }}<br />
            </span>
            <a
              v-if="BUSINESS_INFO.contact?.phonePlain"
              :href="`tel:${BUSINESS_INFO.contact.phonePlain}`"
              class="text-primary-700 hover:underline"
            >
              {{ BUSINESS_INFO.contact.phone ?? "Call us" }}
            </a>
            <span v-else class="text-slate-500">Call us for details.</span>
          </address>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

useSeoMeta({
  title: "Privacy Policy",
  description:
    "Privacy Policy for Mary Esther Bingo. We respect your data and do not sell information to third parties.",
  robots: "noindex, follow", // Legal pages often don't need to be indexed as primary content
});
</script>
