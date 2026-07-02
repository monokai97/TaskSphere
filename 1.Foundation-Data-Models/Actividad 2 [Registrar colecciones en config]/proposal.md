# Proposal: Registrar colecciones en payload.config.ts

## Problema

Actualmente `src/payload.config.ts` solo registra `Users` y `Media`. Las 5 colecciones de dominio (Tasks, Lists, TaskLogs, GuestSessions, FocusSessions) existen como archivos en `src/collections/` pero PayloadCMS no las conoce — no hay tablas SQLite creadas, no hay API REST, no hay admin panel.

## Solución

Importar las 5 colecciones y agregarlas al array `collections` de `buildConfig()`.

## Consideraciones

1. **Orden de registro**: PayloadCMS procesa colecciones en orden. `GuestSessions` debe ir antes que `Tasks` porque el hook `afterChange` de Tasks referencia `guestId`. `Lists` debe ir antes que `Tasks` por la relationship `list → lists`. El orden correcto es:

```
GuestSessions, Lists, Tasks, TaskLogs, FocusSessions
```

2. **Sin cambios en la configuración existente**: `Users` y `Media` se mantienen en sus posiciones originales. Sharp, editor Lexical, SQLite adapter no se modifican.

3. **Sin migraciones**: SQLite con PayloadCMS crea tablas automáticamente al iniciar desde los schemas de colección.

## Impacto

- 1 archivo modificado: `src/payload.config.ts`
- +5 líneas de import, +1 línea en el array collections
- Sin cambios en dependencias, plugins, o configuración de base de datos
- Tras el cambio, `pnpm dev` crea las 5 tablas SQLite y las colecciones aparecen en `/admin`
