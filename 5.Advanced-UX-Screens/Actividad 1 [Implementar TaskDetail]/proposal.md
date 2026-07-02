# Actividad 1: Implementar TaskDetail — Propuesta

## Justificación

El panel de detalle de tarea (TaskDetail) es el componente de mayor densidad informativa en Task Sphere. Mientras que TaskList ofrece una vista panorámica de las tareas, TaskDetail proporciona la vista de profundidad: todas las propiedades editables de una tarea en un solo panel lateral de 384px.

### Por qué un panel lateral y no una página independiente

1. **Contexto visual continuo** — El usuario puede ver la lista de tareas mientras edita los detalles de una, manteniendo el contexto de navegación sin perder su posición en la lista.
2. **Patrón de productividad probado** — Aplicaciones como Todoist, Things 3, y TickTick usan este mismo patrón de split-view para edición de tareas.
3. **Rendimiento** — No requiere navegación entre rutas; solo un cambio de estado local (`selectedTaskId`) que actualiza el panel mediante TanStack Query cache.
4. **Responsive** — En desktop (>1024px) el panel se muestra siempre visible al costado; en mobile se superpone como overlay.

### Estrategia de transformación UI → CMS

El HTML de `3.Task Details.html` contiene ~70 líneas de markup significativo para el panel derecho. Cada sección se mapea directamente a un campo de la colección `tasks` de PayloadCMS que ya existe:

| Sección HTML | Campo Payload | Tipo | Estado actual |
|---|---|---|---|
| Checkbox circular | `status` | `select: pending \| completed` | Ya existe en `Tasks.ts` |
| Título inline-edit | `title` | `text` | Ya existe |
| Estrella (importante) | `important` | `checkbox` | Ya existe |
| "Add step" | `subtasks` | `array` | Ya existe en `Tasks.ts` |
| "Remind me" | Placeholder | — | No implementar (post-MVP) |
| "Due Today" date | `dueDate` | `date` | Ya existe |
| "Repeat" | Placeholder | — | No implementar (post-MVP) |
| "Pick a category" | `list` | `relationship → lists` | Ya existe |
| Notes textarea | `description` | `textarea` | Ya existe |
| Botón Delete | DELETE operation | — | Hook `afterDelete` existente |
| "Created X ago" | `createdAt` | `date` | Ya existe |

**Conclusión:** No se requieren cambios en la colección `Tasks` de PayloadCMS. Todos los campos necesarios ya están definidos y migrados. El esfuerzo se concentra íntegramente en el frontend: 5 componentes nuevos y una integración con el layout de stacks.

### Dependencias

- **Phase 4 Act 6 (useTasks hook)** — `useTask(id)` para fetch individual, `useUpdateTask()` y `useDeleteTask()` para mutaciones
- **Phase 4 Act 5 (TaskCheckbox)** — Componente de checkbox circular reutilizable
- **DetailPanel.tsx** — Contenedor del panel derecho (ya existe en `src/components/layout/DetailPanel.tsx`)

### Mejoras respecto al HTML original

1. **Auto-guardado con debounce** — Las notas se guardan automáticamente 800ms después de que el usuario deja de escribir, sin botón de "Save".
2. **Selector de lista con búsqueda** — El picker de categoría muestra las listas del guest con icono + color + búsqueda inline, mejorando la experiencia sobre un dropdown plano.
3. **Estados completo** — idle (sin tarea seleccionada), loading (skeleton), detail (contenido completo), error (fallback con retry).
4. **Animaciones de transición** — Los sub-pasos aparecen con fade-in al agregarse; el panel tiene transición suave al abrir/cerrar en mobile.

## Archivos a crear

```
src/components/tasks/
├── TaskDetail.tsx           # Orquestador principal del panel
├── TaskNotes.tsx            # Editor de notas con auto-guardado
├── TaskDatePicker.tsx       # Selector de fecha con botón "Tomorrow"
├── TaskSubsteps.tsx         # Lista de sub-pasos + Add step inline
└── TaskListPicker.tsx       # Selector de lista/categoría
```
