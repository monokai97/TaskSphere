# Act 1: Focus Session — Implementation Tasks

## Task 1.0: Ensure FocusSessions collection is registered

**File:** `src/payload.config.ts`

- [ ] Verify `FocusSessions` is already imported and included in `collections: [...]`
- [ ] If not, import and add it
- [ ] Verify `FocusSessions.ts` collection has correct slug (`focus-sessions`), access control, and fields

## Task 1.1: API Route — POST /api/focus (create session)

**File:** `src/app/(frontend)/api/focus/route.ts`

- [ ] Create file with `export async function POST(req: NextRequest)`
- [ ] Extract `x-guest-id` header → return 401 if missing
- [ ] Parse body JSON
- [ ] Validate with `CreateFocusSessionInput` Zod schema → return 400 if invalid
- [ ] Import `config` from `@payload-config`
- [ ] `await getPayload({ config })`
- [ ] `payload.create({ collection: 'focus-sessions', data: { guestId, duration, completed: true, completedAt: new Date().toISOString(), date: today } })`
- [ ] Return 201 with created session

## Task 1.2: API Route — GET /api/focus/stats (aggregated stats)

**File:** `src/app/(frontend)/api/focus/stats/route.ts`

- [ ] Create `src/app/(frontend)/api/focus/stats/route.ts` with `export async function GET(req: NextRequest)`
- [ ] Extract `x-guest-id` → 401 if missing
- [ ] Get date from `searchParams` or default to today's ISO date string
- [ ] Query: `payload.find({ collection: 'focus-sessions', where: { guestId: { equals }, date: { equals: date } }, limit: 100 })`
- [ ] Calculate `sessionsToday`: `docs.filter(d => d.completed).length`
- [ ] Calculate `totalMinutes`: `docs.reduce((sum, d) => sum + (d.completed ? d.duration : 0), 0)`
- [ ] Calculate `dayStreak`:
  - [ ] Query distinct dates with completed sessions (limit: 30)
  - [ ] Sort descending
  - [ ] Count consecutive days backwards from today
- [ ] Return `{ sessionsToday, totalMinutes, dayStreak }`

## Task 1.3: Hook — useFocusSessions

**File:** `src/hooks/useFocusSessions.ts`

- [ ] Add `'use client'` directive
- [ ] Import from `@tanstack/react-query`
- [ ] Implement `useFocusSessions(date?: string)`:
  ```ts
  export function useFocusSessions(date?: string) {
    return useQuery({
      queryKey: ['focus-stats', date],
      queryFn: async () => {
        const params = new URLSearchParams()
        if (date) params.set('date', date)
        const res = await fetch(`/api/focus/stats?${params}`)
        if (!res.ok) throw new Error('Failed to fetch focus stats')
        return res.json()
      },
      staleTime: 30_000,
    })
  }
  ```
- [ ] Implement `useCreateFocusSession()`:
  ```ts
  export function useCreateFocusSession() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (data: { duration: number }) => {
        const res = await fetch('/api/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to create focus session')
        return res.json()
      },
      onSuccess: () => {
        const today = new Date().toISOString().split('T')[0]
        queryClient.invalidateQueries({ queryKey: ['focus-stats', today] })
      },
    })
  }
  ```
- [ ] Export both functions

## Task 1.4: Component — FocusTimer

**File:** `src/components/focus/FocusTimer.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props: `onComplete: (duration: number) => void`
- [ ] State: `timerState: 'idle' | 'running' | 'paused' | 'completed'`
- [ ] State: `selectedDuration: 5 | 15 | 25` (default 25)
- [ ] State: `elapsedSeconds: number` (default 0)
- [ ] Refs: `intervalRef`, `startTimestampRef`
- [ ] Derived: `totalSeconds = selectedDuration * 60`, `remainingSeconds = totalSeconds - elapsedSeconds`, `progress = elapsedSeconds / totalSeconds`
- [ ] SVG circle:
  ```tsx
  const radius = 48 // % of viewBox
  const circumference = 2 * Math.PI * radius // ~301.6
  const dashoffset = circumference * (1 - progress)
  ```
- [ ] Render: SVG viewBox `0 0 100 100`, two circles (background + progress)
- [ ] Timer display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
- [ ] Start/Pause button: primary circular, toggles between `pause` / `play_arrow` Material Symbols
- [ ] Reset button: outlined circular, Material Symbol `replay`
- [ ] Duration selector: 3 pill buttons in a row
  - "25 min Focus" (active by default)
  - "5 min Break" (visual only)
  - "15 min Break" (visual only)
- [ ] Timer logic:
  - `start()`: `setInterval` every 1000ms, increment `elapsedSeconds`
  - `pause()`: clear interval, save current elapsed
  - `reset()`: clear interval, set elapsed to 0, set state to 'idle'
  - Completion: when `elapsedSeconds >= totalSeconds`, clear interval, set state 'completed', call `onComplete(selectedDuration)`, play chime
- [ ] Completion sound via Web Audio API:
  ```ts
  function playCompletionSound() {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    osc.start()
    osc.stop(ctx.currentTime + 1)
  }
  ```
- [ ] Cleanup: clear interval on unmount
- [ ] Label "Focus Mode" above timer text

## Task 1.5: Component — FocusStats

**File:** `src/components/focus/FocusStats.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props: `sessionsToday, totalMinutes, dayStreak`
- [ ] Render glass card: `backdrop-blur-md bg-white/80 rounded-3xl p-8 border border-white shadow-sm`
- [ ] Decorative circle background: `absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl`
- [ ] Render 3 stat items:
  1. Sessions: `sessionsToday` in `font-display-xl text-primary` + label "Sessions Today"
  2. Total Focus Time: `${(totalMinutes / 60).toFixed(1)}<span class="text-headline-md">h</span>` + label
  3. Day Streak: fire icon + `dayStreak` + label
