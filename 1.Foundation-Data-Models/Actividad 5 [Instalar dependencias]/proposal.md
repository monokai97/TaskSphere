# Proposal: Instalar dependencias

## Problema

El proyecto actualmente no tiene las librerías necesarias para el stack definido en `design.md`: TanStack Query (caché cliente-servidor y optimistic updates), Iron-Session (cookies cifradas para autenticación guest), y Zod (validación de esquemas compartidos cliente/servidor).

## Solución

Instalar 3 paquetes npm vía pnpm:

| Paquete | Versión | Propósito | Alternativa descartada |
|---|---|---|---|
| `@tanstack/react-query` | v5 | Caché de datos, optimistic updates, mutations, retry automático | useState manual (pierde sincronización) |
| `iron-session` | 8.x | Cookies cifradas sin estado para autenticación guest | Passport.js (sobreingeniería para anonymous auth) |
| `zod` | 3.x | Validación de esquemas en API Routes y formularios | Valibot (menos adopción, ecosistema PayloadCMS usa Zod) |

## Estrategia

1. Instalar secuencialmente: TanStack Query → Iron-Session → Zod
2. Verificar con `pnpm ls --depth 0` que los 3 paquetes aparecen sin errores de peer dependencies
3. Crear imports de prueba para confirmar resolución de módulos

## Impacto

- `package.json` modificado (3 nuevas líneas en `dependencies`)
- `pnpm-lock.yaml` actualizado
- Sin cambios en `src/` — las librerías se consumirán en fases posteriores
