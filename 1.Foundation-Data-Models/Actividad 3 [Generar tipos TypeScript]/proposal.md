# Proposal: Generar tipos TypeScript

## Problema

`src/payload-types.ts` actualmente solo contiene tipos genéricos de PayloadCMS (SupportedTimezones, User, Media). Las 5 colecciones de dominio (Tasks, Lists, TaskLogs, GuestSessions, FocusSessions) no tienen representación en el sistema de tipos. El frontend (Fases 3-6) no puede consumir datos tipados, perdiendo type-safety en API Routes, hooks de TanStack Query, y componentes React.

## Solución

Ejecutar `pnpm generate:types` que lee el `payload.config.ts` (con las 5 colecciones ya registradas en Actividad 2) y genera automáticamente las interfaces TypeScript en `src/payload-types.ts`.

## Estrategia

1. **Generación automática**: PayloadCMS inspecciona cada colección y produce interfaces exactas con campos, tipos, relaciones y nullability.
2. **Verificación manual**: Revisar que las interfaces generadas coinciden con los schemas definidos — cada campo del schema debe aparecer en el tipo.
3. **Type-check**: `npx tsc --noEmit` debe pasar sin errores, confirmando que no hay discrepancias entre los schemas y los tipos generados.

## Impacto

- 1 archivo regenerado automáticamente: `src/payload-types.ts` (no editar manualmente)
- Las 5 interfaces exportadas son la fuente de verdad de tipos para todo el frontend
- Sin cambios en otros archivos
