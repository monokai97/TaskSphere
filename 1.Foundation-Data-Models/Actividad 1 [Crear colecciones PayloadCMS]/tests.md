# Tests: Crear colecciones PayloadCMS

## Estrategia

Las colecciones PayloadCMS se prueban indirectamente mediante:
1. **TypeScript compile check** — verifica que los archivos compilan sin errores de tipo
2. **PayloadCMS admin panel** — verificación visual de que las colecciones aparecen y aceptan datos
3. **Tests de integración posteriores (Fase 6)** — ejercitarán el CRUD completo via API

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Todos los tipos PayloadCMS (CollectionConfig, hooks, access functions) son correctos

### 2. Compilación PayloadCMS

```bash
pnpm dev
```
- **Criterio:** Servidor inicia sin errores, log muestra las 7 colecciones registradas (Users, Media, Tasks, Lists, TaskLogs, GuestSessions, FocusSessions)
- **Verifica:** `payload.config.ts` importa y registra correctamente las 5 nuevas colecciones
- **Verifica:** No hay dependencias circulares (Lists antes que Tasks, GuestSessions antes que nada)

### 3. Admin Panel (manual)

- Navegar a `http://localhost:3000/admin`
- Iniciar sesión con credenciales de admin
- **Verifica:** Aparecen 5 nuevas colecciones en la navegación lateral
- **Verifica:** Tasks tiene los campos: title, description, status, important, dueDate, list, guestId, sortOrder, completedAt, subtasks
- **Verifica:** Lists tiene: name, icon, color, guestId, isDefault, sortOrder
- **Verifica:** TaskLogs tiene: task, guestId, operation, previousState, newState, timestamp
- **Verifica:** GuestSessions tiene: guestId, createdAt, lastActiveAt, expiresAt, locale, theme, notificationsEnabled, integrations, focusSettings
- **Verifica:** FocusSessions tiene: guestId, duration, completed, completedAt, date

### 4. Generación de tipos

```bash
pnpm generate:types
```
- **Criterio:** Comando exitoso
- **Verifica:** `src/payload-types.ts` contiene las interfaces Task, List, TaskLog, GuestSession, FocusSession
- **Verifica:** Cada interfaz tiene todos los campos definidos en el schema

### 5. Smoke Test (post-Fase 2, via API)

Una vez implementadas las API Routes (Fase 2-4), verificar mediante curl/insomnia:
- `POST /api/tasks` con guestId header → retorna 201 + Task JSON
- `GET /api/tasks` con guestId → retorna array de tasks del guest
- Verificar que task-logs se crean automáticamente al hacer PATCH/DELETE sobre tasks
