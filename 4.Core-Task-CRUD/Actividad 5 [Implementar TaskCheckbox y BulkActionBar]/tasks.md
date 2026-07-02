# Tasks: Implementar TaskCheckbox + BulkActionBar

## Dependencias Previas

- [x] Fuerte: Directorio `src/components/tasks/` debe existir
- [ ] Débil: `useToggleTask` mutation (Act 6) — se implementa fetch directo como fallback
- [ ] Débil: Selección múltiple en TaskList — se implementa estado local en BulkActionBar
- [x] Fuerte: API Routes `PATCH /api/tasks/{id}` y `DELETE /api/tasks/{id}` (Act 1)

## Hitos

### Hito 1: Crear TaskCheckbox — estructura base

- [ ] 1.1 Crear archivo `src/components/tasks/TaskCheckbox.tsx`
- [ ] 1.2 Añadir directiva `'use client'`
- [ ] 1.3 Definir interfaz `TaskCheckboxProps` con `checked`, `onToggle`, `disabled?`, `size?`
- [ ] 1.4 Definir componente `export function TaskCheckbox(props: TaskCheckboxProps)`
- [ ] 1.5 Renderizar `<button>` con `role="checkbox"` y `aria-checked={checked}`

### Hito 2: TaskCheckbox — estados visuales

- [ ] 2.1 Estado **unchecked**:
  - `w-6 h-6 rounded-full border-2 border-outline` (md) o `w-5 h-5` (sm)
  - Hover: `hover:border-primary hover:bg-primary/5`
  - `transition-all duration-200`
- [ ] 2.2 Estado **checked**:
  - `bg-primary rounded-full` sin borde
  - Icono `<span className="material-symbols-outlined text-white text-[18px]">check</span>`
  - Usar `font-variation-settings: 'wght' 700` para checkmark más grueso (opcional)
- [ ] 2.3 Estado **disabled**:
  - `opacity-50 cursor-not-allowed` en todos los casos
  - No aplicar hover styles cuando disabled
- [ ] 2.4 Tamaño **sm** (20px): `w-5 h-5`, icono `text-[14px]`

### Hito 3: TaskCheckbox — callback onToggle

- [ ] 3.1 Llamar `onToggle()` en `onClick` del botón
- [ ] 3.2 No llamar `onToggle` si `disabled === true`
- [ ] 3.3 Detener propagación: `e.stopPropagation()` para evitar abrir detail panel (cuando se use dentro de TaskItem)
- [ ] 3.4 `aria-label` dinámico: `checked ? 'Mark as pending' : 'Mark as completed'`

### Hito 4: TaskCheckbox — optimistic update (placeholder)

- [ ] 4.1 Implementar fetch directo como fallback hasta Act 6:
  ```typescript
  // En el padre (TaskItem), no en TaskCheckbox
  const handleToggle = useCallback(() => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending'
    
    // Optimistic: actualizar cache inmediatamente
    queryClient.setQueryData(['tasks', listId], (old: any) => {
      if (!old) return old
      return {
        ...old,
        docs: old.docs.map((t: Task) =>
          t.id === task.id
            ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null }
            : t
        ),
      }
    })
    
    // Fetch al servidor
    fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {
      // Rollback: invalidar para traer datos reales
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
    })
  }, [task.id, task.status, listId])
  ```
- [ ] 4.2 TaskCheckbox es puramente de presentación — no contiene lógica de fetching

### Hito 5: Crear BulkActionBar — estructura base

- [ ] 5.1 Crear archivo `src/components/tasks/BulkActionBar.tsx`
- [ ] 5.2 Añadir directiva `'use client'`
- [ ] 5.3 Definir interfaz `BulkActionBarProps`
- [ ] 5.4 Si `selectedCount === 0`, retornar `null` (no renderizar nada)
- [ ] 5.5 Definir componente `export function BulkActionBar(props: BulkActionBarProps)`

### Hito 6: BulkActionBar — renderizado y animación

- [ ] 6.1 Renderizar `<header>` sticky:
  - `sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md`
  - `px-4 md:px-12 py-4 border-b border-primary/10 shadow-sm`
- [ ] 6.2 Aplicar animación slide-in:
  - `animate-slide-in` (definida en `tailwind.config.ts`)
  - Si no existe, usar inline style con animation
