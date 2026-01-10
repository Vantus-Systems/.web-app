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
          DEFAULT: "#39AD48", // Brand Green
          dark: "rgba(255,255,255,0.87)", // Dark mode text
          // Brand Green Palette (#39AD48)
          50: "#f1f9f2",
          100: "#dcf1de",
          200: "#bbe2c0",
          300: "#8ecb97",
          400: "#5cb068",
          500: "#39AD48",
          600: "#2b8b38",
          700: "#246e2e",
          800: "#1f5827",
          900: "#1b4922",
          950: "#0e2812",
        },
        // Legacy colors
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        gold: {
          DEFAULT: "#FFD700",
          50: "#FFFAE5",
          100: "#FFF5CC",
          200: "#FFEB99",
          300: "#FFE066",
          400: "#FFD633",
          500: "#FFCC00",
          600: "#CCA300",
          700: "#997A00",
          800: "#665200",
          900: "#332900",
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
