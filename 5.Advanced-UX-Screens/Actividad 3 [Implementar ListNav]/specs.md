# Actividad 3: Implementar ListNav — Especificación Técnica

## 1. Requisitos Funcionales

### 1.1 ListNav Base
| ID | Requisito | Prioridad |
|---|---|---|
| F1 | Renderizar todas las listas del guest obtenidas de `useLists()`, ordenadas por `sortOrder` | Alta |
| F2 | Cada item muestra: [drag handle] [icono Material Symbol] [nombre] [color dot] | Alta |
| F3 | Color dot: círculo de 8px (`w-2 h-2 rounded-full`) con `list.color` como backgroundColor. Si no hay color, usar `#004ac6` (primary) | Alta |
| F4 | Loading state: 3 skeleton items con `animate-pulse` y altura de 40px | Alta |
| F5 | Empty state: mensaje "No lists yet" con estilo `text-on-surface-variant` | Alta |
| F6 | Error state: retornar `null` (no romper sidebar) | Media |

### 1.2 Navegación y Selección
| ID | Requisito | Prioridad |
|---|---|---|
| F7 | Cada lista es un `<Link href={/lists/${list.id}}>` | Alta |
| F8 | Estado activo: `usePathname() === href` o `useParams().id === String(list.id)` | Alta |
| F9 | Item activo: `bg-primary-container/10 text-primary border-l-4 border-primary font-semibold` | Alta |
| F10 | Item inactivo: `text-on-surface-variant border-l-4 border-transparent hover:bg-surface-variant/50` | Alta |
| F11 | La navegación a `/lists/{id}` debe mostrar la página correspondiente (placeholder o real) | Alta |

### 1.3 Drag Handle Visual
| ID | Requisito | Prioridad |
|---|---|---|
| F12 | Icono `drag_indicator` de Material Symbols al inicio de cada item de lista | Alta |
| F13 | Drag handle visible solo en hover: `opacity-0 group-hover:opacity-100 transition-opacity` | Alta |
| F14 | Cursor: `cursor-grab` en estado normal, `cursor-grabbing` mientras se arrastra | Alta |
| F15 | Drag handle no interfiere con el click de navegación (separado del Link) | Alta |

### 1.4 Drag & Drop Reorder
| ID | Requisito | Prioridad |
|---|---|---|
| F16 | Implementar con HTML5 Drag & Drop API nativa (sin librería externa) | Alta |
| F17 | Al iniciar drag: `event.dataTransfer.setData('text/plain', list.id)`, añadir clase `opacity-50` al item origen | Alta |
| F18 | Drop zone: cada item de lista acepta `onDragOver` (preventDefault) y `onDrop` | Alta |
| F19 | Indicador visual durante drag: los items muestran `border-t-2 border-primary` temporal en la posición de drop | Alta |
| F20 | Al soltar: calcular nuevo orden, actualizar estado local inmediatamente (optimistic), enviar PATCH batch | Alta |
| F21 | Touch devices: no implementar drag & drop en mobile (se puede añadir post-MVP) | Media |

### 1.5 Optimistic Update + Persistencia
| ID | Requisito | Prioridad |
|---|---|---|
| F22 | Al reordenar: mutar el array local inmediatamente para feedback visual instantáneo | Alta |
| F23 | Enviar PATCH `/api/lists/reorder` con array `{ id, sortOrder }[]` para persistir | Alta |
| F24 | Si el PATCH falla: revertir al orden anterior (rollback) | Alta |
| F25 | Invalidar query `['lists']` después del éxito para sincronizar con otras partes de la app | Alta |

### 1.6 Context Menu (post-MVP)
| ID | Requisito | Prioridad |
|---|---|---|
| F26 | (Post-MVP) Botón `more_vert` visible en hover para editar/eliminar lista | Baja |
| F27 | (Post-MVP) Click en `more_vert` abre dropdown con opciones "Edit" y "Delete" | Baja |

## 2. Contratos de Datos

### 2.1 List interface (de `payload-types.ts`)
```typescript
export interface List {
  id: number
  name: string
  icon?: string | null
  color?: string | null
  guestId: string
  isDefault?: boolean | null
  sortOrder?: number | null
  updatedAt: string
  createdAt: string
}
```

### 2.2 ListNav Props (ninguna — autónomo)
```typescript
// ListNav no recibe props externas
// Consume useLists() y usePathname() internamente
// Se renderiza dentro de Sidebar
```

### 2.3 API Contract — Reorder
```
PATCH /api/lists/reorder
Headers: x-guest-id (automático desde Iron-Session)
Body: {
  lists: Array<{ id: number; sortOrder: number }>
}
Response 200: { success: true }
Error 401: { error: 'No session' }
Error 400: { error: 'Invalid payload' }
```

### 2.4 useReorderLists hook
```typescript
interface ReorderInput {
  lists: { id: number; sortOrder: number }[]
}

function useReorderLists(): UseMutationResult<
  { success: boolean },
  Error,
  ReorderInput
>
```

## 3. Estados de la UI

```
Normal (sin hover):
┌─────────────────────────────────┐
│  ○  📋 Work Projects            │
├─────────────────────────────────┤
│  ○  🛒 Shopping                 │
└─────────────────────────────────┘

Hover (drag handle visible):
┌─────────────────────────────────┐
│  ⠿  ○  📋 Work Projects    ⋮   │  drag handle + context menu
├─────────────────────────────────┤
│  ○  🛒 Shopping                 │
└─────────────────────────────────┘

Dragging (item origen):
┌─────────────────────────────────┐
│  ⠿  ○  📋 Work Projects    ⋮   │  opacity-50
├─────────────────────────────────┤
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  drop indicator (border-t-2 primary)
├─────────────────────────────────┤
│  ⠿  ○  🛒 Shopping         ⋮   │
└─────────────────────────────────┘

Active (seleccionado):
┌─────────────────────────────────┐
│▌ ⠿  ●  📋 Work Projects    ⋮   │  border-l-4 primary + bg tint
└─────────────────────────────────┘

Loading:
┌─────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  animate-pulse
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────┘

Empty:
┌─────────────────────────────────┐
│  No lists yet                    │
└─────────────────────────────────┘
```
