# Design: Instalar dependencias

## Visual Mapping

No hay elementos HTML/Stitch — actividad puramente de infraestructura.

## Diagrama de Uso Futuro

```mermaid
graph TD
    subgraph "Fase 2: Session"
        IS[iron-session] --> MW[middleware.ts]
        IS --> SS[session API Routes]
    end

    subgraph "Fase 3: UI"
        TQ[TanStack Query] --> QP[QueryProvider.tsx]
    end

    subgraph "Fase 4: Task CRUD"
        Z[zod] --> SCHEMA[lib/schemas.ts]
        TQ --> HT[hooks/useTasks.ts]
        Z --> API[API Routes validation]
    end

    subgraph "Fase 5: Settings"
        TQ --> HS[hooks/useSession.ts]
        Z --> API_LISTS[Lists API Routes]
    end

    subgraph "Fase 6: Hardening"
        Z --> EXPORT[Export API schema]
        TQ --> FOCUS[hooks/useFocusSessions.ts]
    end
```

## Versiones y Compatibilidad

| Paquete | Versión esperada | Peer dependencies clave |
|---|---|---|
| `@tanstack/react-query` | ^5.x | React 18+ (compatible con React 19) |
| `iron-session` | ^8.x | Next.js compatible con App Router (no requiere API Routes de Pages Router) |
| `zod` | ^3.23.x | Sin peer dependencies |

## Código de Verificación (import test)

```typescript
// src/_import-test.ts (temporal, eliminar después)
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query'
import { getIronSession, IronSession } from 'iron-session'
import { z } from 'zod'

// TanStack Query
const queryClient = new QueryClient()

// Zod
const TestSchema = z.object({ name: z.string().min(1) })
type TestType = z.infer<typeof TestSchema>

// Iron-Session
declare const session: IronSession<{ guestId: string }>

console.log('All imports resolve correctly')
```

```bash
pnpm tsx src/_import-test.ts  # Debe ejecutarse sin errores
rm src/_import-test.ts         # Limpiar
```
