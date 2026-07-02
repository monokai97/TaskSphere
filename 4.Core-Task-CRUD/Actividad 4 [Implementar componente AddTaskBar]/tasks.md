# Tasks: Implementar componente AddTaskBar

## Dependencias Previas

- [ ] Débil: `useCreateTask` mutation (Act 6) — se implementa fallback con fetch directo
- [ ] Débil: `CreateTaskInput` Zod schema en `src/lib/schemas.ts` (Act 1) — se implementa inline si no existe
- [x] Fuerte: Directorio `src/components/tasks/` debe existir (creado en Act 2 o 3)
- [x] Fuerte: API Route `POST /api/tasks` (Act 1) — endpoint de creación

## Hitos

### Hito 1: Crear archivo y estructura base

- [ ] 1.1 Crear archivo `src/components/tasks/AddTaskBar.tsx`
- [ ] 1.2 Añadir directiva `'use client'`
- [ ] 1.3 Definir interfaz `AddTaskBarProps` con `listId`, `listName?`, `onTaskCreated?`
- [ ] 1.4 Definir type `AddTaskBarState = 'collapsed' | 'focused' | 'submitting' | 'error'`
- [ ] 1.5 Definir estado inicial con `useState`:
  ```typescript
  const [inputValue, setInputValue] = useState('')
  const [state, setState] = useState<AddTaskBarState>('collapsed')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  ```

### Hito 2: Renderizar estructura collapsed

- [ ] 2.1 Renderizar contenedor fixed:
  ```html
  <div className="fixed bottom-8 left-sidebar-width right-0 flex justify-center pointer-events-none px-12 z-50">
  ```
- [ ] 2.2 Renderizar contenedor interno con clases:
  - `w-full max-w-4xl pointer-events-auto bg-white/95 border border-border-subtle-light`
  - `shadow-2xl rounded-2xl p-2 flex items-center gap-2 backdrop-blur-md`
  - `transition-all duration-300`
- [ ] 2.3 Añadir hover scale: `hover:scale-[1.01]` (solo en collapsed)
- [ ] 2.4 Renderizar icono `add` primary en div con `p-2 text-primary`
- [ ] 2.5 Renderizar input con:
  - `flex-1 bg-transparent border-none focus:ring-0 text-body-lg font-task-item outline-none`
  - Placeholder: `` `Add a task to '${listName || 'Tasks'}'...` ``
  - `value={inputValue}` + `onChange` manejador

### Hito 3: Manejar focus y blur

- [ ] 3.1 `onFocus`: cambiar estado a `'focused'`, expandir contenedor:
  - Cambiar borde a `border-primary/20` y añadir `ring-2 ring-primary/10`
- [ ] 3.2 `onBlur`: si `inputValue` está vacío, volver a `'collapsed'`:
  - Restaurar borde a `border-border-subtle-light`, quitar ring
  - Limpiar error si existe
- [ ] 3.3 Si `inputValue` no está vacío al blur, mantener `'focused'`

### Hito 4: Renderizar toolbar en estado focused

- [ ] 4.1 En estado `focused`, renderizar toolbar después del input:
  ```html
  <div className="flex items-center gap-1 pr-2">
    <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
            title="Set due date" tabIndex={-1}
            onClick={() => {}}>
      <span className="material-symbols-outlined">calendar_month</span>
    </button>
    <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
            title="Set reminder" tabIndex={-1}
            onClick={() => {}}>
      <span className="material-symbols-outlined">notifications</span>
    </button>
    <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
            title="Repeat" tabIndex={-1}
            onClick={() => {}}>
      <span className="material-symbols-outlined">repeat</span>
    </button>
  </div>
  ```
- [ ] 4.2 Añadir `tabIndex={-1}` a botones del toolbar (no deben recibir focus por tab)

### Hito 5: Manejar teclado

- [ ] 5.1 `onKeyDown` en el input:
  - `Enter` (sin `ShiftKey`): prevenir default, ejecutar `handleSubmit()`
  - `Escape`: limpiar input, hacer blur, volver a `collapsed`
  - `Shift + Enter`: permitir nueva línea (default behavior)
- [ ] 5.2 Implementar `handleSubmit`:
  ```typescript
  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed.length < 3) {
      setError('Title must be at least 3 characters')
      setState('error')
      return
    }
    setState('submitting')
    createTask(trimmed)
  }, [inputValue, listId])
  ```

### Hito 6: Crear tarea (fetch directo)

- [ ] 6.1 Implementar función `createTask` (fallback hasta Act 6):
  ```typescript
  const createTask = useCallback(async (title: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, list: String(listId) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.title?.[0] || 'Failed to create task')
      }
      // Éxito
      setInputValue('')
      setError(null)
      setState('collapsed')
      inputRef.current?.blur()
      onTaskCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }, [listId, onTaskCreated])
  ```
- [ ] 6.2 Migrar a `useCreateTask()` mutation cuando Act 6 esté disponible

### Hito 7: Renderizar estados submitting y error

- [ ] 7.1 Estado **submitting**:
  - Input deshabilitado: `disabled className="opacity-50"`
  - Placeholder: `"Creating..."`
  - Icono `add` reemplazado por `progress_activity` con clase `animate-spin`
  - Toolbar oculto
- [ ] 7.2 Estado **error**:
  - Borde del contenedor: `border-error/50`
  - Mensaje error debajo del contenedor:
    ```html
    {error && (
      <p className="text-label-sm text-error px-2 mt-1 w-full max-w-4xl" role="alert">
        {error}
      </p>
    )}
    ```
  - Al editar el input (`onChange`), limpiar error y volver a `focused`

### Hito 8: Responsive

- [ ] 8.1 Mobile (<768px): `left-0` en vez de `left-sidebar-width`, `px-4`
- [ ] 8.2 Tablet (768-1023px): `left-0`, `px-6`
- [ ] 8.3 Desktop: `left-sidebar-width`, `px-12`
- [ ] 8.4 Verificar que no hay overlap con MobileNav (que está al fondo en mobile)
  - En mobile: cambiar `bottom-8` a `bottom-20` (sobre el MobileNav)

### Hito 9: Validación final

- [ ] 9.1 Ejecutar `pnpm lint` — sin errores
- [ ] 9.2 Verificar que no hay imports circulares
- [ ] 9.3 Verificar que el placeholder usa `listName` dinámicamente
- [ ] 9.4 Probar: focus → escribir → Enter → tarea creada → input limpio
- [ ] 9.5 Probar: focus → escribir → Escape → input limpio → collapsed

## Orden de Implementación

```
Hito 1 (archivo + state) → Hito 2 (collapsed) → Hito 3 (focus/blur)
                                                          ↓
                              Hito 5 (teclado) ← Hito 4 (toolbar focused)
                                    ↓
                              Hito 6 (create fetch) → Hito 7 (submitting/error)
                                                          ↓
                                                    Hito 8 (responsive)
                                                          ↓
                                                    Hito 9 (lint)
```

## Checklist de Archivos

| Archivo | Estado |
|---|---|
| `src/components/tasks/AddTaskBar.tsx` | ❌ No existe |
