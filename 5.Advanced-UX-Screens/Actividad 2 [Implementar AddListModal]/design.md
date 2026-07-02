# Actividad 2: Implementar AddListModal — Diseño UI-a-CMS

## 1. Visual Mapping: HTML → Payload CMS

| Elemento HTML (7.Add List.html) | Línea(s) | Componente React | Campo Payload | Tipo | Notas |
|---|---|---|---|---|---|
| Overlay `fixed inset-0 glass-effect bg-surface/30` | 175 | `AddListModal` wrapper | — | CSS | `bg-black/50 backdrop-blur-sm` |
| Container `max-w-md rounded-xl shadow-2xl` | 177 | `AddListModal` card | — | Layout | Animación scale in/out |
| Título "Nueva lista" | 181 | `h3` modal header | — | Text | `editList ? "Editar lista" : "Nueva lista"` |
| Botón X close | 182-184 | Close button | — | Action | `onClick={onClose}` |
| Input "Sin título" | 187-189 | `input` text | `list.name` | `text` | AutoFocus, bottom-border style |
| Grid 6×2 iconos (12) | 193-230 | `IconGrid` subcomponente | `list.icon` | `text` | Guarda nombre Material Symbol |
| 5 círculos de color | 235-241 | `ColorPicker` subcomponente | `list.color` | `text` | Guarda hex (#004ac6, etc.) |
| Botón "Cancelar" | 246-248 | Cancel button | — | Action | Ghost style, cierra modal |
| Botón "Crear lista" | 249-251 | Submit button | POST `/api/lists` | Action | Deshabilitado si input vacío |
| Footer background | 245 | Acciones container | — | Layout | `bg-surface-container-low` |

### Estados del HTML vs React

| Estado | HTML | React | Implementación |
|---|---|---|---|
| Cerrado | No renderizado | `isOpen=false` → retorna null | No monta el componente |
| Abierto (creación) | Visible con input vacío | `isOpen=true, editList=null` | Formulario limpio |
| Abierto (edición) | No existe en HTML | `isOpen=true, editList=List` | Valores precargados |
| Input vacío | Botón disabled | `name.trim() === ''` → botón disabled | `opacity-40 cursor-not-allowed` |
| Submit loading | No existe en HTML | `isPending` | Botón muestra spinner + "Creando..." |
| Error submit | No existe en HTML | `error` state | Mensaje inline en footer |

## 2. Diagrama de Componentes

```
Sidebar (existing)
├── ListNav
│   └── lists.map → Link (icon + name)
├── "New List" button → onClick={setShowModal(true)}
└── AddListModal (isOpen, onClose, onSuccess)
    ├── Overlay (backdrop-blur, click-to-close)
    ├── ModalCard
    │   ├── Header (title + close ×)
    │   ├── NameInput (autoFocus, display-xl-mobile)
    │   ├── IconGrid
    │   │   └── IconOption[] (12 items, radio behavior)
    │   ├── ColorPicker
    │   │   └── ColorDot[] (5 items, radio behavior)
    │   └── Footer
    │       ├── CancelButton
    │       └── SubmitButton (disabled / loading / active)
```

## 3. Flujo de Datos

### 3.1 Creación de lista
```
User clicks "New List" in Sidebar
  → Sidebar state: setShowAddList(true)
  → AddListModal isOpen=true

User types name, selects icon + color
  → Local state actualizado (sin fetch)

User clicks "Crear lista"
  → Zod validación cliente (name min 1, icon max 50, color regex hex)
  → Si inválido: mostrar error en campo name
  → Si válido: useCreateList.mutate({ name, icon, color })
    → TanStack Query onMutate: (no optimistic — creación espera server)
    → fetch POST /api/lists
      → API Route: valida con CreateListInput Zod
      → PayloadCMS: payload.create({ collection: 'lists', data: { ...parsed, guestId } })
      → Retorna 201 con List creada
    → onSuccess:
      → queryClient.invalidateQueries({ queryKey: ['lists'] })
      → closeModal()
      → onSuccess?.(newList)  ← callback para Sidebar/ListNav
    → onError:
      → setSubmitError(message)
      → modal permanece abierto
```

### 3.2 Edición de lista
```
User clicks edit on existing list (future: from ListNav context menu)
  → AddListModal isOpen=true editList=selectedList
  → Form precargado con editList.name, editList.icon, editList.color

User changes name + selects different icon
User clicks "Guardar cambios"
  → useUpdateList.mutate({ id: editList.id, name, icon, color })
    → fetch PATCH /api/lists/{id}
    → PayloadCMS: payload.update({ collection: 'lists', id, data })
    → onSuccess: invalidateQueries(['lists']), closeModal()
```

### 3.3 Animaciones

```
Abrir modal:
  overlay: opacity-0 → opacity-100 (200ms ease-out)
  card: scale-95 opacity-0 → scale-100 opacity-100 (250ms ease-out, delay 50ms)

Cerrar modal:
  card: scale-100 opacity-100 → scale-95 opacity-50 (150ms ease-in)
  overlay: opacity-100 → opacity-0 (150ms ease-in)
  Luego: setShowAddList(false) — desmonta componente
```

## 4. Esquema de Base de Datos (PayloadCMS)

```
lists
├── id: number (PK)
├── name: text (required, maxLength: 100)
├── icon: text (default: "list")
├── color: text (hex, nullable)
├── guestId: text (required, indexed)
├── isDefault: boolean (default: false)
├── sortOrder: number (nullable)
├── createdAt: date (auto)
└── updatedAt: date (auto)

Access Control:
  - read: { guestId: { equals: guestId } }
  - create: !!guestId
  - update: { guestId: { equals: guestId } }
  - delete: { guestId: { equals: guestId } }
```

**No se requieren cambios** — la colección ya existe y está migrada.

## 5. Hook: useCreateList / useUpdateList

Se añaden al archivo `src/hooks/useLists.ts` existente:

```typescript
export function useCreateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; icon?: string; color?: string }) => {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.fieldErrors?.name?.[0] || 'Failed to create list')
      }
      return res.json() as Promise<List>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & { name?: string; icon?: string; color?: string }) => {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update list')
      return res.json() as Promise<List>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}
```

## 6. Diseño Responsive

| Breakpoint | Modal behavior |
|---|---|
| ≥768px (tablet up) | Overlay centrado, `max-w-md`, padding 1rem alrededor |
| <768px (mobile) | Overlay full-width, modal ocupa casi toda la pantalla con `mx-4`, border-radius reducido |

## 7. Keyboard Navigation

| Tecla | Acción |
|---|---|
| Escape | Cerrar modal (igual que onClick={onClose}) |
| Tab | Navegar entre: input → iconos → colores → Cancelar → Crear |
| Enter (en input) | Submit si formulario válido |
| Enter (en icono/color) | Seleccionar ese icono/color |
