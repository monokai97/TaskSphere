# Propuesta: Componente AddTaskBar — De Input Estático a Creador Validado

## Resumen Ejecutivo

Implementar `AddTaskBar`, el componente flotante anclado al fondo del workspace para crear nuevas tareas. Convierte el `<input>` estático de los prototipos HTML (`2.Stack My Day`, `3.Task Details`) en un componente React 19 interactivo con expansión on-focus, toolbar de metadatos, validación Zod en cliente y conexión directa a `POST /api/tasks` vía TanStack Query.

## Justificación

### Por qué un componente dedicado con expansión

| Aspecto | HTML estático | AddTaskBar React |
|---|---|---|
| **Estado** | Input estático | 3 estados: collapsed, focused, submitting |
| **Validación** | Ninguna (cualquier texto) | Zod en cliente antes de enviar |
| **Toolbar** | Siempre visible | Aparece al hacer focus (clean UI) |
| **Feedback** | Sin retroalimentación | Loading state + limpieza + error inline |
| **Contexto** | Placeholder genérico | Placeholder dinámico "[List Name]" |
| **Submit** | No funcional | Enter → mutate → invalidate cache |

### Mapeo HTML → AddTaskBar

```
HTML div.fixed.bottom-8 (2.Stack My Day)
  ├── div.bg-white/95 (contenedor glass)
  │   ├── span.add icon
  │   ├── input[placeholder="Add a task to 'My Day'..."]
  │   ├── button.calendar_month     → dueDate picker (Post-MVP)
  │   ├── button.notifications      → reminder (Post-MVP)
  │   └── button.repeat            → repeat (Post-MVP)
  └── (sin estado de envío)
```

### Mejoras sobre el HTML estático

1. **Expansión contextual:** Colapsado muestra solo input + icono. Al focus, se expande con toolbar y validación visual
2. **Validación Zod en cliente:** Verifica `title.length >= 3` antes del fetch. Error inline sin recargar
3. **Loading state:** El botón/input muestra spinner o feedback mientras `POST /api/tasks` resuelve
4. **Auto-cleanup:** Tras crear exitosamente, el input se limpia y el toolbar vuelve a collapsed
5. **Placeholder dinámico:** "Add a task to 'My Day'..." — recibe el nombre de la lista actual por prop

### Pipeline de Creación

```
Usuario escribe "Comprar leche" + Enter
  → Zod.validate({ title: "Comprar leche", list: listId })
  → (si inválido) mostrar error inline
  → (si válido) POST /api/tasks ← Act 1
  → CreateTaskInput → PayloadCMS collection 'tasks'
  → Hook afterChange → TaskLog
  → invalidateQueries(['tasks']) ← lista se actualiza
  → limpiar input, volver a collapsed
```

### Colecciones PayloadCMS Involucradas

| Colección | Operación | Vía |
|---|---|---|
| `tasks` | CREATE | API Route `POST /api/tasks` |
| `lists` | Lectura (para placeholder name) | Prop desde el stack |
| `task-logs` | Escritura indirecta | Hook afterChange de Tasks |

### Conclusión

AddTaskBar es el punto de entrada de datos más importante de la UI. Sin él, el usuario no puede crear tareas. Es el único componente de escritura en los stacks (junto con TaskCheckbox en Act 5) y el que completa el ciclo "captura rápida" del diseño Ethereal Focus.
