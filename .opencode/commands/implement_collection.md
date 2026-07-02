description = "Analiza una página/ruta frontend, extrae sus necesidades de datos y genera colecciones PayloadCMS, endpoints personalizados, hooks React Query, esquemas Zod y toda la capa de persistencia necesaria."

prompt = """
Actúa como un **Senior Fullstack Engineer** experto en **Payload CMS 3.0** y **Next.js**. Tu objetivo es analizar una página/ruta frontend y generar toda la capa de datos que necesita: colecciones, endpoints, hooks, schemas, y registro en Payload CMS.

### INPUT
Ruta/Página a analizar: {{args}}

### PASO 1: INGESTA DE CONTEXTO
Analiza profundamente estos artefactos para entender necesidades y patrones:
- **Página objetivo:** !{cat {{args}}}
- **Componentes importados:** Busca los componentes importados por la página en `src/components/` y analiza qué datos necesitan (CRUD, filtros, relaciones)
- **AGENTS.md:** !{cat AGENTS.md}
- **Payload config:** !{cat src/payload.config.ts}
- **Colecciones existentes:** !{cat "src/collections/*.ts"}
- **Endpoints existentes:** Busca en `src/app/(frontend)/api/` para evitar duplicar rutas
- **Schemas existentes:** !{cat src/lib/schemas.ts}
- **Hooks existentes:** !{cat "src/hooks/*.ts"}
- **payload-types.ts:** Verifica los tipos generados actualmente en `src/payload-types.ts` (solo cabecera y tipos relevantes)

### PASO 2: ANÁLISIS DE NECESIDADES DE DATOS
Identifica para cada componente de la página:
1. **Entidades de datos**: ¿Qué conceptos del mundo real necesita? (ej: "tasks", "categories", "lists")
2. **Operaciones CRUD**: ¿Qué operaciones hace cada entidad? (Create, Read, Update, Delete)
3. **Filtros/búsqueda**: ¿Qué parámetros de filtro o búsqueda se requieren?
4. **Relaciones**: ¿Cómo se relacionan las entidades entre sí?
5. **Validaciones**: ¿Qué reglas de validación aplican?

### PASO 3: GENERACIÓN DE COLECCIONES PAYLOADCMS
Para cada nueva entidad identificada, crea un archivo en `src/collections/[Nombre].ts` siguiendo estos patrones del proyecto:

```typescript
import type { CollectionConfig } from 'payload'

export const [Nombre]: CollectionConfig = {
  slug: '[slug]',
  admin: {
    useAsTitle: '[campo-titulo]',
    defaultColumns: ['[campos-visibles]'],
  },
  access: {
    read: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    create: ({ req }) => !!req.headers.get('x-guest-id'),
    update: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    delete: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
  },
  hooks: {
    // Solo si aplica: afterChange, beforeChange, afterRead, afterDelete
  },
  fields: [
    // guestId SIEMPRE primero, required e index
    {
      name: 'guestId',
      type: 'text',
      required: true,
      index: true,
    },
    // ... campos específicos de la entidad
  ],
}
```

Reglas para la colección:
- **guestId**: Siempre presente como primer campo, `required`, `index: true`
- **Access**: Usa el patrón `x-guest-id` de las colecciones existentes
- **Hooks**: Implementa `afterChange`/`afterDelete` solo si hay side-effects (logging, sync, etc.)
- **Relaciones**: Usa `type: 'relationship'` con `relationTo: '[slug]'` y `hasMany: true` si aplica
- **Arrays/Grupos**: Usa `type: 'array'` o `type: 'group'` para datos anidados

### PASO 4: REGISTRO EN PAYLOAD CONFIG
Actualiza `src/payload.config.ts`:
1. Importa la nueva colección al inicio del archivo (junto a las importaciones existentes)
2. Añade la colección al array `collections: [...]` en `buildConfig`

### PASO 5: CREACIÓN DE ENDPOINTS PERSONALIZADOS (API ROUTES)
Para cada nueva colección, crea rutas API en `src/app/(frontend)/api/[slug]/`:

**Ruta lista** (`src/app/(frontend)/api/[slug]/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { withRetry } from '@/lib/with-retry'

export async function GET(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }
    await ensureGuestInitialized(guestId)
    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    // ... query con filtros, sort, etc.
    const docs = await withRetry(() =>
      payload.find({
        collection: '[slug]',
        where: { guestId: { equals: guestId } },
        sort: 'sortOrder',
      }),
    )
    return NextResponse.json(docs)
  } catch (error) {
    console.error('[GET /api/[slug]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  // ... validación con Zod, crear documento
}
```

**Ruta detalle** (`src/app/(frontend)/api/[slug]/[id]/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { withRetry } from '@/lib/with-retry'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { ... }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { ... }
```

### PASO 6: ESQUEMAS ZOD DE VALIDACIÓN
Añade schemas de validación en `src/lib/schemas.ts` para las operaciones Create y Update de cada nueva entidad, siguiendo el patrón existente (z.object, transform para trim, etc.).

### PASO 7: HOOKS REACT QUERY CLIENTE
Crea hooks `use[Nombre]` en `src/hooks/use[Nombre].ts` con:
- `use[Nombre]s(params?)`: Query para listar
- `useCreate[Nombre]()`: Mutation para crear
- `useUpdate[Nombre]()`: Mutation para actualizar
- `useDelete[Nombre]()`: Mutation para eliminar

### PASO 8: GENERAR TIPOS
Ejecuta `pnpm generate:types` para regenerar `src/payload-types.ts` con los tipos de las nuevas colecciones.

### PASO 9: CIERRE
Reporta un resumen con:
- Colecciones creadas/modificadas con sus campos
- Endpoints creados con sus métodos
- Schemas Zod añadidos
- Hooks React Query creados
- Comando ejecutado: `pnpm generate:types`

### REGLAS DE ORO:
1. **No duplicar**: Verifica siempre si una colección, endpoint o schema ya existe antes de crearlo
2. **Patrón guestId**: Toda colección usa `guestId` como campo de tenant, requerido e indexado
3. **Sin comentarios**: El código generado no debe incluir comentarios
4. **WithRetry**: Envuelve todas las operaciones Payload que puedan fallar por SQLITE_BUSY con `withRetry()`
5. **Import dinámico**: Usa `const { getPayload } = await import('payload')` dentro de cada handler de API route
6. **Error handling**: Todos los endpoints usan try/catch con `console.error` y `503` como fallback
7. **Optimistic updates**: Los hooks de mutación deben implementar `onMutate` con optimistic updates y `onError` para rollback
