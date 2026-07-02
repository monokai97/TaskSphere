# Actividad 1: Implementar TaskDetail — Micro-tareas

## Hito 1.1: Crear estructura base de TaskDetail con manejo de estados

### Tarea 1.1.1 — Crear `src/components/tasks/TaskDetail.tsx`
- Props: `taskId: number | null`, `onClose: () => void`, `onDelete?: (taskId: number) => void`
- Estado interno: `selectedTask` (Task | null), `state` (TaskDetailState), `title` (string), `isEditingTitle` (boolean)
- **State idle**: cuando `taskId` es null, mostrar `<EmptyState icon="arrow_back" title="Select a task" description="Click a task to view its details" />`
- **State loading**: cuando `taskId` no es null y `isLoading` es true, mostrar skeleton de 5 líneas con `animate-pulse`
- **State error**: cuando `error` es truthy, mostrar mensaje "Could not load task details" + botón "Retry" que refetch
- **State detail**: cuando `data` está disponible, renderizar contenido completo del panel

### Tarea 1.1.2 — Integrar `useTask(id)` hook
- Usar `useQuery` con `queryKey: ['tasks', taskId]` y `queryFn: () => fetch(/api/tasks/${taskId})`
- Endpoint `GET /api/tasks/[id]` debe existir (Phase 4 Act 1)
- Configurar `staleTime: 30_000`, `gcTime: 300_000`, `retry: 1`

### Tarea 1.1.3 — Integración con StacksLayout
- Actualizar `src/app/(frontend)/(stacks)/layout.tsx`:
  - Añadir `DetailPanel` junto al `<main>`
  - Wrappear ambos en un flex container
  - `DetailPanel` recibe `open` y `onClose` desde un ClientComponent StackLayoutWrapper
- Crear `src/app/(frontend)/(stacks)/StackLayoutWrapper.tsx` (client component):
  - Mantiene `selectedTaskId` en estado local
  - Provee `selectedTaskId` y `onSelectTask` y `onCloseTask` vía props a StackShell y DetailPanel
  - Renderiza `<DetailPanel open={!!selectedTaskId} onClose={onCloseTask}><TaskDetail taskId={selectedTaskId} onClose={onCloseTask} /></DetailPanel>`

### Tarea 1.1.4 — Actualizar TaskList para soportar selección
- TaskItem debe llamar a `onSelectTask(taskId)` al hacer click
- StackShell recibe `onSelectTask` prop desde StackLayoutWrapper
- Añadir estilo visual para tarea seleccionada en TaskItem (border-left-primary)

## Hito 1.2: Header — Checkbox, Título inline-edit, Importante

### Tarea 1.2.1 — ImportantToggle
- Componente inline dentro de TaskDetail
- Botón estrella con `onClick` que llama `useToggleImportant().mutate({ id: taskId })`
- Optimistic update: toggle `task.important` local inmediatamente
- Icono `star` filled (text-secondary) si `important=true`, outline (text-outline-variant) si `important=false`
- Transición de color suave `transition-colors duration-200`

### Tarea 1.2.2 — Título inline-edit
- Estado local `isEditingTitle: boolean` e `title: string`
- Por defecto: muestra `<h2>` con título en `text-headline-md`
- Al hacer click: cambia a `<input>` con el mismo texto, auto-focus
- Al blur o Enter: PATCH `/api/tasks/{id}` con `{ title }`, luego `isEditingTitle = false`
- Al Escape: cancela edición, restaura título original de la query cache

### Tarea 1.2.3 — TaskCheckbox en header
- Reutilizar `TaskCheckbox` (Phase 4 Act 5)
- Props: `checked={task.status === 'completed'}`, `onToggle` que llama `useToggleTask().mutate({ id: taskId, status: task.status === 'pending' ? 'completed' : 'pending' })`
- Mismo comportamiento que en TaskItem

## Hito 1.3: Due Date con TaskDatePicker

### Tarea 1.3.1 — Crear `src/components/tasks/TaskDatePicker.tsx`
- Props: `dueDate?: string | null`, `taskId: number`
- Botón "Tomorrow" que setea `dueDate = tomorrow.toISOString()` y hace PATCH
- Input `type="date"` nativo para selección de fecha personalizada
- Botón × para limpiar `dueDate` (PATCH con `{ dueDate: null }`)
- Mostrar "Due Today" si dueDate es hoy, "Due Tomorrow" si mañana, o fecha formateada `locale:"es"`

### Tarea 1.3.2 — Integrar en TaskDetail
- Renderizar `TaskDatePicker` en la sección de acciones, reemplazando el placeholder "Due Today"
- Sin optimistic update (espera confirmación server para evitar flickering de fecha)

