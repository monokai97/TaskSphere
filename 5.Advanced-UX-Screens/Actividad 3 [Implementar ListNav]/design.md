# Actividad 3: Implementar ListNav — Diseño UI-a-CMS

## 1. Visual Mapping: HTML → Payload CMS

| Elemento Visual | Código Existente | Componente React | Campo Payload | Tipo |
|---|---|---|---|---|
| Lista container | `div.flex.flex-col.gap-0.5` | `ListNav` wrapper | — | Layout |
| Label "Lists" | `span.font-label-sm` | Section header | — | Texto estático |
| List item | `Link` con `flex items-center gap-3` | `ListItem` (map) | — | Navegación |
| Icono Material Symbol | `span.material-symbols-outlined` | Icon display | `list.icon` | `text` (nombre icono) |
| Nombre lista | `span.font-body-md.truncate` | Name display | `list.name` | `text` |
| Color dot (nuevo) | No existe | `ColorDot` | `list.color` | `text` (hex) |
| Drag handle (nuevo) | No existe | `DragHandle` | — | UI only |
| Estado activo | `bg-primary-container/10 border-l-4 border-primary` | Active indicator | — | `usePathname()` match |
| Skeleton loading | `animate-pulse bg-surface-container-high` | Skeleton | — | UI only |
| Drop indicator (nuevo) | No existe | `DropIndicator` | — | UI only durante drag |

## 2. Diagrama de Componentes

```
Sidebar (existing)
├── NAV_ITEMS (My Day, Important, Planned, Tasks)
├── ListNav (enhanced)
│   ├── SectionHeader ("LISTS")
│   ├── [Loading] Skeleton ×3
│   ├── [Empty] "No lists yet"
│   ├── [Error] null (silent fail)
│   └── [Data] ListItem[] (sorted by sortOrder)
│       ├── DragHandle (drag_indicator icon, group-hover visible)
│       ├── ColorDot (w-2 h-2 rounded-full, list.color)
│       ├── ListIcon (MaterialSymbol, list.icon || "list")
│       ├── ListName (truncate, list.name)
│       ├── ContextMenuButton (more_vert, post-MVP)
│       └── ActiveBar (border-l-4, conditional)
└── "New List" button
```

## 3. Flujo de Drag & Drop

### 3.1 Inicio de drag
```
User mouses down on drag handle → dragStart handler
  → event.dataTransfer.setData('text/plain', draggedList.id.toString())
  → event.dataTransfer.effectAllowed = 'move'
  → setDraggedIndex(currentIndex)
  → Añadir clase opacity-50 al item origen
  → setTimeout(() => item.classList.add('dragging'), 0) // next tick para icono fantasma
```

### 3.2 Durante drag
```
User hovers over another list item → dragOver handler
  → event.preventDefault() // permite drop
  → Calcular dropIndex basado en posición del mouse vs elementos
  → Si dropIndex !== draggedIndex:
      → Añadir indicador visual (border-t-2 border-primary) en posición drop
      → Remover indicador de posición anterior
```

### 3.3 Drop
```
User releases → drop handler
  → Obtener draggedId de event.dataTransfer.getData('text/plain')
  → Calcular nuevo orden del array:
      const reordered = arrayMove(lists, draggedIndex, dropIndex)
      const updates = reordered.map((list, i) => ({ id: list.id, sortOrder: i }))
  → Optimistic update: setQueryData(['lists'], { docs: reordered })
  → PATCH batch: useReorderLists.mutate({ lists: updates })
  → Limpiar estados de drag (draggedIndex, dropIndex)
  → Remover clases visuales
```

### 3.4 Rollback en error
```
PATCH falla (network/server error)
  → Revertir query data al snapshot guardado en onMutate
  → Mostrar toast/notificación de error (opcional)
```

### 3.5 Flujo de datos del reorder
```
User drops list
  → ListNav: array reordered locally (optimistic)
  → useReorderLists.mutate({ lists: [...{id, sortOrder}] })
    → PATCH /api/lists/reorder
      → API Route: Zod validate body (array de {id: number, sortOrder: number})
      → PayloadCMS: for each item, payload.update({ collection: 'lists', id, data: { sortOrder } })
        → Nota: en SQLite, usar transacción para atomicidad
        → Alternativa: updates individuales con Promise.all
      → Response: { success: true }
    → onSuccess: invalidateQueries(['lists'])
    → onError: rollback al snapshot
```

## 4. Esquema de Base de Datos (PayloadCMS)

### Colección: `lists`

```
lists
├── id: number (PK)
├── name: text (required)
├── icon: text (default: "list")
├── color: text (hex, nullable)
├── guestId: text (required, indexed)
├── isDefault: boolean (default: false)
├── sortOrder: number (nullable)  ← usado para ordenamiento
├── createdAt: date
└── updatedAt: date
```

**Access Control** (existente, sin cambios):
- `read`: `{ guestId: { equals: guestId } }`
- `create`: `!!guestId`
- `update`: `{ guestId: { equals: guestId } }`
- `delete`: `{ guestId: { equals: guestId } }`

**No se requieren cambios en la colección.**

## 5. Tipos TypeScript

```typescript
// Estado interno del drag
interface DragState {
  draggedId: number | null
  draggedIndex: number | null
  dropIndex: number | null
  isDragging: boolean
}

// ReorderBatchInput (para useReorderLists)
interface ReorderBatchInput {
  lists: { id: number; sortOrder: number }[]
}
```

## 6. Hook: useReorderLists

Se añade a `src/hooks/useLists.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { List } from '@/payload-types'

const LISTS_KEY = 'lists'

export function useReorderLists() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { lists: { id: number; sortOrder: number }[] }) => {
      const res = await fetch('/api/lists/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to reorder lists')
      return res.json() as Promise<{ success: boolean }>
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [LISTS_KEY] })
      const previousData = queryClient.getQueryData<{ docs: List[] }>([LISTS_KEY])

      // Actualizar sortOrder en cache optimista
      queryClient.setQueryData<{ docs: List[] }>([LISTS_KEY], (old) => {
        if (!old) return old
        const sortMap = new Map(data.lists.map((l) => [l.id, l.sortOrder]))
        return {
          ...old,
          docs: old.docs.map((list) => ({
            ...list,
            sortOrder: sortMap.get(list.id) ?? list.sortOrder,
          })),
        }
      })

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([LISTS_KEY], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] })
    },
  })
}
```

## 7. Diseño de Transiciones

| Elemento | Animación | CSS |
|---|---|---|
| Drag handle | Fade in/out en hover | `opacity-0 group-hover:opacity-100 transition-opacity duration-200` |
| Item dragged | Semi-transparente | `opacity-50 transition-opacity` |
| Drop indicator | Border aparece/desaparece | `border-t-2 border-primary transition-all` |
| Item hover | Color de fondo sutil | `hover:bg-surface-variant/50 transition-colors duration-200` |
| Active state | Borde izquierdo + tint | `border-l-4 border-primary bg-primary-container/10` |

## 8. Estrategia Mobile

En mobile (<768px), el drag & drop se desactiva. La justificación:
- Touch events para drag & drop requieren lógica adicional (touchstart/touchmove/touchend)
- El espacio reducido hace difícil el DnD preciso
- Se puede implementar como mejora post-MVP con librería touch-friendly

Comportamiento mobile:
- Drag handle se oculta (`hidden md:block`)
- ListNav funciona igual pero sin capacidad de reordenamiento
- El orden se puede gestionar desde settings (post-MVP)
