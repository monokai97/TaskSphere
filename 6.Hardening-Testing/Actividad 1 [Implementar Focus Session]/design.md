# Act 1: Focus Session — Design

## Visual Mapping: HTML → Payload CMS

| HTML Element / Section | Payload CMS Equivalent | Notes |
|------------------------|----------------------|-------|
| Timer duration selector (25/5/15 min) | `FocusSessions.duration` (number, min 1 max 120) | Only 25 min persists; break buttons visual-only for MVP |
| Play/Pause/Reset buttons | Client state (no DB) | Timer state managed in React |
| Session completion | `FocusSessions` document created | POST /api/focus creates `{ guestId, duration, completed: true, completedAt, date }` |
| SVG circular progress | Client-computed | `stroke-dashoffset` = percentage of elapsed time |
| Sessions Today count | Aggregated from `FocusSessions` | `count` where `date = today AND completed = true` |
| Total Focus Time (minutes) | Aggregated from `FocusSessions` | `sum(duration)` where `date = today AND completed = true` |
| Day Streak | Aggregated from `FocusSessions` | Distinct completed dates, count consecutive backward |
| Ambient sound grid | Client state (future: `GuestSessions.focusSettings`) | MVP: in-memory only |
| Volume slider | HTML5 Audio API | Client-side volume control |
| Active Task selector | Placeholder (no persistence) | MVP: visual only |
| Motivational quote | Static JSX | Hardcoded quotes array, random selection per render |

## Data Flow

```
FocusTimer (user clicks start)
  │
  ├─ setInterval(1000ms) → decrement elapsed → update SVG stroke-dashoffset
  │
  └─ timer reaches 0
        │
        ├─ Web Audio API → play completion chime
        ├─ setState('completed')
        └─ onComplete(duration)
              │
              └─ useCreateFocusSession().mutate({ duration: 25 })
                    │
                    └─ POST /api/focus
                          │
                          └─ payload.create({ collection: 'focus-sessions', data })
                                │
                                └─ invalidateQueries(['focus-stats', today])
                                      │
                                      └─ FocusStats re-renders with updated counts
```

## Component Tree

```
FocusPage (/focus)
  ├── Header (title + subtitle + notification + avatar)
  ├── Left Column (lg:col-span-4)
  │     ├── ActiveTaskSelector (glass card)
  │     │     ├── Label "Active Task"
  │     │     ├── Dropdown (placeholder)
  │     │     └── Tags (High Priority, Design)
  │     └── AmbientSoundPicker (glass card)
  │           ├── Label "Atmosphere" + volume icon
  │           ├── Grid 2×2: Rainfall, Cafe, White Noise, Forest
  │           └── Volume slider
  ├── Center Column (lg:col-span-5)
  │     └── FocusTimer
  │           ├── SVG ring (background + progress)
  │           ├── Timer display (mm:ss)
  │           ├── Play/Pause button (primary, circular)
  │           ├── Reset button (outlined, circular)
  │           └── Duration selector (25min/5min/15min pills)
  └── Right Column (lg:col-span-3)
        ├── FocusStats (glass card)
        │     ├── Sessions Today (number + label)
        │     ├── Total Focus Time (hours + label)
        │     └── Day Streak (fire icon + number)
        └── Quote card (bg-primary/5, lightbulb icon + italic text)
```

## FocusTimer State Machine

```
        ┌──────────────────────────────────────────┐
        │                                          │
        ▼                                          │
    ┌────────┐  select duration   ┌─────────┐      │
    │  IDLE  │ ─────────────────> │ RUNNING │      │
    └────────┘                    └─────────┘      │
        ▲                           │     │        │
        │         pause             │     │        │
        │    ┌──────────────┐       │     │        │
        │    │              ▼       │     │        │
        │    │  ┌────────┐  resume  │     │        │
        │    │  │ PAUSED │ ────>   │     │        │
        │    │  └────────┘         │     │        │
        │    │                     │     │        │
        │    └─────────────────────┘     │        │
        │                     reset      │        │
        │    ┌───────────────────────────┘        │
        │    │                timer reaches 0      │
        │    ▼                                    │
        │  ┌───────────┐                          │
        │  │ COMPLETED │ ──── onComplete() ───────┘
        │  └───────────┘
        │
        └── reset ──────┘
```

## Route Design

```
POST /api/focus
  Headers: x-guest-id (auto from middleware)
  Body: { "duration": 25 }
  → 201 { id, guestId, duration, completed: true, completedAt, date }
  → 400 { error, details }

GET /api/focus/stats?date=2026-06-21
  Headers: x-guest-id (auto from middleware)
  → 200 { sessionsToday: 8, totalMinutes: 204, dayStreak: 12 }
  → 401 { error: 'No session' }
```

## Existing Collection (already deployed)

```ts
// src/collections/FocusSessions.ts — no changes needed
slug: 'focus-sessions'
fields: guestId, duration (1-120), completed (bool), completedAt (date), date (date)
access: read/crete by guestId, update=false, delete=false
```

## Existing Zod Schema (already in plan — needs to be in src/lib/schemas.ts)

```ts
// Already defined in design.md §3.C
export const CreateFocusSessionInput = z.object({
  duration: z.number().int().min(1).max(120),
})
```

## Timer Implementation Approach

- Use `useRef` for interval ID and start timestamp (avoid re-render on each tick)
- Use `useState` for display values (minutes:seconds) — update every 1000ms
- SVG circle: `circumference = 2 * π * r` where `r` is ~48% of viewBox
- `stroke-dasharray = circumference`
- `stroke-dashoffset = circumference * (1 - elapsed / total)` — decreases as timer runs
- Use `requestAnimationFrame` for smooth animation, `setInterval` for second ticks
- Completion detection: `elapsed >= total` → stop interval, play sound, call onComplete
- Web Audio API: create `AudioContext` + `OscillatorNode` for completion chime (no external audio files needed)
