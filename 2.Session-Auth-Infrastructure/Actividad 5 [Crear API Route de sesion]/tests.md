# Tests: Crear API Route de sesión

## Estrategia

Tests de integración via HTTP (curl) contra el servidor en desarrollo. Verifica el flujo completo de sesión: GET inicializa lazy, DELETE purga todo, y la cookie se destruye.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores

### 2. GET básico

```bash
curl -v http://localhost:3000/api/session 2>&1
```
- **Criterio:** HTTP 200
- **Verifica:** Response JSON con `guestId`, `createdAt`, `theme`, `locale`
- **Verifica:** `Content-Type: application/json`

```powershell
# PowerShell para parsear JSON
curl -s http://localhost:3000/api/session | ConvertFrom-Json | Select-Object guestId, theme, locale
```
- **Criterio:** `guestId` es un string UUID no vacío, `theme` es 'system', `locale` es null o 'es'

### 3. Idempotencia de inicialización

```powershell
$r1 = curl -s http://localhost:3000/api/session | ConvertFrom-Json
$r2 = curl -s http://localhost:3000/api/session | ConvertFrom-Json
# Verificar mismo guestId
if ($r1.guestId -eq $r2.guestId) { "OK: mismo guestId" } else { "ERROR: diferentes" }
```
- **Criterio:** Mismo guestId en ambas llamadas

### 4. DELETE + verificación

```powershell
# Primero obtener guestId actual
$session = curl -s http://localhost:3000/api/session | ConvertFrom-Json
$guestId = $session.guestId
Write-Output "GuestId antes de DELETE: $guestId"

# Ejecutar DELETE
curl -s -X DELETE http://localhost:3000/api/session | ConvertFrom-Json

# Verificar que se creó NUEVO guestId
$session2 = curl -s http://localhost:3000/api/session | ConvertFrom-Json
Write-Output "GuestId después de DELETE: $($session2.guestId)"

if ($session2.guestId -ne $guestId) { "OK: nuevo guestId" } else { "ERROR: mismo guestId" }
```
- **Criterio:** DELETE retorna `{ success: true }`, nuevo GET genera guestId diferente

### 5. 401 sin cookie

```bash
curl -v -H "Cookie: " http://localhost:3000/api/session 2>&1
```
- **Criterio:** HTTP 401 con `{ error: 'No session' }`

### 6. Verificación en Admin Panel

- [ ] Después de GET, navegar a `/admin/collections/guest-sessions`
- [ ] Debe existir 1 documento con el guestId del response
- [ ] Navegar a `/admin/collections/lists`
- [ ] Deben existir 4 listas con ese guestId
- [ ] Después de DELETE, navegar de nuevo a ambas colecciones
- [ ] No deben existir documentos con ese guestId

### 7. CORS y Content-Type

```bash
curl -s -D - http://localhost:3000/api/session | Select-String -Pattern "content-type|access-control"
```
- **Criterio:** `content-type: application/json` presente
- **Nota:** CORS no aplica (mismo origen en desarrollo)
