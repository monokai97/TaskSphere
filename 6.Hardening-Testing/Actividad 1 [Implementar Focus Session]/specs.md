# Act 1: Focus Session — Functional Specifications

## 1.1 Focus Page (`/focus`)

**File:** `src/app/(frontend)/focus/page.tsx`

### Layout
- Full-height page, no sidebar (uses `<Sidebar />` from parent layout)
- 3-column grid (`lg:grid-cols-12 gap-10`):
  - Left (4 cols): Active Task selector + AmbientSoundPicker
  - Center (5 cols): FocusTimer
  - Right (3 cols): FocusStats + motivational quote card
- Responsive: stacks to single column on mobile

### Header
- Title "Focus Session" (`display-xl`) + subtitle "Quiet your mind, sharpen your focus."
- Notification bell icon (placeholder) + user avatar (placeholder)

## 1.2 FocusTimer (`src/components/focus/FocusTimer.tsx`)

### Props
```ts
interface FocusTimerProps {
  onComplete: (duration: number) => void   // Called when timer reaches 0
}
```

### States
| State | Description | Rendering |
|-------|-------------|-----------|
| `idle` | Initial, duration selected | Timer shows full duration (e.g. "25:00"), play button visible |
| `running` | Timer counting down | Animated SVG ring, pause button visible |
| `paused` | Timer paused | Ring animation frozen, play button visible |
| `completed` | Timer reached 0 | "00:00" displayed, completion animation, Web Audio play |

### Behavior
- SVG circular ring: `r="48%"`, `stroke-dasharray="1200"`, `stroke-dashoffset` decreases as timer runs
- Animation via React state + `requestAnimationFrame` or `setInterval(1000ms)`
- Duration selector: 3 preset buttons ("25 min Focus", "5 min Break", "15 min Break") with active style (`bg-primary text-white`). Only "25 min" persists as a FocusSession; break buttons are visual-only for MVP.
- Start/Pause: circular primary button toggles between `pause` and `play_arrow` icons
- Reset: circular outlined button resets to current duration
- On completion: `onComplete(duration)` fires, Web Audio API plays a completion chime
- Tabular nums: `tabular-nums` class for consistent digit width

## 1.3 AmbientSoundPicker (`src/components/focus/AmbientSoundPicker.tsx`)

### Props
```ts
interface AmbientSoundPickerProps {
  onSoundChange?: (soundId: string | null, volume: number) => void
}
```

### Behavior
- Grid of 4 sound buttons (`grid grid-cols-2 gap-3`):
  1. **Rainfall**: icon `water_drop`
  2. **Cafe**: icon `coffee`
  3. **White Noise**: icon `waves`
  4. **Forest**: icon `forest`
- Active state: `border-2 border-primary bg-primary/5 text-primary`
- Inactive: `border border-border-subtle-light hover:border-primary/30 text-on-surface-variant`
- Volume slider: `<input type="range">` with `accent-primary`
- Audio preview: HTML5 `Audio` API — plays a short sample on click, stops when another is selected or volume is 0
- No persistence for MVP (future: save to `GuestSessions.focusSettings`)

## 1.4 FocusStats (`src/components/focus/FocusStats.tsx`)

### Props
```ts
interface FocusStatsProps {
  sessionsToday: number
  totalMinutes: number
  dayStreak: number
}
```

### Behavior
- `glass-card` container with `p-8 rounded-3xl`
- Title: "Performance" (`label-sm uppercase tracking-widest`)
- 3 stat items separated by dividers:
  1. Sessions Today: large primary number + label
  2. Total Focus Time: hours + label
  3. Day Streak: fire icon + number + label
- Below stats: quote card with lightbulb icon + italic motivational text

## 1.5 API: POST /api/focus

**File:** `src/app/(frontend)/api/focus/route.ts`

### Request
```
POST /api/focus
Content-Type: application/json
x-guest-id: <from middleware>

{ "duration": 25 }
```

### Validation (Zod)
```ts
const CreateFocusSessionInput = z.object({
  duration: z.number().int().min(1).max(120),
})
```

### Response
- 201: `{ id, guestId, duration, completed: true, completedAt, date }`
- 400: `{ error: 'Validation error', details: [...] }`
- 401: `{ error: 'No session' }`

### Logic
1. Extract `x-guest-id`
2. Validate body with Zod
3. Create FocusSession with `{ guestId, duration, completed: true, completedAt: now, date: today }`
4. Return created session

## 1.6 API: GET /api/focus/stats

**File:** `src/app/(frontend)/api/focus/stats/route.ts`

### Request
```
GET /api/focus/stats?date=2026-06-21
x-guest-id: <from middleware>
```

### Response
```json
{
  "sessionsToday": 8,
  "totalMinutes": 204,
  "dayStreak": 12
}
```

### Logic
1. Extract `x-guest-id`
2. Query FocusSessions where `guestId` matches and `date` is today
3. Calculate:
   - `sessionsToday`: count of docs where `completed === true`
   - `totalMinutes`: sum of `duration` fields
   - `dayStreak`: query consecutive days backwards (find distinct dates with ≥1 completed session, count consecutive)
4. Return stats

## 1.7 Hook: useFocusSessions (`src/hooks/useFocusSessions.ts`)

### Exports
```ts
function useFocusSessions(date?: string): {
  data: { sessionsToday: number; totalMinutes: number; dayStreak: number } | undefined
  isLoading: boolean
  error: Error | null
}

function useCreateFocusSession(): {
  mutate: (data: { duration: number }) => void
  isPending: boolean
}
```

### Behavior
- `useFocusSessions(date)`: `useQuery` with `queryKey: ['focus-stats', date]`, staleTime 30s
- `useCreateFocusSession()`: `useMutation` for POST /api/focus
  - On success: invalidates `['focus-stats', today]` query
  - No optimistic update needed (timer completion is not instant — user sees the timer reach 0 first)
