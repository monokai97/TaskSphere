# Propuesta: Componente TaskItem — De divs HTML a Componente React 19 con Tipado Fuerte

## Resumen Ejecutivo

Implementar `TaskItem`, el componente atómico que renderiza una tarea individual en los stacks del workspace. Convierte los divs estáticos del prototipo HTML `3.Task Details` en un componente React 19 `'use client'` con props tipadas, estados visuales (normal, hover, selected, completed) y callbacks para mutaciones (toggle, important, click).

## Justificación

### Por qué un componente dedicado

| Aspecto | HTML estático (prototipo) | TaskItem React (implementado) |
|---|---|---|
| **Datos** | Hardcodeados en divs | `task: Task` prop desde payload-types.ts |
| **Estados** | Solo visual (CSS class toggle) | Estados React: normal, hover, selected, completed, loading |
| **Interacción** | JavaScript inline en `<script>` | Props callback: `onToggle`, `onToggleImportant`, `onClick` |
| **Reutilización** | Duplicado en cada stack | Un solo componente usado por TaskList |
| **Accesibilidad** | Sin ARIA | `role="listitem"`, `aria-checked` en checkbox |

### Mapeo HTML → TaskItem Props

```
HTML div.task-item (3.Task Details)
  ├── input[type=checkbox]         → onToggle(task.id, newStatus)
  ├── p.text-task-item             → task.title (con line-through si completed)
  ├── span.label-sm (metadata)     → task.dueDate, task.list.name
  └── span.star (importante)       → onToggleImportant(task.id)
```

### Mejoras sobre el HTML estático

1. **Type-safety:** `task: Task` desde payload-types.ts garantiza que el componente recibe exactamente los campos que necesita
2. **Optimistic updates ready:** Los callbacks `onToggle`/`onToggleImportant` se conectan directamente a `useMutation` de TanStack Query
3. **Estados explícitos:** `completed` (opacity-50 + line-through), `selected` (borde primary), drag handle visible solo en hover
4. **Accesibilidad:** Checkbox semántico con `aria-checked`, botones con `aria-label`
5. **Sin dependencia de datos:** Componente puro — no hace fetching, solo recibe props y emite eventos

### Colecciones PayloadCMS Involucradas

| Colección | Campos usados por TaskItem |
|---|---|
| `tasks` | `id`, `title`, `status`, `important`, `dueDate`, `list` (relationship), `completedAt`, `subtasks` |
| `lists` | `id`, `name`, `icon`, `color` (cuando se resuelve la relación con depth) |

### Conclusión

TaskItem es el bloque constructivo más pequeño de la UI de tareas. Sin él, TaskList no puede renderizar, y sin TaskList los stacks quedan con EmptyState estático. Es el primer componente de datos real que conecta el frontend con los tipos generados de PayloadCMS.
