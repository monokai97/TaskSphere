# Actividad 3: Implementar ListNav — Micro-tareas

## Hito 3.1: Refactor ListNav base con color dot y drag handle

### Tarea 3.1.1 — Refactorizar `src/components/lists/ListNav.tsx`
- Mantener estructura general pero envolver cada item en un `<div>` group para efectos hover
- Añadir `group` class al contenedor de cada item para poder referenciar hover states desde hijos
- Mantener `useLists()`, `usePathname()`, `isLoading`, `error`, `data?.docs?.length === 0`
- Crear subcomponente inline `ListItem` para cada lista

### Tarea 3.1.2 — Añadir color dot
- Antes del icono, añadir `<span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: list.color || '#004ac6' }} />`
- El dot debe estar oculto en mobile si hay poco espacio (o mantenerlo siempre visible)
- Si `list.color` es null, usar primary color `#004ac6`

### Tarea 3.1.3 — Añadir drag handle
- Antes del color dot, añadir `<span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-sm">drag_indicator</span>`
- El drag handle debe tener `draggable={true}` y `onDragStart` handler
- En mobile, ocultar con `hidden md:block`

### Tarea 3.1.4 — Mantener estados existentes
- Loading: mismo skeleton que antes (3 divs animate-pulse)
- Empty: mismo mensaje "No lists yet"
- Error: retornar null (silent fail)
- Active state: mantener lógica `usePathname() === /lists/${list.id}`

## Hito 3.2: Implementar drag & drop reorder

### Tarea 3.2.1 — Estado de drag en ListNav
```typescript
const [draggedId, setDraggedId] = useState<number | null>(null)
const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
const [dropIndex, setDropIndex] = useState<number | null>(null)
const lists = data?.docs || []
```

### Tarea 3.2.2 — Handlers de drag en cada ListItem
- `onDragStart`: `setDraggedId(list.id)`, `setDraggedIndex(index)`, `event.dataTransfer.setData('text/plain', String(list.id))`, `event.dataTransfer.effectAllowed = 'move'`
- `onDragOver`: `event.preventDefault()`, `event.dataTransfer.dropEffect = 'move'`, `setDropIndex(index)`
- `onDragEnd`: limpiar estados (`setDraggedId(null)`, `setDraggedIndex(null)`, `setDropIndex(null)`)
- `onDrop`: ejecutar reorder

### Tarea 3.2.3 — Visual feedback durante drag
- Item siendo arrastrado: `className={draggedIndex === index ? 'opacity-50' : ''}`
- Drop position indicator: al determinar `dropIndex`, el item en esa posición muestra `border-t-2 border-primary` en su borde superior. Crear lógica: `dropIndex === index ? 'border-t-2 border-primary' : ''`
- Solo si `draggedIndex !== null` y `draggedIndex !== index`

### Tarea 3.2.4 — Función de reordenamiento
```typescript
function handleDrop(dropIdx: number) {
  if (draggedIndex === null || draggedIdx === dropIdx) {
    cleanup()
    return
  }

  const reordered = [...lists]
  const [moved] = reordered.splice(draggedIndex, 1)
  reordered.splice(dropIdx, 0, moved)

  const updates = reordered.map((list, i) => ({
    id: list.id,
    sortOrder: i,
  }))

  // Optimistic update local
  queryClient.setQueryData(['lists'], { docs: reordered })

  // Persistir
  reorderMutation.mutate({ lists: updates })

  cleanup()
}

function cleanup() {
  setDraggedId(null)
  setDraggedIndex(null)
  setDropIndex(null)
}
```

### Tarea 3.2.5 — Desactivar drag en mobile
- Envolver drag handle en `<span className="hidden md:block ...">` para ocultarlo en mobile
- No asignar `draggable` en viewport < 768px

## Hito 3.3: Hook useReorderLists

### Tarea 3.3.1 — Crear `useReorderLists` en `src/hooks/useLists.ts`
- Añadir export function `useReorderLists()` junto a los hooks existentes
- Usar `useMutation` con `mutationFn` que hace fetch a `PATCH /api/lists/reorder`
- Implementar `onMutate` con cancelación de queries + snapshot + optimistic update de sortOrder
- Implementar `onError` con rollback al snapshot
- Implementar `onSettled` con `invalidateQueries(['lists'])`

### Tarea 3.3.2 — Integrar en ListNav
- `const reorderMutation = useReorderLists()`
- Llamar `reorderMutation.mutate({ lists: updates })` en `handleDrop`

## Hito 3.4: API Route para reorder

### Tarea 3.4.1 — Crear `src/app/(frontend)/api/lists/reorder/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ReorderInput = z.object({
  lists: z.array(
    z.object({
      id: z.number(),
      sortOrder: z.number().int().min(0),
    }),
  ).min(1),
})

export async function PATCH(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')
  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ReorderInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { getPayload } = await import('payload')
  const config = await import('@payload-config')
  const payloadConfig = await config.default
  const payload = await getPayload({ config: payloadConfig })

  // Batch update sortOrder
  await Promise.all(
    parsed.data.lists.map(({ id, sortOrder }) =>
      payload.update({
        collection: 'lists',
        id,
        data: { sortOrder },
        depth: 0,
      }),
    ),
  )

  return NextResponse.json({ success: true })
}
```

### Tarea 3.4.2 — Validar que las listas pertenecen al guest
- Opcional: verificar que cada `id` en el array corresponda a una lista del guest actual
- Por seguridad, el access control de PayloadCMS (`update: { guestId: { equals: guestId } }`) ya rechazará updates de listas de otro guest

## Hito 3.5: Crear page route `/lists/[id]`

### Tarea 3.5.1 — Crear `src/app/(frontend)/lists/[id]/page.tsx`
- Página server component o client component que muestre las tareas de una lista específica
- Usar `<TopBar title={listName} />` y `<TaskList listId={params.id} />`
- Por ahora, puede ser un placeholder simple que diga "Tasks for list {id}"

### Tarea 3.5.2 — Conectar con StacksLayout
- La página debe incluir `Sidebar` y `main` layout consistentes
- Usar el mismo layout que los stacks pero fuera del route group (stacks)

## Hito 3.6: Integración final

### Tarea 3.6.1 — Verificar integración con Sidebar
- ListNav se renderiza dentro de Sidebar en la sección de listas
- "New List" button está justo debajo de ListNav
- Al crear una nueva lista (Act 2), debe aparecer inmediatamente en ListNav vía query invalidation

### Tarea 3.6.2 — ESLint y type-check
- Ejecutar `pnpm lint` para verificar reglas del proyecto
- Verificar tipos con TypeScript
- Asegurar compatible con `List` type de `payload-types.ts`