## Hito 1.4: TaskSubsteps — Lista de sub-pasos

### Tarea 1.4.1 — Crear `src/components/tasks/TaskSubsteps.tsx`
- Props: `subtasks?: Task['subtasks']`, `taskId: number`
- Renderizar lista de sub-pasos existentes:
  - Cada sub-paso: checkbox circular pequeño (w-4 h-4) + título texto
  - Checkbox toggle: mapea array, toggle `completed` en ese índice, PATCH
- Input inline "Add step" al final:
  - Placeholder "Add step"
  - Enter → agrega `{ title: value, completed: false }` al array, PATCH
  - Enter con input vacío → no hace nada
  - Input se limpia después de agregar
- Input se enfoca automáticamente al hacer clic en "+"

### Tarea 1.4.2 — Animación de sub-paso agregado
- Usar `animate-slide-in` de tailwind.config (ya definido)
- Aplicar clase `animate-slide-in` al nuevo sub-paso mediante key en React

## Hito 1.5: TaskListPicker — Selector de lista/categoría

### Tarea 1.5.1 — Crear `src/components/tasks/TaskListPicker.tsx`
- Props: `currentListId: number | string`, `taskId: number`
- Usar `useLists()` para obtener todas las listas del guest
- Mostrar dropdown con:
  - Cada lista: icono Material Symbol + nombre + color dot
  - Lista actualmente seleccionada marcada con check
  - Al seleccionar: PATCH `{ list: selectedListId }` y cerrar dropdown
- Cerrar dropdown al hacer clic fuera (useRef + onClickOutside)

### Tarea 1.5.2 — Integrar en TaskDetail
- Renderizar `TaskListPicker` en sección "Pick a category"
- Si no hay listas (imposible por default lists), mostrar "No lists available"

## Hito 1.6: TaskNotes — Editor de notas con auto-guardado

### Tarea 1.6.1 — Crear `src/components/tasks/TaskNotes.tsx`
- Props: `description?: string | null`, `taskId: number`
- Textarea expandible con altura fija `h-48` (192px), scroll si excede
- Placeholder: "Add some notes..."
- Auto-guardado: debounce 800ms, luego PATCH `{ description: value }`
- Indicador de estado: texto "Saving..." durante la mutación, "Saved" por 2 segundos después
- No guardar si el valor no cambió respecto al último guardado

### Tarea 1.6.2 — Integrar en TaskDetail
- Renderizar en la sección Notes del panel
- Sincronizar valor inicial con `task.description`

## Hito 1.7: Footer — Delete + CreatedAt

### Tarea 1.7.1 — Botón Delete con confirmación
- Botón con icono `delete`, color `text-text-secondary-light`, hover `text-error bg-error-container`
- Al click: `confirm('Are you sure you want to delete this task?')`
- Si confirma: `useDeleteTask().mutate({ id: taskId })` con optimistic update
- Tras éxito: llamar `onDelete?.(taskId)` y `onClose()`
- Manejar error con rollback del optimistic update

### Tarea 1.7.2 — Badge de CreatedAt
- Importar `formatDistanceToNow` de `date-fns` (o implementar utilitario simple)
- Formatear: "Created 3 hours ago", "Created yesterday", "Created 2 days ago"
- Actualizar cada 60 segundos con `setInterval` para mantener relativo actual

## Hito 1.8: Integración final y responsive

### Tarea 1.8.1 — Responsive behavior
- Desktop (≥1024px): DetailPanel siempre visible, `open=true` por defecto
- Mobile (<1024px): DetailPanel overlay con `fixed inset-0 z-50`, animación slide desde derecha
- Botón de cerrar visible solo en mobile
- Transición: `translate-x-full` → `translate-x-0` con `duration-300`

### Tarea 1.8.2 — Keyboard shortcuts
- Escape: cerrar panel (`onClose`)
- Ctrl+Enter en notes: forzar guardado inmediato (saltar debounce)

### Tarea 1.8.3 — Cache invalidation
- Al modificar cualquier campo del task, invalidar queries de listas afectadas
- Especialmente: al cambiar `list` (categoría), invalidar ambas listas (origen y destino)
- Al eliminar task, invalidar todas las queries de tasks

### Tarea 1.8.4 — ESLint y type-check
- Ejecutar `pnpm lint` para verificar reglas del proyecto
- Verificar tipos: asegurar que todos los imports de `@/payload-types` coinciden con la interfaz Task
- No warnings de `no-unused-vars`, `no-explicit-any`
