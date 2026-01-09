# Public UI Upgrade Notes

## Completed Features
- **Programs UI**: Replaced modal-based table with route-based `[slug]` page and mobile-first `ProgramViewer` (Cards on mobile, Table on desktop).
- **Today-First**: Implemented `TodayStrip` component across key pages.
- **Schedule**: Added ICS export, View Switcher, and "Next Up" card.
- **Pricing**: Added "Build Your Session" calculator and enhanced API response with specials.
- **About**: Dynamic charity loading from API.

## Deferred / Out of Scope
- **Time Travel in TodayStrip**: The `TodayStrip` component currently uses the system clock (or reactive `useScheduleClock` if wired) but might not fully sync with the deep debug "Time Travel" mode in `schedule.vue` unless `useScheduleClock` is lifted to a global provider or layout. Currently `TodayStrip` imports `useScheduleClock` so it should work if the state is shared pinia/global, but strictly it shares the composable logic.
- **Complex Pricing Logic**: The "Build Your Session" calculator uses simplified logic. Fully dynamic pricing calculation based on complex rules (e.g. bundle discounts, tiered paper) would require a more robust pricing engine on the frontend or a dedicated calculation endpoint.
- **Image Assets**: Used Unsplash placeholders. Production assets should be replaced in `public/images/`.

## API Changes
- `/api/schedule`: Now returns `{ sessions: Session[], meta: { ... } }` instead of `Session[]`.
- `/api/pricing`: Response includes `todaySpecials`, `weekSpecialsByDay`, and `meta` with publishing info.
- New endpoints: `/api/calendar/ics`, `/api/charities`.
