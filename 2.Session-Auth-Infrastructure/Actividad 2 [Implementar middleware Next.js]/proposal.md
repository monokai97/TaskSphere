# Proposal: Implementar middleware de Next.js

## Problema

Cada request HTTP necesita identificar al guest. Sin middleware, cada API Route tendría que leer/crear la cookie Iron-Session manualmente, duplicando lógica en 15+ endpoints. Además, PayloadCMS access control depende del header `x-guest-id` — sin middleware, este header nunca se inyecta.

## Solución

Middleware global de Next.js que intercepta cada request, lee la cookie `task-sphere-session` via Iron-Session, crea una nueva si no existe, e inyecta el `guestId` como header HTTP `x-guest-id` para que todas las capas downstream (API Routes, PayloadCMS access control) lo consuman sin repetir lógica.

## Estrategia

1. **No bloqueante**: el middleware solo opera sobre cookies y headers — nunca escribe en DB. Si PayloadCMS está caído, el guest sigue teniendo identidad.
2. **Sesión nueva automática**: si la cookie no existe o expiró, se genera `crypto.randomUUID()` y se guarda en una nueva cookie cifrada.
3. **Header propagation**: el `x-guest-id` se añade a los headers del request transformado, disponible en `req.headers.get('x-guest-id')` en cualquier Route Handler.
4. **Matcher exclude**: el admin de PayloadCMS (`/admin`, `/api/auth`) y assets estáticos se excluyen del middleware para no interferir con el auth interno de PayloadCMS.

## Impacto

- 1 archivo nuevo: `src/middleware.ts`
- Dependencia: `iron-session` y `SessionData`/`sessionOptions` de Actividad 1
- Sin cambios en API Routes existentes (ninguna todavía)
