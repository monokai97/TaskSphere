# Tests: Registrar colecciones en payload.config.ts

## Estrategia

Actividad puramente configurativa — los tests son mayormente verificaciones de compilación e inicialización del servidor.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Los imports resuelven correctamente, los tipos CollectionConfig son compatibles con buildConfig

### 2. Inicialización del servidor

```bash
pnpm dev
```
- **Criterio:** Servidor inicia sin warnings ni errores
- **Verifica:**
  - PayloadCMS no lanza `CollectionValidationError`
  - No hay errores de dependencia circular entre colecciones
  - El array collections tiene 7 elementos

### 3. Admin Panel (manual)

| Paso | Resultado esperado |
|---|---|
| Navegar a `http://localhost:3000/admin` | Login page se renderiza |
| Iniciar sesión | Dashboard con 7 colecciones en sidebar |
| Click en "Tasks" | Lista vacía de tasks (sin errores) |
| Click en "Lists" | Lista vacía de lists (sin errores) |
| Click en "Task Logs" | Lista vacía de task-logs (sin errores) |
| Click en "Guest Sessions" | Lista vacía de guest-sessions (sin errores) |
| Click en "Focus Sessions" | Lista vacía de focus-sessions (sin errores) |
| Click en "Create new" en Tasks | Formulario con todos los campos del schema |

### 4. API REST Interna (curl)

```bash
curl http://localhost:3000/api/tasks -H "x-guest-id: test-123"
```
- **Criterio:** Retorna `{ docs: [], totalDocs: 0, ... }` (no 404)
- Repetir para: `lists`, `task-logs`, `guest-sessions`, `focus-sessions`

### 5. Generación de tipos (post-verificación)

```bash
pnpm generate:types
```
- **Criterio:** Comando exitoso, `src/payload-types.ts` se regenera incluyendo las 5 nuevas interfaces
