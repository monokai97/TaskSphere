---
name: Ethereal Focus
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed01b'
  on-secondary-container: '#6f5900'
  tertiary: '#4e5566'
  on-tertiary: '#ffffff'
  tertiary-container: '#666d7f'
  on-tertiary-container: '#ecf0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffe083'
  secondary-fixed-dim: '#eec200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#dce2f7'
  tertiary-fixed-dim: '#c0c6db'
  on-tertiary-fixed: '#141b2b'
  on-tertiary-fixed-variant: '#404758'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  canvas-dark: '#09090B'
  surface-dark: '#18181B'
  surface-elevated-dark: '#27272A'
  border-subtle-light: '#F3F4F6'
  border-subtle-dark: rgba(39, 39, 42, 0.5)
  text-secondary-light: '#6B7280'
  text-secondary-dark: '#A1A1AA'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  task-item:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 288px
  detail-panel-width: 384px
  gutter-md: 1rem
  container-padding: 3rem
  container-padding-mobile: 1rem
  stack-gap: 0.25rem
---

## Brand & Style

The brand personality is disciplined, calm, and hyper-functional. It is designed for high-performance individuals who require a mental "clearing" to manage their daily tasks. The aesthetic is rooted in **Minimalism** with subtle **Glassmorphic** accents, prioritizing content over container. 

The visual language borrows from the "Aero" and "Fluent" philosophies—using light, air, and translucent materials to reduce the cognitive load of a complex to-do list. The emotional response should be one of "digital zen": a sense of order, cleanliness, and immediate clarity.

**Design Principles:**
- **Negative Space as Luxury:** Generous margins are not empty; they are functional breathing room for the user's thoughts.
- **Material Logic:** Surfaces use varying levels of opacity and blur to suggest depth without relying on heavy shadows.
- **Intentional Friction:** Interaction states (hover/active) are soft and gradual, reflecting a steady, non-intrusive workflow.

## Colors

The palette is engineered for extreme focus. The **Primary Blue** is used sparingly for essential actions and navigation states, acting as a "north star" for the eye. 

### Light Mode
The background uses an ultra-light gray (`#F9FAFB`) to reduce the harshness of pure white while maintaining a high-key environment. Surfaces (cards/inputs) transition to pure `#FFFFFF` to create a subtle lift.

### Dark Mode
Utilizing a deep **Zinc** scale, the dark mode avoids pure black to maintain readability and reduce eye strain. The depth is created by moving from the canvas (`#09090B`) to primary surfaces (`#18181B`).

### Functional Accents
- **Star Yellow:** Reserved exclusively for "Important" task states.
- **Subtle Borders:** Used to define structure without adding visual noise, particularly in the sidebar and detail panels.

## Typography

This design system utilizes a dual-font approach to balance technical precision with extreme readability.

- **Geist** is used for headlines, navigation labels, and UI elements. Its geometric, monospaced-influenced structure provides a modern, "tool-like" feel.
- **Inter** is used for task descriptions and body text. Its high x-height ensures clarity even at smaller sizes or when styles like `line-through` are applied to completed tasks.

**Hierarchical Rules:**
- **Main Header:** Use `display-xl` with blue primary color for the list titles (e.g., "My Day").
- **Task Text:** Use `task-item`. When a task is completed, reduce opacity to 50% and apply a strikethrough.
- **Metadata:** All auxiliary info (dates, counts) uses `label-sm` in the secondary text color.

## Layout & Spacing

The layout follows a **3-Column Fixed-Fluid-Fixed** model.

1.  **Navigation (Sidebar):** Fixed at 288px. Utilizes a translucent glass background to maintain a sense of context.
2.  **Workspace (Main):** Fluid width. Uses massive internal padding (`3rem` or `p-12`) to frame the list as a centered document rather than an edge-to-edge spreadsheet.
3.  **Detail Panel:** Fixed at 384px. Overlays or pushes content from the right depending on screen real estate.

**Responsive Reflow:**
- **Desktop:** Full 3-column visibility.
- **Tablet:** Sidebar collapses into a hamburger menu; Detail panel becomes a sliding sheet.
- **Mobile:** Workspace goes edge-to-edge with reduced padding (`1rem`). Task items take full width.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Material Translucency** rather than traditional heavy shadows.

- **The Foundation:** The base canvas is the lowest layer (Gray-50).
- **The Glass Layer:** The Sidebar and Detail Panel use `backdrop-blur-md` with an 80% opacity fill. This creates a "frosted" effect that suggests these elements sit above the main workspace.
- **Soft Lift:** Task items use a very tight `shadow-sm`. When a task is hovered, it doesn't just change color; it gains a subtle border to indicate focus.
- **Interactive Depth:** The "Add Task" box and the Detail Panel use `shadow-xl` or `shadow-2xl` to clearly distinguish them as active, floating utilities above the static list.

## Shapes

The design uses a **Rounded** (8px to 24px) language to soften the utilitarian nature of a productivity app.

- **Task Items:** 8px (`rounded-lg`) corner radius. This strikes a balance between a professional grid and a friendly interface.
- **Input Bars & Large Containers:** 12px (`rounded-xl`) or higher. The "Add Task" bar uses a more pronounced curve to feel distinct from the tasks it creates.
- **Interactive Circles:** Checkboxes and category icons are strictly circular (full-pill) to provide a clear target for interaction and a "complete" feel when checked.

## Components

### Todo Items (The Core)
- **Normal:** White surface, subtle border on hover.
- **Completed:** 50% opacity for both text and icons.
- **Checkbox:** 20px circular ring. On hover, it tints blue. When checked, it fills with Blue-600 and displays a white checkmark.

### Add Task Box
- A "sticky" component anchored to the bottom. It should transition from a single line to a multi-line tool with a metadata toolbar (calendar, reminders) upon focus.

### Navigation Links
- High-contrast selection state: A Blue-600 vertical bar on the far left or a subtle background tint (`bg-gray-100`).

### Detail Panel Items
- Sections within the detail panel (Sub-steps, Notes) should be separated by the `Border Subtle` token.

### Skeletons
- Use `animate-pulse` with `bg-gray-200` (light) or `bg-zinc-800` (dark). Match the exact height and radius of a `TodoItem` to prevent layout shift during data fetching.