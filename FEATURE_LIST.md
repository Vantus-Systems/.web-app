# Feature List & Codebase Audit

## Executive Summary
The application is a robust **Management & Accounting System** for a bingo hall. It excels at defining the "Business Logic" (What games we play, when we play them, how much they cost) and the "Financials" (Tracking shifts, sales, cash, checks, and variance).

However, it is currently **missing the "Game Runtime"** layer. There is no interface for the actual Bingo Caller to conduct the game, call numbers, and—crucially for a fast-paced environment—verify winning cards. The system currently acts as a *Scheduler* and *Cash Register*, but not a *Game Controller*.

## 1. Existing Features Inventory

### 1.1 Public Facing Layer
Designed for players to view information.
*   **Schedule View (`/schedule`)**: Displays upcoming sessions.
*   **Pricing View (`/pricing`)**: Dynamic rendering of session tiers, machine packages, and extras based on the global configuration.
*   **Informational Pages**:
    *   **About (`/about`)**: Static content.
    *   **Contact (`/contact`)**: Form with Zod validation.
    *   **House Rules (`/house-rules`)**: Static content.
    *   **Privacy Policy (`/privacy`)**: Static content.
    *   **Programs (`/programs`)**: Likely lists the game details (needs verification if fully implemented or linked to DB).

### 1.2 Admin Portal - Core & Dashboard (`/admin`)
*   **Authentication**:
    *   Argon2 password hashing.
    *   Session-based cookie (`auth_token`).
    *   Role-Based Access Control (RBAC): `OWNER`, `MIC` (Caller), `CHARITY`.
*   **Dashboard (`/admin/index`)**:
    *   **Role Redirection**: Automatically routes `MIC` to `/admin/mic` and `CHARITY` to `/admin/charities`.
    *   **Business Info Management**:
        *   Corporate Identity (Phone, Email, Address, Maps).
        *   **W-2G Issuer Info**: Payer Name and EIN for tax forms.
        *   **Daily Door Operations**: Overrides for specific dates (Doors Open times).
    *   **Messages**: View contact form submissions.
    *   **User Management**: Link to User/Employee management.

### 1.3 Admin Portal - Operations Builder (`/admin/operations`)
The "Brain" of the system. Uses a sophisticated "Schema Draft/Publish" workflow to prevent accidental live changes.
*   **Concept**: Modifies a `Draft` schema. Must be explicitly `Published` to go live. Supports `Rollback`.
*   **Pricing & Timeline Editor**:
    *   Define Rate Cards.
    *   Define Sessions (Times, flow).
    *   **Enhanced Editor**: Supports nested tiers and conditional pricing.
*   **Pattern Editor**:
    *   **Grid Editor**: Visual 5x5 grid for defining winning patterns.
    *   **Normalization**: Automatically converts nested arrays to flat arrays (essential for verification logic).
    *   **Category Management**: Organize patterns (e.g., "Regular", "Coverall").
*   **Program Editor**:
    *   **Orchestrator**: Drag-and-drop interface to build a "Session Program".
    *   **Setlist Management**: Add "Games" and "Breaks".
    *   **Game Details**: Assign Pattern, Paper Color, Notes to each game.
*   **Schedule Editor**:
    *   Calendar view to assign Programs to Dates.

### 1.4 Admin Portal - Mic / Accounting (`/admin/mic`)
The "Shift" workflow. Currently focused on financial tracking rather than game calling.
*   **Shift Dashboard**:
    *   Date Selection.
    *   **Stats**: Daily, Weekly, Monthly financial summaries.
    *   **Holiday Banner**: Alerts staff to special events.
