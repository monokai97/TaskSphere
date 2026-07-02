# Propuesta: TaskCheckbox + BulkActionBar — Interacción y Acciones Masivas

## Resumen Ejecutivo

Implementar dos componentes gemelos que manejan la selección y mutación de tareas: **TaskCheckbox** (checkbox circular animado con optimistic update) y **BulkActionBar** (barra sticky de acciones masivas con slide-in). Convierten los inputs estáticos y la barra de selección del prototipo HTML `2.Stack My Day` en componentes React interactivos conectados a TanStack Query.

## Justificación

### Por qué dos componentes separados

| Componente | Responsabilidad | HTML Fuente |
|---|---|---|
| **TaskCheckbox** | Toggle individual: pending↔completed con optimistic update | `input[type=checkbox]` circular en cada TaskItem |
| **BulkActionBar** | Acciones sobre múltiples tareas seleccionadas | `header.bulk-action-bar` con botones de acción masiva |

La separación permite:
- TaskCheckbox se reutiliza en TaskItem (Act 2) para toggle individual
- BulkActionBar se muestra/oculta según el estado de selección desde TaskList
- El optimistic update (snapshot + rollback) se implementa una vez en TaskCheckbox

### Mapeo HTML → Componentes

```
HTML (2.Stack My Day)
  ├── input[type=checkbox] (x5)      → TaskCheckbox (individual)
  │   ├── "pending": border-outline, hover:border-primary
  │   ├── "checked": bg-primary + checkmark white
  │   └── completed task: bg-primary + checkmark + opacity-50
  │
  └── header.bulk-action-bar          → BulkActionBar (masivo)
      ├── close button
      ├── "3 items selected"
      ├── check_circle → "Mark as completed"
      ├── event_upcoming → "Set due date"
      ├── drive_file_move → "Move to..."
      ├── divider
      └── delete (error color)
```

### Mejoras sobre el HTML estático

1. **Optimistic update inmediato:** TaskCheckbox cambia la UI antes de la confirmación del servidor (200ms de diferencia). Si falla, rollback automático
2. **Snapshots previos:** `onMutate` guarda el estado anterior de TanStack Query para rollback perfecto
3. **BulkActionBar animado:** Aparece con `slideIn` desde arriba, desaparece al deseleccionar todo
4. **Contador dinámico:** "X items selected" se actualiza en tiempo real según selección
5. **Post-MVP listo:** Botones "Set due date" y "Move to..." son placeholders extensibles

### Pipeline de Toggle (Optimistic Update)

```
Click checkbox
  → onMutate: snapshot cache actual, update UI inmediato
  → mutationFn: PATCH /api/tasks/{id} { status: 'completed' }
  → onError: rollback al snapshot
  → onSettled: invalidateQueries(['tasks'])
```

### Colecciones PayloadCMS Involucradas

| Colección | Operación | Vía |
|---|---|---|
| `tasks` | UPDATE (status, important, completedAt) | `PATCH /api/tasks/{id}` |
| `tasks` | DELETE (bulk) | `DELETE /api/tasks/{id}` |
| `task-logs` | Escritura indirecta | Hook afterChange/afterDelete |

### Conclusión

TaskCheckbox y BulkActionBar son los componentes de mutación más frecuentes (cada toggle es una operación de escritura). La implementación correcta del optimistic update es crítica para la sensación de "respuesta instantánea" que define la experiencia Ethereal Focus.
