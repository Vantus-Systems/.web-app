// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  app: {
    head: {
      titleTemplate: "%s | Mary Esther Bingo",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Premier bingo hall in Mary Esther, FL. Join us for daily high-stakes games, progressive jackpots, and community fun. Volunteer-run charity support.",
        },
        { name: "theme-color", content: "#064e3b" },
        // OpenGraph
        { property: "og:site_name", content: "Mary Esther Bingo" },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "/og-image.jpg" }, // Needs to be added to public
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      htmlAttrs: {
        lang: "en",
      },
    },
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
    "@pinia/nuxt",
    "@vueuse/motion/nuxt",
    "@nuxtjs/sitemap",
  ],

  site: {
    url: "https://maryestherbingo.com",
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      Montserrat: [400, 500, 600, 700, 800],
    },
    display: "swap",
  },

  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.ts",
  },

  image: {
    dir: "assets/images",
  },
});
