# Tests: Generar tipos TypeScript

## Estrategia

Actividad puramente de generación de tipos — verificaciones de compilación e inspección de archivos.

## Test Suite

### 1. Ejecución del generador

```bash
pnpm generate:types
```
- **Criterio:** Código de salida 0
- **Verifica:** PayloadCMS carga el config, inspecciona todas las colecciones, y escribe payload-types.ts sin errores

### 2. Integridad de interfaces (verificación manual)

Revisar en `src/payload-types.ts` que cada interfaz contenga:

| Interfaz | Campos obligatorios |
|---|---|
| `Task` | id, title, status, list, guestId, createdAt, updatedAt |
| `List` | id, name, guestId, createdAt, updatedAt |
| `TaskLog` | id, task, guestId, operation, timestamp |
| `GuestSession` | id, guestId, createdAt, lastActiveAt, expiresAt |
| `FocusSession` | id, guestId, duration, date |

### 3. Type-check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** No hay discrepancias entre los schemas de colección y los tipos generados

### 4. Import test (archivo temporal)

Crear archivo temporal `src/_typecheck.ts`:
```typescript
import type { Task, List, TaskLog, GuestSession, FocusSession } from './payload-types'

const task: Task = {} as Task
const list: List = {} as List
const log: TaskLog = {} as TaskLog
const session: GuestSession = {} as GuestSession
const focus: FocusSession = {} as FocusSession
```
- Ejecutar `npx tsc --noEmit` — debe pasar
- Eliminar `src/_typecheck.ts` después

### 5. Lint

```bash
pnpm lint
```
- **Criterio:** Sin errores (warnings de reglas TS permitidos según configuración)
