# Especificación: Componente AddTaskBar

## 1. Descripción

Componente React 19 `'use client'` que proporciona un input flotante para crear tareas rápidamente. Se expande al hacer focus mostrando un toolbar de metadatos. Valida el título con Zod en cliente y envía a `POST /api/tasks`. Se posiciona fixed al fondo del workspace, centrado y con efecto glassmorphism.

## 2. Interface

```typescript
// Ubicación: src/components/tasks/AddTaskBar.tsx

interface AddTaskBarProps {
  listId: number                    // Lista destino (requerida)
  listName?: string                 // Para placeholder contextual: "Add a task to '{listName}'..."
  onTaskCreated?: () => void        // Callback opcional post-creación
}

type AddTaskBarState = 'collapsed' | 'focused' | 'submitting' | 'error'
```

## 3. Props

| Prop | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `listId` | `number` | Sí | — | ID de la lista donde se creará la tarea |
| `listName` | `string` | No | `'Tasks'` | Nombre para el placeholder contextual |
| `onTaskCreated` | `() => void` | No | — | Callback después de creación exitosa |

## 4. Estados del Componente

| Estado | Trigger | UI |
|---|---|---|
| **Collapsed** | Default / blur sin contenido | Input single-line + icono `add` |
| **Focused** | Input focus / contenido escrito | Input expandido + toolbar visible (calendar, notifications, repeat) |
| **Submitting** | Enter presionado + validación pasa | Input deshabilitado, spinner en icono `add`, feedback "Creating..." |
| **Error** | Validación falla o fetch error | Input con borde rojo, mensaje error inline debajo del input |

## 5. Estructura HTML Renderizada

### 5.1 Estado Collapsed

```html
<div class="fixed bottom-8 left-[288px] right-0 flex justify-center pointer-events-none px-12 z-50">
  <div class="w-full max-w-4xl pointer-events-auto bg-white/95 border border-border-subtle-light
              shadow-2xl rounded-2xl p-2 flex items-center gap-2 backdrop-blur-md
              transition-all duration-300 hover:scale-[1.01]">
    <div class="p-2 text-primary">
      <span class="material-symbols-outlined text-[28px]">add</span>
    </div>
    <input class="flex-1 bg-transparent border-none focus:ring-0 text-body-lg font-task-item
                  placeholder:text-outline/60 outline-none"
           placeholder="Add a task to 'My Day'..."
           type="text" />
  </div>
</div>
```

### 5.2 Estado Focused

```html
<div class="fixed bottom-8 left-[288px] right-0 flex justify-center pointer-events-none px-12 z-50">
  <div class="w-full max-w-4xl pointer-events-auto bg-white/95 border border-primary/20
              shadow-2xl rounded-2xl p-2 flex items-center gap-2 backdrop-blur-md
              transition-all duration-300 ring-2 ring-primary/10">
    <div class="p-2 text-primary">
      <span class="material-symbols-outlined text-[28px]">add</span>
    </div>
    <input class="flex-1 bg-transparent border-none focus:ring-0 text-body-lg font-task-item
                  placeholder:text-outline/60 outline-none"
           placeholder="Add a task to 'My Day'..."
           type="text" />
    <div class="flex items-center gap-1 pr-2">
      <button class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
              title="Set due date" tabIndex={-1}>
        <span class="material-symbols-outlined">calendar_month</span>
      </button>
      <button class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
              title="Set reminder" tabIndex={-1}>
        <span class="material-symbols-outlined">notifications</span>
      </button>
      <button class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
              title="Repeat" tabIndex={-1}>
        <span class="material-symbols-outlined">repeat</span>
      </button>
    </div>
  </div>
</div>
```

### 5.3 Estado Submitting

```html
<!-- Mismo contenedor que focused pero con input deshabilitado -->
<input disabled class="..." placeholder="Creating..." />
<div class="p-2 text-primary">
  <span class="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
</div>
```

### 5.4 Estado Error (inline)

```html
<!-- Debajo del input si hay error de validación -->
<p class="text-label-sm text-error px-2 mt-1">Title must be at least 3 characters</p>
```

## 6. Comportamiento

| Evento | Acción |
|---|---|
| **Input focus** | Expandir a estado `focused`, mostrar toolbar |
| **Input blur (vacío)** | Volver a `collapsed`, ocultar toolbar |
| **Input blur (con texto)** | Mantener `focused` |
| **Enter (sin Shift)** | Validar con Zod → si válido: `submitting` → POST → éxito: limpiar + `collapsed` / error: `error` |
| **Shift+Enter** | Insertar nueva línea (no enviar) |
| **Escape** | Limpiar input, volver a `collapsed` |
| **Click toolbar button** | Placeholder (Post-MVP) — mostrar snackbar "Coming soon" |

## 7. Validación (Zod en cliente)

```typescript
import { CreateTaskInput } from '@/lib/schemas'

function handleSubmit(inputValue: string) {
  const result = CreateTaskInput.safeParse({
    title: inputValue,
    list: String(listId),
  })
  
  if (!result.success) {
    const fieldError = result.error.flatten().fieldErrors.title?.[0]
    setError(fieldError || 'Invalid input')
    return
  }
  
  // POST a /api/tasks con result.data
  createTask.mutate(result.data)
}
```

## 8. Dependencias

| Dependencia | Uso | Disponible |
|---|---|---|
| `react` | `useState`, `useCallback`, `useRef` | ✅ |
| `@/lib/schemas` | `CreateTaskInput` Zod schema | ❌ Act 1 |
| `@/payload-types` | `Task` type (respuesta) | ✅ |
| `@/hooks/useTasks` | `useCreateTask` mutation | ❌ Act 6 |

**Plan de contingencia:** Si `useCreateTask` (Act 6) no existe, implementar fetch directo a `POST /api/tasks` con `useState` + `fetch()`.