*   **Shift Management Wizard (`/admin/mic/shifts`)**:
    *   **Step 1: Setup**: Date, AM/PM Shift, Headcount.
    *   **Step 2: Sales**: Bingo Sales vs. Pulltab Sales inputs.
        *   **Negative Sales Logic**: Forces a "Reason Code" (e.g., Jackpot Hit) if sales are negative.
    *   **Step 3: Cash Count**: Detailed denomination counter ($100s, $50s, etc.) with auto-sum.
    *   **Step 4: Checks**: Log individual checks (Player Name, #, Amount).
        *   **Validation**: Checkboxes for "Stamped on Back" and "Phone/DL Written".
    *   **Step 5: Review**:
        *   **Variance Calculation**: (Sales - Deposit).
        *   **Enforced Notes**: If variance != 0, a note is required.

### 1.5 Admin Portal - Compliance
*   **W-2G Generator Component**:
    *   **Threshold Logic**: Auto-calculates if payout >= $1,200 per player.
    *   **Split Winners**: Handles splitting a jackpot among multiple winners.
    *   **Data Collection**: Form for Name, SSN, Address.
    *   **Signature Pad**: Touch-enabled canvas for player signature.
    *   **ID Upload**: Placeholder for ID photo upload (currently simulated).
    *   **Print**: Generates a print-friendly W-2G form.

---

## 2. Missing Features (The "Fast-Paced Bingo" Gap)
For a hall averaging 1.5 - 2 minute games, the following are **CRITICAL MISSING COMPONENTS**:

### 2.1 The "Caller Console" (Game Runner)
**Current Status**: Non-existent.
**Requirement**: A dedicated screen for the person on the microphone.
*   **Playlist View**: Load the current "Program" (created in Ops Builder) and step through games.
*   **Ball Entry**: Input balls as they are drawn (or integrate with a ball camera/blower).
*   **Pattern Display**: Show the current pattern to the caller.
*   **Timer**: A countdown or elapsed timer to keep the pace (1.5 - 2 min target).
*   **"BINGO" Button**: A big button to stop the game and initiate verification.

### 2.2 Card Verification Engine
**Current Status**: Non-existent.
**Requirement**: Instant validity check.
*   **Input**: Enter the "Card ID" (Perm number) of the potential winner.
*   **Logic**:
    *   Fetch the card face (numbers) from the database (needs a `Perms` database).
    *   Compare card numbers against the "Balls Called".
    *   Check if the matched numbers form the current "Pattern".
*   **Output**: "GOOD BINGO" (Green) or "BAD BINGO" (Red).
*   **Why**: In a 2-minute game, manual checking is too slow and error-prone.

### 2.3 Public Display / Digital Signage
**Current Status**: Non-existent (only static web pages).
**Requirement**: "TV Mode" views.
*   **Current Game Screen**: Shows the current pattern, game name, paper color, and balls called.
*   **Flashboard**: Digital representation of the 1-75 board.
*   **Next Game Preview**: "Coming up: Game 5 - Blue Paper - Double Bingo".

### 2.4 Real-Time Synchronization
**Current Status**: Polling (setInterval).
**Requirement**: WebSockets (or Server-Sent Events).
*   When the Caller advances to "Game 2", the Public Display must update **instantly**, not in 60 seconds.

---

## 3. Usability & UX Review

### 3.1 Strengths
*   **Shift Workflow**: The step-by-step wizard for closing shifts is excellent. It enforces financial integrity (variance notes, check validation) well.
*   **Ops Builder**: Centralizing complex configuration (Pricing/Schedule) into a single "Schema" draft system is a robust architectural choice for data safety.
*   **Design**: Clean, high-contrast UI (Emerald/Gold/White) fits the "Luxury" theme.

### 3.2 Weaknesses / Friction Points
*   **Navigation**:
    *   The "Mic" user is dumped into a dashboard heavily focused on *history/stats*. A working caller needs a "Start Session" button front and center.
*   **W-2G Workflow**:
    *   It's a separate component. It should likely be integrated into the "Caller Console" flow (e.g., "Verify Bingo" -> "Winner Found" -> "Payout > $1200?" -> "Trigger W-2G Modal").
*   **Mobile/Tablet**:
    *   The "Program Editor" (drag and drop) might be fiddly on touch screens (tablets used by managers).
*   **Speed**:
    *   Navigating between "Admin" tabs feels like full page loads. Transition to a tighter SPA feel for the "Game Runner" is needed.

---

## 4. Codebase & Technical Audit

### 4.1 "Wrong" / Bugs
*   **Root Clutter**: Files like `check-tables.js`, `test-admin-pass.js`, `verify_homepage.py` in the root directory should be moved to `scripts/` or `tests/`.
*   **Simulated Features**: The W-2G ID scanner says "(Simulated extraction)". This gives a false sense of functionality. It should be labeled "Manual Entry Only" until OCR is integrated.
*   **Polling**: `setInterval` used in `admin/index.vue` for "System Sync" is rudimentary.
*   **Hardcoded Timezone**: `useScheduleClock` hardcodes 'America/Chicago'. This should be a config value.

### 4.2 Database
*   **Prisma Version**: Pinned to 5.22.0 due to SQLite limitations/issues. This is fine, but needs monitoring.
*   **UUIDs**: SQLite doesn't natively support UUIDs, so the app creates them in software. `createMany` is avoided for this reason.

### 4.3 Recommendations for "Busy Hall" Optimization
1.  **Build the `GameRunner` View**:
    *   A streamlined, full-screen interface.
    *   Big buttons, high contrast.
    *   Keyboard shortcuts (Space to call ball, Enter to verify).
2.  **Implement `Perms` Database**:
    *   Import the manufacturer's card data (1-9000+ faces).
    *   This enables the verification feature.
3.  **Refactor W-2G**:
    *   Make it a modal that can be summoned from the Game Runner.
4.  **Service Worker**:
    *   Cache the "Program" and "Patterns" locally so the game can continue even if internet flickers.

---
**Summary**: The application is a solid **Business Management** tool but is currently unusable as a **Game Operations** tool. To support a 2-minute game pace, the development focus must shift entirely to the **Caller Console** and **Verification System**.
