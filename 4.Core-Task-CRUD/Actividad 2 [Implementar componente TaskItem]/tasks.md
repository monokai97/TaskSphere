# Tasks: Implementar componente TaskItem

## Dependencias Previas

- [x] Fuerte: PayloadCMS genera tipos (Task, List) en `src/payload-types.ts` (Fase 1)
- [ ] Débil: Componente `TaskCheckbox` (Actividad 5) — opcional, puede inline el checkbox
- [x] Fuerte: Directorio `src/components/tasks/` debe crearse

## Hitos

### Hito 1: Crear estructura de directorio y archivo

- [ ] 1.1 Crear directorio `src/components/tasks/` (si no existe)
- [ ] 1.2 Crear archivo `src/components/tasks/TaskItem.tsx`
- [ ] 1.3 Añadir directiva `'use client'` al inicio del archivo

### Hito 2: Definir interfaz de props

- [ ] 2.1 Importar `Task` type desde `@/payload-types`
- [ ] 2.2 Definir interfaz `TaskItemProps`:
  ```typescript
  interface TaskItemProps {
    task: Task
    onToggle: (id: Task['id'], status: Task['status']) => void
    onToggleImportant: (id: Task['id'], important: boolean) => void
    onClick?: (id: Task['id']) => void
    selected?: boolean
  }
  ```
- [ ] 2.3 Definir componente como `export function TaskItem(props: TaskItemProps)`
- [ ] 2.4 Envolver con `React.memo` para evitar re-renders innecesarios

### Hito 3: Renderizar estructura base

- [ ] 3.1 Renderizar `<div>` contenedor con clases base:
  - `group flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl`
  - `border border-transparent hover:border-outline-variant hover:shadow-sm`
  - `transition-all cursor-pointer`
- [ ] 3.2 Añadir `role="listitem"` al contenedor
- [ ] 3.3 Añadir `onClick` que llama a `onClick?.(task.id)`
- [ ] 3.4 Detener propagación en clicks de botones internos (checkbox, estrella)

### Hito 4: Implementar estados visuales

- [ ] 4.1 Estado **completed**: Si `task.status === 'completed'`, añadir:
  - `opacity-50 grayscale-[0.2]` al contenedor
  - `line-through` al título
- [ ] 4.2 Estado **selected**: Si `selected === true`, añadir:
  - `border-primary/20 bg-primary-fixed/10 shadow-sm` al contenedor
- [ ] 4.3 Estado **important**: Si `task.important === true`:
  - Texto secondary, FILL 1 en la estrella
  - `aria-label="Quitar importante"` vs `"Marcar importante"`

### Hito 5: Renderizar contenido dinámico

- [ ] 5.1 Renderizar título: `<p className="font-task-item text-body-md text-on-surface truncate">`
  - Aplicar `line-through` condicional si `status === 'completed'`
- [ ] 5.2 Renderizar metadata row:
  - Si `task.dueDate` existe: mostrar icono `calendar_today` + fecha formateada (Today/Tomorrow/date)
  - Si `task.list` es un objeto (depth >= 1): mostrar icono de lista + nombre
  - Clase metadata: `font-label-sm text-text-secondary-light flex items-center gap-1`
- [ ] 5.3 Renderizar botón estrella (important toggle):
  - `<button onClick={handleToggleImportant} aria-label={...}>`
  - Icono `star` con Material Symbol
  - `text-secondary` si important, `text-outline-variant` si no
- [ ] 5.4 Renderizar drag handle:
  - `<span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">drag_indicator</span>`

### Hito 6: Implementar callbacks

- [ ] 6.1 `handleToggle`: Importar `useCallback` de React
  - `const handleToggle = useCallback(() => { onToggle(task.id, task.status === 'pending' ? 'completed' : 'pending') }, [task.id, task.status, onToggle])`
  - Pasar a TaskCheckbox o al checkbox inline
- [ ] 6.2 `handleToggleImportant`:
  - `const handleToggleImportant = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onToggleImportant(task.id, !task.important) }, [task.id, task.important, onToggleImportant])`
- [ ] 6.3 Detener propagación en `handleToggleImportant` para evitar abrir detail panel

### Hito 7: Checkbox inline (alternativa sin TaskCheckbox)

- [ ] 7.1 Si TaskCheckbox (Act 5) no está disponible, implementar checkbox inline:
  ```html
  <div className="relative w-6 h-6 flex items-center justify-center">
    {task.status === 'completed' ? (
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[18px]">check</span>
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full border-2 border-outline hover:border-primary transition-all cursor-pointer"
           onClick={handleToggle} />
    )}
  </div>
  ```
- [ ] 7.2 En hover sobre el checkbox no completado: `hover:bg-primary/5` (tinte azul sutil)

### Hito 8: Validación final

- [ ] 8.1 Ejecutar `pnpm lint` — sin errores
- [ ] 8.2 Verificar que import path usa `@/payload-types`
- [ ] 8.3 Verificar que no hay `any` types (usar `Task['id']` en lugar de `number`)
- [ ] 8.4 Verificar que el componente es `React.memo`-wrapped

## Orden de Implementación

```
Hito 1 (directory) → Hito 2 (props) → Hito 3 (estructura base)
                                              ↓
                          Hito 5 (contenido) ← Hito 4 (estados)
                              ↓
                          Hito 6 (callbacks)
                              ↓
                          Hito 7 (checkbox inline)
                              ↓
                          Hito 8 (lint)
```

## Checklist de Archivos

| Archivo | Estado |
|---|---|
| `src/components/tasks/TaskItem.tsx` | ❌ No existe |
| `src/components/tasks/` | ❌ No existe |