- [ ] 6.3 Sección izquierda: botón close + contador
  ```html
  <div className="flex items-center gap-6">
    <button onClick={onClearSelection}
            className="w-8 h-8 rounded-full hover:bg-surface-variant transition-colors
                       flex items-center justify-center">
      <span className="material-symbols-outlined text-primary">close</span>
    </button>
    <span className="font-headline-md text-primary font-bold">
      {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
    </span>
  </div>
  ```
- [ ] 6.4 Sección derecha: botones de acción
  ```html
  <div className="flex items-center gap-2">
    <!-- Mark as completed -->
    <button onClick={onMarkCompleted} ...>
      <span className="material-symbols-outlined text-primary">check_circle</span>
      <span className="hidden md:inline">Mark as completed</span>
    </button>
    <!-- Set due date (placeholder) -->
    <button onClick={onSetDueDate} ...>
      <span className="material-symbols-outlined text-primary">event_upcoming</span>
      <span className="hidden md:inline">Set due date</span>
    </button>
    <!-- Move to... (placeholder) -->
    <button onClick={onMoveToList} ...>
      <span className="material-symbols-outlined text-primary">drive_file_move</span>
      <span className="hidden md:inline">Move to...</span>
    </button>
    <!-- Divider -->
    <div className="w-[1px] h-6 bg-outline-variant mx-2" />
    <!-- Delete -->
    <button onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-error
                       hover:bg-error-container/20 transition-all rounded-lg font-label-sm">
      <span className="material-symbols-outlined">delete</span>
      <span className="hidden md:inline">Delete</span>
    </button>
  </div>
  ```
- [ ] 6.5 En mobile (<768px): solo iconos, texto oculto con `hidden md:inline`

### Hito 7: BulkActionBar — callbacks

- [ ] 7.1 `onClearSelection`: limpiar `selectedIds` en el padre
- [ ] 7.2 `onMarkCompleted`: iterar `selectedIds` y toggle cada uno (o endpoint batch Post-MVP)
- [ ] 7.3 `onDelete`: confirmar con el usuario (opcional) y eliminar cada tarea seleccionada
- [ ] 7.4 `onSetDueDate`, `onMoveToList`: placeholders — mostrar snackbar "Coming soon" o no hacer nada

### Hito 8: Integración con TaskList (selección)

- [ ] 8.1 En `TaskList`, añadir estado de selección:
  ```typescript
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  ```
- [ ] 8.2 Pasar `selected` y`onSelect` a cada `TaskItem`
- [ ] 8.3 Renderizar `BulkActionBar` condicionalmente:
  ```typescript
  {selectedIds.size > 0 && (
    <BulkActionBar
      selectedCount={selectedIds.size}
      onMarkCompleted={handleBulkComplete}
      onDelete={handleBulkDelete}
      onClearSelection={() => setSelectedIds(new Set())}
    />
  )}
  ```

### Hito 9: Definir animación slide-in en tailwind.config.ts

- [ ] 9.1 Verificar que `tailwind.config.ts` ya tiene la animación `slide-in` (definida en `design.md` §5.A)
- [ ] 9.2 Si no existe, añadir:
  ```typescript
  keyframes: {
    'slide-in': {
      '0%': { transform: 'translateY(-20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
  animation: {
    'slide-in': 'slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  ```

### Hito 10: Validación final

- [ ] 10.1 Ejecutar `pnpm lint` — sin errores
- [ ] 10.2 Verificar que TaskCheckbox no depende de ninguna mutation (es puramente presentacional)
- [ ] 10.3 Verificar que BulkActionBar no renderiza nada cuando selectedCount = 0
- [ ] 10.4 Verificar animación slide-in funciona correctamente

## Orden de Implementación

```
TaskCheckbox:
  Hito 1 → Hito 2 → Hito 3 → Hito 4 (fallback)

BulkActionBar:
  Hito 5 → Hito 6 → Hito 7

Integración:
  Hito 8 (TaskList) → Hito 9 (animación) → Hito 10 (lint)
```

## Checklist de Archivos

| Archivo | Estado |
|---|---|
| `src/components/tasks/TaskCheckbox.tsx` | ❌ No existe |
| `src/components/tasks/BulkActionBar.tsx` | ❌ No existe |
