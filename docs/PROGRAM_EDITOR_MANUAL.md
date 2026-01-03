# Program Editor Manual

## Overview

The Program Editor is a comprehensive tool for managing bingo programs, games, and their associated configurations (pricing, payout, timeline). It has been enhanced with advanced inspection controls, intuitive UI functions, and robust validation.

## Features

### 1. Game Inspection & Simulation
The editor now includes a powerful **Preview** tab for simulating game patterns and analyzing performance.

*   **Playback Controls**:
    *   **Play/Pause**: Toggle pattern animation playback.
    *   **Frame-by-Frame**: Navigate through pattern frames manually using Previous/Next buttons.
    *   **Speed Control**: Adjust playback speed from 100ms to 2000ms.
    *   **Live Updates**: Playback automatically restarts when speed is changed.

*   **Visual Simulation**:
    *   Displays the selected pattern on a bingo grid.
    *   Shows the current frame number and total frames.
    *   Reflects the game's configured paper color.

*   **Performance Metrics**:
    *   **Est. Duration**: Based on the game's timeline configuration.
    *   **Payout Density**: Calculated as `Payout Amount / Duration` ($/min).
    *   **Active Cells**: Real-time count of active cells in the current frame.
    *   **Saturation**: Percentage of the board covered (Active Cells / 25).

*   **Variable Inspector**:
    *   A collapsible "Debug & State Inspector" panel.
    *   Shows live state: Playing status, current frame, speed, pattern slug.
    *   Displays the raw JSON data model of the selected game for deep inspection.

### 2. Intuitive UI Functions

*   **Resizable Panels**:
    *   The Library (left) and Inspector (right) panels can be resized by dragging their borders.
    *   Min/Max width constraints prevent layout breakage.

*   **Context Menus**:
    *   Right-click on any game in the setlist to open a context menu.
    *   **Duplicate**: Creates a copy of the game with "(Copy)" appended to the title.
    *   **Delete**: Removes the game from the setlist.
    *   Clicking outside or pressing `Esc` closes the menu.

*   **Keyboard Shortcuts**:
    *   `Ctrl+S`: Save the current program.
    *   `Ctrl+N`: Add a new game.
    *   `Esc`: Close context menus.

*   **Drag-and-Drop Reordering**:
    *   Games can be reordered by dragging them within the setlist.
    *   Sort order is automatically updated.

### 3. Data Management & Validation

*   **Unsaved Changes Protection**:
    *   The editor tracks "dirty" state (unsaved changes).
    *   A confirmation modal appears if you try to navigate away or switch programs with unsaved changes.
    *   Visual indicator (*) next to the program name when changes are pending.

*   **Robust Saving**:
    *   The Save button shows a loading spinner during API operations.
    *   Server-side validation ensures:
        *   All games have valid pattern slugs.
        *   Required fields (title, sort order) are present.
    *   Error messages are displayed if validation fails.

*   **Break Support**:
    *   "Add Break" button quickly adds an intermission segment.
    *   Breaks are visually distinct (dashed border) in the setlist.
    *   Defaults to "Included" pricing and 15-minute duration.

## API Integration

The editor communicates with the following endpoints:

*   `GET /api/admin/programs`: Fetches the list of programs.
*   `POST /api/admin/programs`: Creates or updates a program.
    *   **Payload**: Full program object including array of games.
    *   **Validation**: Zod schema ensures data integrity.
    *   **Transaction**: Updates are atomic; existing games are replaced to ensure sync.

## Technical Details

*   **Component**: `components/admin/ProgramEditor.vue`
*   **State Management**: Uses local reactive state for form data, synced with `opsStore` on save.
*   **Dependencies**:
    *   `@vueuse/core`: For keyboard shortcuts (`useMagicKeys`) and click-outside detection.
    *   `lucide-vue-next`: For UI icons.
    *   `BingoPatternGrid`: For rendering pattern previews.
