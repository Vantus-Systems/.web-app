# Mary Esther Bingo

Official website for Mary Esther Bingo, a premier entertainment venue in Florida. This project is built with **Nuxt 3**, **Tailwind CSS**, and **Pinia** to deliver a "Fortune 10000" quality digital experience.

## Features

- **High-End Design:** Custom Emerald & Gold theme using Tailwind CSS.
- **Performance:** Optimized images (`@nuxt/image`) and fonts (`@nuxtjs/google-fonts`).
- **State Management:** Pinia for managing global state (e.g., Progressive Jackpot ticker).
- **SEO & Accessibility:** Full Schema.org integration, semantic HTML, and ARIA compliance.
- **Forms:** Contact form validation using VeeValidate and Zod.
- **Data:** Centralized business configuration for easy updates.

## Tech Stack

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide Vue](https://lucide.dev/)
- **Animation:** [VueUse Motion](https://motion.vueuse.org/)
- **Validation:** [Zod](https://zod.dev/) & [VeeValidate](https://vee-validate.logaretm.com/)

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Development Server:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

3. **Linting & Type Checking:**
   ```bash
   npm run lint
   npm run typecheck
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## Project Structure

- `assets/`: Global styles and images.
- `components/`: Reusable Vue components (UI kit).
- `layouts/`: Page layouts (Navigation, Footer).
- `pages/`: Application routes (Home, Schedule, Pricing, etc.).
- `stores/`: Pinia stores (Jackpot logic).
- `utils/`: Constants and helper functions (`constants.ts`).

## Deployment

This application can be deployed to any node-compatible hosting service (Vercel, Netlify, DigitalOcean, etc.).

```bash
npm run build
node .output/server/index.mjs
```

## License

Copyright © 2024 Mary Esther Bingo. All rights reserved.