- [ ] Separators: `h-px bg-border-subtle-light mx-4`
- [ ] Quote card below: `bg-primary/5 p-6 rounded-3xl border border-primary/10` with lightbulb icon + italic quote
- [ ] Quotes array (hardcoded, at least 5), random selection

## Task 1.6: Component — AmbientSoundPicker

**File:** `src/components/focus/AmbientSoundPicker.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props: `onSoundChange?: (soundId: string | null, volume: number) => void`
- [ ] State: `activeSound: string | null`, `volume: number` (default 50)
- [ ] Audio ref: `useRef<HTMLAudioElement | null>(null)`
- [ ] Define sounds array:
  ```ts
  const SOUNDS = [
    { id: 'rainfall', icon: 'water_drop', label: 'Rainfall' },
    { id: 'cafe', icon: 'coffee', label: 'Cafe' },
    { id: 'whitenoise', icon: 'waves', label: 'White Noise' },
    { id: 'forest', icon: 'forest', label: 'Forest' },
  ]
  ```
- [ ] Grid 2×2 of sound buttons
- [ ] Click handler: if same sound → stop (set null), else → play (set activeSound)
- [ ] Volume slider: `<input type="range" min="0" max="100">` updates `AudioElement.volume`
- [ ] Header: "Atmosphere" label + volume icon
- [ ] Due to no actual audio files for MVP, buttons show visual active state but audio playback is a placeholder (`console.log('Play:', soundId)` + future implementation with actual audio URLs)

## Task 1.7: Page — Focus Page

**File:** `src/app/(frontend)/focus/page.tsx`

- [ ] Add `'use client'` directive
- [ ] Import `useFocusSessions`, `useCreateFocusSession` from `@/hooks/useFocusSessions`
- [ ] Import `FocusTimer` from `@/components/focus/FocusTimer`
- [ ] Import `FocusStats` from `@/components/focus/FocusStats`
- [ ] Import `AmbientSoundPicker` from `@/components/focus/AmbientSoundPicker`
- [ ] Today's date: `new Date().toISOString().split('T')[0]`
- [ ] `const { data: stats, isLoading } = useFocusSessions(today)`
- [ ] `const { mutate: createSession } = useCreateFocusSession()`
- [ ] `handleComplete = (duration) => createSession({ duration })`
- [ ] Render:
  - Header row with title + subtitle + notification + avatar (placeholder)
  - 3-column grid with ActiveTaskSelector (placeholder card), AmbientSoundPicker, FocusTimer, FocusStats
- [ ] Loading state for stats: show `animate-pulse` skeleton in place of numbers
- [ ] Error state for stats: show "Unable to load stats" text (non-blocking — timer works without stats)

## Task 1.8: Sidebar — Add Focus link

**File:** `src/components/layout/Sidebar.tsx`

- [ ] Add navigation item for `/focus` with `timer` Material Symbol icon
- [ ] Place after Planned or Tasks in the nav list

## Task 1.9: Lint & Build

- [ ] Run `pnpm lint` — 0 errors
- [ ] Run `pnpm build` — 0 errors
- [ ] Navigate to `/focus`, verify timer renders and counts down
- [ ] Verify POST /api/focus creates session (check with curl or admin panel)
- [ ] Verify GET /api/focus/stats returns correct counts after creating multiple sessions

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 1.0 Verify collection | 1 | 5 min |
| 1.1 POST /api/focus | 1 new | 20 min |
| 1.2 GET /api/focus/stats | 1 new | 25 min |
| 1.3 Hook | 1 new | 20 min |
| 1.4 FocusTimer | 1 new | 60 min |
| 1.5 FocusStats | 1 new | 25 min |
| 1.6 AmbientSoundPicker | 1 new | 30 min |
| 1.7 Focus page | 1 new | 30 min |
| 1.8 Sidebar update | 1 modified | 10 min |
| 1.9 Lint & Build | — | 10 min |
| **Total** | **~8 files** | **~4 hours** |
