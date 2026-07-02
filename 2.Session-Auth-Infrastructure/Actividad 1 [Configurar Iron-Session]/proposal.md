# Proposal: Configurar Iron-Session

## Problema

Task Sphere necesita autenticación anónima (guest) sin login. No hay usuarios registrados en el MVP. La solución debe: (1) identificar unívocamente a cada visitante, (2) persistir la identidad entre requests sin requerir DB, (3) ser segura contra manipulación. Passport.js + JWT + DB sessions es sobreingeniería para este caso.

## Solución

Iron-Session: cookies cifradas con AES-256-GCM. La cookie contiene solo el `guestId` (UUID v4) y `createdAt`. Sin estado en servidor, sin DB lookups en cada request. La sesión es válida por 7 días.

## Estrategia

1. **`SessionData` interface**: tipado estricto con `guestId?: string` y `createdAt?: string` — usado en middleware y API Routes
2. **`sessionOptions`**: configuración de cookie: `httpOnly: true` (inaccesible desde JS cliente), `sameSite: 'lax'` (envía en navegación entre sites), `secure: true` en producción, `maxAge: 604800` (7 días)
3. **Helper `getSession`**: wrapper sobre `getIronSession()` para evitar repetir import de options en cada API Route

## Impacto

- 1 archivo nuevo: `src/lib/iron-session.ts`
- Variable de entorno `IRON_SESSION_PASSWORD` (fallback hardcodeado para dev, obligatorio en producción)
- Sin cambios en otros archivos
