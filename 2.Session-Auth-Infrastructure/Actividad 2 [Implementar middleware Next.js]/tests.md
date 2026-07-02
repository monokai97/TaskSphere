# Tests: Implementar middleware de Next.js

## Estrategia

Middleware se prueba observando cookies y headers en el navegador (no hay test unitario sencillo para middleware de Next.js fuera del contexto del servidor).

## Test Suite

### 1. Compilación

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Middleware compila con tipos de Next.js e iron-session

### 2. Inicialización del servidor

```bash
pnpm dev
```
- **Criterio:** Servidor inicia sin errores relacionados con middleware
- **Verifica:** El matcher no interfiere con rutas excluidas

### 3. Test de cookie (navegador manual)

| Paso | Resultado esperado |
|---|---|
| Abrir `http://localhost:3000` | La página se renderiza sin errores |
| DevTools > Application > Cookies | Aparece `task-sphere-session` con valor cifrado |
| Copiar el valor de la cookie | Comienza con `iron://` (formato de Iron-Session) |
| Refrescar la página (F5) | Cookie se mantiene (mismo valor) |
| DevTools > Network > primer request | Response headers incluyen `Set-Cookie: task-sphere-session=...` (solo en primer request) |
| Request headers del segundo request | Incluye `Cookie: task-sphere-session=...` |

### 4. Test de header x-guest-id (curl)

```bash
curl -v http://localhost:3000/api/tasks 2>&1 | Select-String -Pattern "x-guest-id"
```
- **Criterio:** No aparece (las respuestas no llevan ese header — solo se inyecta en el request interno)
- Test alternativo: crear un endpoint temporal que devuelva el header recibido

### 5. Test de matcher (rutas excluidas)

```bash
curl -v http://localhost:3000/admin 2>&1 | Select-String -Pattern "Set-Cookie"
```
- **Criterio:** No se genera cookie para rutas del admin panel
- **Verifica:** El matcher excluye `/admin/*`

### 6. Prueba de persistencia (sesión sobrevive a reinicio)

- [ ] Cerrar pestaña y abrir nueva (cookie persiste)
- [ ] El `guestId` en cookie debe ser el mismo (verificar en DevTools o endpoint de sesión)
- [ ] Abrir ventana de incógnito: genera un nuevo `guestId` (cookie diferente)
