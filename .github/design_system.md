# **Aurora Design System**  
### _Design System for the Mary Esther Bingo Scheduling Platform_

This document defines the visual language, interaction patterns, and component standards for all surfaces of the Mary Esther Bingo Admin Platform. It is based on Apple’s Human Interface Guidelines and adapted for a modern, enterprise‑grade web application.

---

# **1. Design Principles**

### **1.1 Clarity**
Interfaces must communicate information quickly and cleanly. Labels must be explicit. Icons must reinforce meaning, not replace it.

### **1.2 Hierarchy**
Every screen must have a clear primary action, a clear primary object, and a clear reading order.

### **1.3 Consistency**
Spacing, typography, colors, and component behaviors must remain uniform across all pages, modules, and features.

### **1.4 Deference**
UI chrome should be quiet. Content (rate cards, timelines, profiles, schedules) should visually dominate.

### **1.5 Depth**
Use subtle shadows, layering, and motion to convey relationships and transitions.

---

# **2. Visual Foundations**

## **2.1 Color System**

### **Base Palette**
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `bg-base` | #F5F5F7 | #0B0C0F | App background |
| `surface` | #FFFFFF | #1C1C1E | Cards, panels |
| `divider` | #D2D2D7 | #2C2C2E | Borders, separators |
| `text-primary` | #111111 | rgba(255,255,255,0.87) | Main text |
| `text-secondary` | #6E6E73 | rgba(255,255,255,0.60) | Secondary text |
| `text-tertiary` | #A1A1A6 | rgba(255,255,255,0.40) | Placeholder text |

### **Accent Palette**
| Token | Color | Usage |
|--------|--------|--------|
| `accent-primary` | #0A84FF | Primary actions, selection |
| `accent-success` | #32D74B | Confirmations, good states |
| `accent-warning` | #FFD60A | Caution states |
| `accent-error` | #FF453A | Errors |
| `accent-info` | #64D2FF | Informational highlights |

### **Shadows**
- **Low elevation:** `0 4px 12px rgba(0,0,0,0.12)`
- **High elevation:** `0 18px 40px rgba(0,0,0,0.30)`

Shadows must be subtle and never overpower content.

---

# **3. Typography**

### **Font Stack**
```
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### **Type Scale**
| Style | Size | Weight | Usage |
|--------|-------|----------|--------|
| Display | 28px | Regular/Semibold | Page titles |
| Section Title | 22px | Semibold | Major sections |
| Card Title | 17px | Semibold | Cards, inspectors |
| Body | 15–17px | Regular | General text |
| Caption | 13px | Regular | Metadata, labels |

### **Rules**
- Max **3 text sizes** per screen.
- Use **weight** (regular vs semibold) more than size to show importance.
- Line height:
  - Headings: 1.2–1.3  
  - Body: 1.4–1.6

---

# **4. Spacing & Layout**

### **Base Unit**
- **4px** spacing grid.

### **Common Values**
- 4, 8, 12, 16, 20, 24, 32 px.

### **Section Spacing**
- Between major sections: **32–40 px**
- Between related elements: **8–12 px**

### **Card Layout**
- Padding: **16–20 px**
- Radius: **10–14 px**
- Shadow: low elevation

### **Grid**
- Use an **8px grid** for layout.
- Use a **4px grid** for fine alignment.

---

# **5. Motion & Interaction**

### **Timing**
- Micro-interactions: **80–120 ms**
- Standard transitions: **150–220 ms**
- Overlays/modals: **200–280 ms**

### **Easing**
- Enter: `cubic-bezier(0.25, 0.8, 0.25, 1)`
- Exit: `cubic-bezier(0.4, 0.0, 1, 1)`

### **Motion Rules**
- Motion must explain state changes.
- Motion must never slow the user down.
- Avoid large-scale animations unless meaningful.

---

# **6. Components**

## **6.1 Buttons**

### **Primary Button**
- Background: `accent-primary`
- Text: white
- Radius: 8–12 px
- Height: 32–40 px (desktop), 44 px (touch)
- Only one primary action per logical group.

### **Secondary Button**
- Border: 1px `divider`
- Background: transparent
- Text: `text-primary`

### **Tertiary Button**
- Text-only
- Accent color
- Underline on hover

### **States**
- Default  
- Hover  
- Pressed  
- Disabled (40–50% opacity, no hover)

---

## **6.2 Navigation**

### **Top Bar**
- Height: 56–64 px
- Contains:
  - App name
  - Global navigation
  - Account/avatar
- Sticky on scroll

### **Sidebar**
- Width: 240–280 px
- Icons + labels
- Collapsible mode supported

### **Breadcrumbs**
- Required for >2 levels of hierarchy

---

## **6.3 Cards & Panels**

### **Card**
- Surface background
- 16–20 px padding
- Title + content + optional footer
- Used for grouping related content

### **Inspector Panel**
- Anchored right
- Width: 320–420 px
- Scrolls independently
- Reflects selected item in real time

---

## **6.4 Forms & Inputs**

### **Text Fields**
- Persistent labels (never placeholder-only)
- Min height: 32–36 px desktop, 44 px touch
- Error state:
  - Red border
  - Clear helper text

### **Dropdowns**
- Chevron indicator
- Keyboard navigable

### **Toggles**
- For binary states only
- Label describes the controlled feature

---

## **6.5 Tables & Lists**

### **Tables**
- Quiet row dividers
- Hover highlight
- Left-align text, right-align numbers
- Optional zebra striping for dense data

### **List Items**
- Optional icon
- Primary label
- Secondary label/meta
- Chevron or action button if navigable

---

# **7. Interaction Patterns**

### **Hover**
- Subtle background tint or elevation

### **Focus**
- 2px accent outline

### **Selection**
- Background tint + left accent bar or checkmark

### **Modals**
- Use only for:
  - Destructive actions
  - Critical confirmations
- Dimmed backdrop
- Clear primary/secondary actions

### **Popovers**
- For contextual actions
- Should not contain destructive actions without confirmation

---

# **8. Error, Empty, and Loading States**

### **Error State**
- Clear message
- Specific cause
- Retry action when applicable

### **Empty State**
- Icon
- Title
- Short description
- Primary action (optional)

### **Loading State**
- Skeletons preferred over spinners

---

# **9. Accessibility**

### **Contrast**
- WCAG AA minimum:
  - 4.5:1 for normal text
  - 3:1 for large text

### **Keyboard**
- Full keyboard operability
- Logical focus order

### **Hit Targets**
- Touch: 44×44 px
- Pointer: 32×32 px

### **Labels**
- Every interactive element must have an accessible name

### **Reduced Motion**
- Provide reduced-motion variants for transitions

---

# **10. Engineering Rules for Coding Agents**

1. **Use only defined tokens** for colors, spacing, typography, and motion.  
2. **Do not introduce new colors or spacing values** without extending the system.  
3. **Use existing components** before creating new ones.  
4. **All new components must include**:
   - Purpose  
   - Props/inputs  
   - States (idle, loading, empty, error)  
   - Accessibility notes  
5. **All data-driven views must define**:
   - Empty state  
   - Loading state  
   - Error state  
6. **Naming conventions**:
   - Components: `PascalCase`
   - Tokens: `camelCase` or `kebab-case`
   - Files: one component per file

---
