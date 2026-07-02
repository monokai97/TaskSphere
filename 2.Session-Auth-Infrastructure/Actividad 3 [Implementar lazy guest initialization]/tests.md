# Tests: Implementar lazy guest initialization

## Estrategia

Tests de integración que verifican el comportamiento de inicialización lazy contra una instancia real de PayloadCMS (vía API Routes — requiere Actividad 5 para exponer endpoint).

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** `@payload-config` path alias resuelve, tipos de PayloadCMS son correctos

### 2. Integración manual (via GET /api/session)

Requiere Actividad 5 completada. Ejecutar:

```bash
# Primer request — debe inicializar todo
curl -v http://localhost:3000/api/session 2>&1
```

- **Verifica:** Response 200 con `{ guestId, createdAt, locale, theme }`
- **Verifica:** `guestId` no es null/undefined

```bash
# Segundo request — debe retornar early sin duplicar
curl -v http://localhost:3000/api/session
```

- **Verifica:** Mismo `guestId` que el primer request
- **Verifica:** No hay errores 500

### 3. Idempotencia test (vía API interna)

```bash
# Llamar 3 veces seguidas
for ($i=0; $i -lt 3; $i++) { curl -s http://localhost:3000/api/session | ConvertFrom-Json | Select-Object guestId }
```

- **Criterio:** Mismo `guestId` en las 3 llamadas
- **Verifica:** No se crean GuestSessions duplicadas

### 4. Verificación en Admin Panel

- [ ] Navegar a `http://localhost:3000/admin/collections/guest-sessions`
- [ ] Debe haber EXACTAMENTE 1 documento por guest que haya visitado
- [ ] Navegar a `http://localhost:3000/admin/collections/lists`
- [ ] Debe haber EXACTAMENTE 4 listas por guest (las default)
- [ ] My Day debe tener checkbox `isDefault` marcado

### 5. Guest isolation test

- [ ] Abrir en ventana normal → se crea GuestSession + 4 lists
- [ ] Abrir en ventana incógnito → se crea OTRA GuestSession + otras 4 lists
- [ ] Verificar en admin que hay 2 GuestSessions y 8 lists total

### 6. Graceful degradation test

Simular DB no disponible (pausar servidor SQLite o desconectar):
- [ ] Llamar a GET /api/session
- [ ] No debe crashear — debe retornar respuesta (aunque sea parcial)
- [ ] Log del servidor debe mostrar `[ensureGuestInitialized]` warning
