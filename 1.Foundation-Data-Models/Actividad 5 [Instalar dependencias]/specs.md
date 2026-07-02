# Specs: Instalar dependencias

## Funcionales

1. El sistema debe tener `@tanstack/react-query` disponible para manejo de estado servidor-cliente.
2. El sistema debe tener `iron-session` disponible para autenticación guest via cookies cifradas.
3. El sistema debe tener `zod` disponible para validación de esquemas compartidos.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Instalar TanStack Query | `pnpm add @tanstack/react-query` — versión más reciente de v5 |
| R2 | Instalar Iron-Session | `pnpm add iron-session` — versión compatible con Next.js 16 (App Router) |
| R3 | Instalar Zod | `pnpm add zod` — versión 3.x |
| R4 | package.json actualizado | Los 3 paquetes aparecen en `dependencies` (no devDependencies) |
| R5 | Lockfile actualizado | `pnpm-lock.yaml` se regenera incluyendo los nuevos paquetes |
| R6 | Peer dependencies resueltas | `pnpm install` no muestra warnings de peer dependencies faltantes |
| R7 | Node.js imports funcionales | `import { useQuery } from '@tanstack/react-query'`, `import { getIronSession } from 'iron-session'`, `import { z } from 'zod'` deben resolver sin errores |

## Contratos

No aplica — actividad puramente de instalación de paquetes. Los contratos de cada librería se definen en Fases 2-4 cuando se implementan:

```typescript
// Uso esperado en fases posteriores
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query'
import { getIronSession } from 'iron-session'
import { z } from 'zod'
```
