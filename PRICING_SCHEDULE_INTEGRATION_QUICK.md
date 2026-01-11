# Pricing Page Schedule Integration — Quick Guide

## What's New

The pricing page now **automatically shows schedule-based context**:

```
┌─────────────────────────────────────┐
│  Friday • Evening                   │  ← Current day + session type
│  Current Program: High-Roller Night │  ← Active program from schedule
└─────────────────────────────────────┘
```

---

## Features

✅ **Real-Time Day/Time Display**
- Shows current day name (Monday, Tuesday, etc.)
- Updates with session type:
  - 🌅 Morning (midnight-noon)
  - 🌤️ Afternoon (noon-5pm)
  - 🌆 Evening (5pm-9pm) ← Primary pricing period
  - 🌙 Late Night (9pm-midnight)

✅ **Schedule Integration**
- Fetches active schedule from database
- Matches current time to schedule slots
- Displays the program running right now

✅ **Dynamic Pricing Source**
- Reads from active `PricingVersion` in database
- Falls back to legacy settings if needed
- Always shows up-to-date pricing

---

## Technical Details

### New Endpoint: `/api/pricing/context`

Returns schedule context for the current moment:

```json
{
  "dayOfWeek": 5,
  "dayName": "Friday",
  "sessionType": "Evening",
  "currentSessionProgram": "high-roller-night",
  "pricingContext": {
    "isDaytime": false,
    "isEvening": true
  }
}
```

### Updated Endpoint: `/api/pricing`

Now sources pricing from:
1. Active `PricingVersion` (if exists)
2. Legacy settings (fallback)
3. Default structure (if all else fails)

---

## Database Models

### Schedule Setup (existing)
```prisma
model scheduleVersion {
  status: "ACTIVE"          // Must be ACTIVE
  slots: [                  // Day/time slots
    {
      day_of_week: 5,       // 0=Sun, 5=Fri, 6=Sat
      start_time: "18:00",  // HH:MM format
      program_slug: "high-roller-night"
    }
  ]
}
```

### Pricing Setup (existing)
```prisma
model pricingVersion {
  status: "ACTIVE"          // Must be ACTIVE
  content: {                // JSON pricing data
    "machines": [...],
    "paper": [...],
    "extras": [...]
  }
}
```

---

## How It Works

**When user visits `/pricing`:**

1. **Page loads** → Fetches two endpoints in parallel
2. **GET /api/pricing** → Gets pricing packages (machines, paper, extras)
3. **GET /api/pricing/context** → Gets schedule context
4. **Hero renders** with day, time, session type, and program info
5. **Pricing shows** current rates for the time period

**If no active schedule:**
- Schedule info section is hidden
- Pricing still displays normally

**If no active pricing version:**
- Falls back to legacy `settings.pricing`
- Shows default pricing structure

---

## Admin Setup

To enable this feature:

1. **Create active ScheduleVersion** (if not exists)
   - Go to Admin → Schedule Management
   - Create schedule slots with day/time/program
   - Publish as ACTIVE

2. **Create active PricingVersion** (if not exists)
   - Go to Admin → Pricing Management
   - Set up pricing by category
   - Publish as ACTIVE

3. **Pricing page automatically shows** the rest

---

## Colors by Session Type

| Session | Badge Color | Usage |
|---------|-------------|-------|
| Morning | 🟨 Yellow | Daytime (better rates possible) |
| Afternoon | 🟧 Orange | Mid-day sessions |
| Evening | 🟢 Green (Primary) | Prime time (featured pricing) |
| Late Night | 🟣 Purple | Late sessions |

---

## Testing

**Check DevTools Network tab for:**

1. `/api/pricing` response:
   ```json
   {
     "machines": [{...}, {...}],
     "paper": [{...}],
     "extras": [{...}]
   }
   ```

2. `/api/pricing/context` response:
   ```json
   {
     "dayOfWeek": 5,
     "dayName": "Friday",
     "sessionType": "Evening",
     "currentSessionProgram": "high-roller-night"
   }
   ```

---

## Common Questions

**Q: What if there's no active schedule?**  
A: The "Current Program" line won't display, but pricing still shows.

**Q: What if pricing isn't showing?**  
A: Check that `pricingVersion` has status "ACTIVE", or legacy settings exist.

**Q: How is timezone handled?**  
A: All times are Chicago timezone (America/Chicago). Server time is the source of truth.

**Q: Does it update automatically?**  
A: Yes! The page will show different session types as the real time changes throughout the day.

**Q: Can I customize pricing by session type?**  
A: Yes! The `pricingContext` object tells you the current session type. The pricing API can use this to return different prices.

---

## Code Locations

- **Endpoint**: `server/api/pricing/context.get.ts` (NEW)
- **Pricing API**: `server/api/pricing.get.ts` (UPDATED)
- **Frontend**: `pages/pricing.vue` (UPDATED)
- **No migrations needed**: Using existing Prisma models

---

## Performance

- Both endpoints make minimal database queries
- Context endpoint: 2 queries (schedule + pricing)
- Pricing endpoint: 1-2 queries (pricing version + fallback)
- No performance impact vs. previous version

---

## Deployment

✅ Ready for production  
✅ No schema migrations needed  
✅ Backward compatible with legacy pricing  
✅ Graceful fallback if schedule unavailable  

Just deploy and ensure:
1. Active `scheduleVersion` exists (or hidden info is fine)
2. Active `pricingVersion` exists (or uses legacy settings)

---

That's it! The pricing page is now schedule-aware. 🎯
