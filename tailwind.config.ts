import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Aurora Design System Tokens
        base: {
          DEFAULT: "#F5F5F7", // Light mode base
          dark: "#0B0C0F", // Dark mode base
        },
        surface: {
          DEFAULT: "#FFFFFF", // Light mode surface
          dark: "#1C1C1E", // Dark mode surface
        },
        divider: {
          DEFAULT: "#D2D2D7", // Light mode divider
          dark: "#2C2C2E", // Dark mode divider
        },
        primary: {
          DEFAULT: "#111111", // Light mode text
          dark: "rgba(255,255,255,0.87)", // Dark mode text
        },
        secondary: {
          DEFAULT: "#6E6E73", // Light mode secondary text
          dark: "rgba(255,255,255,0.60)", // Dark mode secondary text
        },
        tertiary: {
          DEFAULT: "#A1A1A6", // Light mode tertiary text
          dark: "rgba(255,255,255,0.40)", // Dark mode tertiary text
        },
        accent: {
          primary: "#0A84FF", // Blue
          success: "#32D74B", // Green
          warning: "#FFD60A", // Yellow
          error: "#FF453A", // Red
          info: "#64D2FF", // Light Blue
        },
        // Keep existing colors for backward compatibility if needed, but map them to new system where possible
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        heading: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
