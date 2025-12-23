// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/motion/nuxt',
  ],
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      Montserrat: [400, 500, 600, 700, 800],
    },
    display: 'swap',
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },
  image: {
    dir: 'assets/images',
  },
})
