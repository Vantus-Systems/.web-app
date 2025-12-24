# Mary Esther Bingo

Official website for Mary Esther Bingo, a premier entertainment venue in Florida. This project is built with **Nuxt 3**, **Tailwind CSS**, and **Pinia** to deliver a "Fortune 10000" quality digital experience.

## Features

- **High-End Design:** Custom Emerald & Gold theme using Tailwind CSS.
- **Performance:** Optimized images (`@nuxt/image`) and fonts (`@nuxtjs/google-fonts`).
- **State Management:** Pinia for managing global state (e.g., Progressive Jackpot ticker).
- **SEO & Accessibility:** Full Schema.org integration, semantic HTML, and ARIA compliance.
- **Forms:** Contact form validation using Zod with server-side rate limiting and spam protection.
- **Data:** Centralized business configuration for easy updates (`utils/business.ts`).
- **Authentication:** Admin portal with session-based authentication and secure password hashing.
- **Real-time Updates:** Jackpot ticker refreshes every 5 minutes.

## Tech Stack

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide Vue](https://lucide.dev/)
- **Animation:** [VueUse Motion](https://motion.vueuse.org/)
- **Validation:** [Zod](https://zod.dev/) for server-side validation
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Server Runtime:** [H3](https://h3.unjs.io/)

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
- `pages/`: Application routes (Home, Schedule, Pricing, About, Contact, House Rules, Privacy, Admin).
- `stores/`: Pinia stores (Jackpot logic).
- `utils/`: Business constants (`business.ts`) and utility functions (`cn.ts`).
- `server/`: Backend API and data persistence.
  - `server/api/`: H3 API endpoints (public and admin).
  - `server/data/`: JSON file-based data storage (users, sessions, messages, etc.).
  - `server/utils/`: Auth, sessions, storage, and user management utilities.
- `verification/`: Playwright-based E2E verification scripts.

## Admin Portal

The application includes an admin portal at `/admin/login` with the following default credentials:
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change the default admin password immediately in production.

### Admin Features
- User management (create/update users with roles: admin/mic)
- Business information updates
- Jackpot value management
- Message inbox

## API Endpoints

### Public Endpoints
- `GET /api/business` - Business configuration
- `GET /api/jackpot` - Current jackpot value
- `GET /api/schedule` - Schedule data
- `GET /api/pricing` - Pricing information
- `POST /api/contact` - Contact form submission (with rate limiting)

### Admin Endpoints (Require authentication)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create/update user
- `DELETE /api/admin/users` - Delete user
- `POST /api/admin/business` - Update business info
- `POST /api/admin/jackpot` - Update jackpot value
- `POST /api/admin/schedule` - Update schedule
- `POST /api/admin/pricing` - Update pricing
- `GET /api/admin/messages` - List contact messages

## Authentication & Security

- **Sessions:** Token-based sessions stored in `server/data/sessions.json`
- **Cookies:** `auth_token` (httpOnly) and `auth_flag` (client-visible)
- **Password Hashing:** PBKDF2 with 100,000 iterations, SHA-512
- **Rate Limiting:** Login attempts and contact form submissions are rate-limited
- **Spam Protection:** Honeypot field in contact form

## Data Persistence

The application uses JSON files for data storage:
- `server/data/users.json` - User accounts
- `server/data/sessions.json` - Active sessions
- `server/data/messages.json` - Contact form submissions
- `server/data/business.json` - Business configuration
- `server/data/jackpot.json` - Jackpot value
- `server/data/schedule.json` - Schedule data
- `server/data/pricing.json` - Pricing data

## Verification & Testing

The project includes Playwright-based verification scripts:

```bash
# Verify homepage routes
python3 verify_homepage.py

# Verify admin functionality
python3 verification/verify_admin.py

# Verify new features
python3 verification/verify_new_features.py
```

These scripts require a running dev server and will capture screenshots in the project root.

## Deployment

This application can be deployed to any Node.js-compatible hosting service (Vercel, Netlify, DigitalOcean, etc.).

```bash
npm run build
node .output/server/index.mjs
```

For production:
1. Set `NODE_ENV=production`
2. Change default admin password
3. Ensure `server/data/` directory is writable
4. Configure proper environment variables if needed

## Development Workflow

1. **Before committing:**
   ```bash
   npm run lint:fix
   npm run typecheck
   ```

2. **Testing changes:**
   - Run dev server: `npm run dev`
   - Run verification scripts to ensure functionality
   - Check browser console for errors

3. **Adding new features:**
   - Use Zod for validation in API endpoints
   - Use `requireAuth()` for protected routes
   - Use `readJson`/`writeJson` from `server/utils/storage.ts` for data operations
   - Update verification scripts if needed

## License

Copyright © 2024 Mary Esther Bingo. All rights reserved.
