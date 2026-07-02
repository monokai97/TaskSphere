# Proposal: Crear API Route de sesión

## Problema

El frontend necesita un endpoint para obtener los datos de la sesión actual (guestId, preferencias de tema, locale) al cargar la aplicación. También necesita poder purgar todos los datos del guest (GDPR/reset). Actualmente no existe ninguna API Route — la sesión solo existe como cookie Iron-Session en el middleware, pero no hay forma de leerla desde el cliente ni de interactuar con PayloadCMS.

## Solución

Endpoint REST `/api/session` con dos métodos:

1. **GET**: inicia la inicialización lazy del guest (`ensureGuestInitialized`), busca la `GuestSession` en PayloadCMS, y retorna datos tipados al frontend.
2. **DELETE**: purga completa del guest: elimina todas sus Tasks, Lists, TaskLogs, y GuestSession de PayloadCMS, y destruye la cookie Iron-Session.

## Estrategia

- **Thin API Proxy pattern** (design.md §1.A): la API Route recibe el request, valida el guestId del header (inyectado por middleware), delega a `ensureGuestInitialized()` y a PayloadCMS CRUD. No contiene lógica de negocio compleja.
- **GET es la puerta de entrada**: la primera llamada a GET /api/session es lo que dispara la creación de GuestSession + 4 listas default en PayloadCMS.
- **DELETE es full purge**: elimina datos en orden (tasks → task-logs → lists → guest-session) para evitar orphan records, luego destruye la cookie.

## Impacto

- 1 archivo nuevo: `src/app/(frontend)/api/session/route.ts` (con GET + DELETE)
- Dependencias: `ensureGuestInitialized` (Act 3), `getSession`/`sessionOptions` (Act 1), `getPayload` de PayloadCMS
- Sin cambios en colecciones PayloadCMS
