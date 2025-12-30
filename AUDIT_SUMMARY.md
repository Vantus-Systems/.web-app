# Audit Summary: Mary Esther Bingo Upgrade

## Executive Summary

The current application is a functional prototype but lacks the "Fortune 10000" production rigor in terms of real backend integration, deep accessibility compliance, and technical SEO. The following audit prioritizes the work required to bridge this gap.

## Issues by Category & Priority

### 1. User Experience (UX) & Trust

- **P0 (Critical):** Contact form provides false positive feedback (simulated delay) and does not actually send messages.
- **P0 (Critical):** Jackpot ticker simulates random increases, which can be legally risky if perceived as misleading. Needs to reflect a "posted" or "controlled" value.
- **P1 (Important):** Missing dedicated "Privacy Policy" and "House Rules/Terms" pages, which are essential for a "trustworthy local institution".
- **P2 (Nice to have):** Navigation feedback on active states could be clearer.

### 2. Accessibility (WCAG 2.2 AA)

- **P0:** Google Maps iframe is a potential keyboard trap and lacks a `title` attribute.
- **P0:** Mobile menu toggle is likely a `<div>` or lacks `aria-expanded`/`aria-controls` attributes (to be verified in code).
- **P1:** No "Skip to Content" link for keyboard users.
- **P1:** `NuxtImg` usage needs to ensure `alt` text is meaningful, not just present.
- **P2:** Focus visible states on custom emerald buttons need to be high-contrast.

### 3. SEO & Local Visibility

- **P0:** Missing JSON-LD Structured Data (`LocalBusiness`) to help Google Map Pack ranking.
- **P0:** Global meta tags (OpenGraph, Twitter Cards) are not configured in `nuxt.config.ts`.
- **P1:** No `sitemap.xml` or `robots.txt` strategy.
- **P1:** Page titles need optimization for local keywords (e.g., "Bingo Hall in Mary Esther, FL").

### 4. Security & Performance

- **P0:** Contact form needs server-side validation (Zod) and rate limiting to prevent abuse.
- **P1:** Image optimization: Ensure all static assets use `@nuxt/image` providers or proper sizing.
- **P1:** Client-side polling for jackpots should be replaced/minimized to save battery/data on mobile.

### 5. Maintainability

- **P1:** Business details (phone, address, hours) are hardcoded in multiple files (Footer, Contact, House Rules). Need centralization.
- **P2:** No linting or type-checking scripts in `package.json`.

---

## Action Plan

1.  **Foundations:** Centralize config & upgrade `nuxt.config.ts`.
2.  **Backend:** Implement `/api/jackpot` and `/api/contact` with security measures.
3.  **Frontend Polish:** Apply A11y fixes (skip link, iframe, menu) and connect real APIs.
4.  **Content:** Add Legal pages and SEO schemas.
5.  **Hygiene:** Add linting and docs.
