# Tasks: Configurar Iron-Session

## Dependencias
- `iron-session` instalado (Fase 1, Actividad 5)
- `src/lib/` directory existe

---

## Hito 1.1: Definir SessionData

- [ ] Crear `src/lib/iron-session.ts`
- [ ] Importar `{ getIronSession } from 'iron-session'`
- [ ] Importar `type { SessionOptions, IronSession } from 'iron-session'`
- [ ] Importar `{ NextRequest, NextResponse } from 'next/server'`
- [ ] Exportar interface `SessionData` con campos: `guestId?: string`, `createdAt?: string`

## Hito 1.2: Definir sessionOptions

- [ ] Exportar constante `sessionOptions: SessionOptions`
- [ ] Configurar `password`: `process.env.IRON_SESSION_PASSWORD || 'complex_password_at_least_32_chars_long_here'`
- [ ] Configurar `cookieName: 'task-sphere-session'`
- [ ] Configurar `cookieOptions.secure: process.env.NODE_ENV === 'production'`
- [ ] Configurar `cookieOptions.httpOnly: true`
- [ ] Configurar `cookieOptions.sameSite: 'lax'`
- [ ] Configurar `cookieOptions.maxAge: 60 * 60 * 24 * 7` (604800 segundos)

## Hito 1.3: Exportar helper getSession

- [ ] Exportar función async `getSession(request: NextRequest, response: NextResponse): Promise<IronSession<SessionData>>`
- [ ] Implementar: `return getIronSession<SessionData>(request, response, sessionOptions)`

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] El módulo exporta `SessionData`, `sessionOptions`, `getSession`
- [ ] `SessionData` es un type (no runtime)
- [ ] `getSession` es una función async que retorna `Promise<IronSession<SessionData>>`
