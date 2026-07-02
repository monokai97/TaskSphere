# Actividad 2: Implementar AddListModal — Micro-tareas

## Hito 2.1: Modal overlay y estructura base

### Tarea 2.1.1 — Crear `src/components/lists/AddListModal.tsx`
- Archivo `'use client'` con named export `AddListModal`
- Props: `isOpen: boolean`, `onClose: () => void`, `onSuccess?: (list: List) => void`, `editList?: List | null`
- Si `isOpen === false`, retornar `null` (no renderizar nada en el DOM)
- Si `isOpen === true`, renderizar:
  - Overlay: `<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>`
  - Card container: `<div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-outline-variant/20" onClick={(e) => e.stopPropagation()}>`
- Animar entrada con estado CSS: al montar, overlay `opacity-0 → opacity-100`, card `scale-95 opacity-0 → scale-100 opacity-100`
- Manejar tecla Escape: `useEffect` con `keydown` listener → `onClose`

### Tarea 2.1.2 — Header del modal
- Título: `editList ? "Editar lista" : "Nueva lista"` en `font-headline-md text-headline-md`
- Botón close ×: `<span className="material-symbols-outlined">close</span>` en `text-on-surface-variant hover:text-on-surface`

### Tarea 2.1.3 — Integración con Sidebar
- En `src/components/layout/Sidebar.tsx`:
  - Importar `AddListModal`
  - Estado local `showAddList: boolean`
  - Botón "New List" (existente en el HTML de Sidebar) → `onClick={() => setShowAddList(true)}`
  - Renderizar `<AddListModal isOpen={showAddList} onClose={() => setShowAddList(false)} />`

## Hito 2.2: Formulario con input de nombre + validación Zod

### Tarea 2.2.1 — Estado interno del formulario
```typescript
interface FormState {
  name: string
  icon: string
  color: string | null
  submitError: string | null
}
```
- Inicializar con `editList ? { name: editList.name, icon: editList.icon ?? 'list', color: editList.color ?? '#004ac6', submitError: null } : { name: '', icon: 'list', color: '#004ac6', submitError: null }`
- Resetear estado cuando cambia `isOpen` o `editList` (usar `useEffect` con dependencias)

### Tarea 2.2.2 — Input de nombre
- `<input>` con `autoFocus`, placeholder "Sin título"
- Clases: `w-full text-display-xl-mobile font-display-xl-mobile text-on-surface bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 pb-2`
- `onChange`: actualizar `name` en estado local
- Validación: `name.trim().length > 0` → submit enabled

## Hito 2.3: Selector de iconos (IconGrid)

### Tarea 2.3.1 — Crear array de iconos en constantes
- No crear archivo nuevo; añadir a `src/lib/constants.ts` si existe, o a un bloque `export const LIST_ICONS` en el mismo componente

### Tarea 2.3.2 — Grid de iconos
- Label: "ELEGIR ICONO" en `font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider`
- Grid: `<div className="grid grid-cols-6 gap-2">`
- Mapear `LIST_ICONS` → botones con icono Material Symbol
- Cada botón: `className={icon === selected ? 'text-primary bg-primary-container/10 border-primary' : 'text-on-surface-variant'} p-3 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all`
- `onClick`: setear `icon` en estado local

## Hito 2.4: Selector de color (ColorPicker)

### Tarea 2.4.1 — Círculos de color
- Label: "COLOR DE LA LISTA" mismo estilo que iconos
- Contenedor flex: `<div className="flex items-center gap-3">`
- Mapear `LIST_COLORS` → círculos:
  - `<button className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} onClick={() => setColor(color)}>`
  - Si seleccionado: añadir `ring-2 ring-primary ring-offset-4 scale-110`
- Color puede ser `null` (no forzar selección)

## Hito 2.5: Footer con submit + loading state

### Tarea 2.5.1 — Footer container
- `<div className="px-8 py-6 bg-surface-container-low flex items-center justify-end gap-3">`

### Tarea 2.5.2 — Cancel button
- `<button onClick={onClose} className="px-6 py-2.5 rounded-xl text-on-surface-variant font-semibold hover:bg-surface-container-highest transition-colors">Cancelar</button>`

### Tarea 2.5.3 — Submit button
- Texto: `isPending ? 'Creando...' : editList ? 'Guardar cambios' : 'Crear lista'`
- `disabled={name.trim().length === 0 || isPending}`
- Clases base: `px-6 py-2.5 rounded-xl font-semibold transition-all`
- Estado disabled: `bg-primary/40 text-on-primary/60 cursor-not-allowed`
- Estado enabled: `bg-primary text-on-primary hover:bg-primary-container active:scale-95`
- `onClick={handleSubmit}`

## Hito 2.6: Submit handler + mutations

### Tarea 2.6.1 — Crear `useCreateList` y `useUpdateList` en `src/hooks/useLists.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { List } from '@/payload-types'

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
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
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

### Tarea 2.6.2 — handleSubmit en AddListModal
```typescript
const createList = useCreateList()
const updateList = useUpdateList()
const isPending = editList ? updateList.isPending : createList.isPending

async function handleSubmit() {
  const trimmed = name.trim()
  if (!trimmed) return  // validación rápida

  const payload = { name: trimmed, icon, color: color ?? undefined }

  try {
    if (editList) {
      await updateList.mutateAsync({ id: editList.id, ...payload })
    } else {
      await createList.mutateAsync(payload)
    }
    onClose()
    onSuccess?.(/* list returned from mutation */)
  } catch (err) {
    setSubmitError(err instanceof Error ? err.message : 'Error al crear la lista')
  }
}
```

### Tarea 2.6.3 — Error display
- Si `submitError` no es null, mostrar `<p className="text-label-sm text-error mt-2">{submitError}</p>` en el footer

## Hito 2.7: Animaciones y transiciones

### Tarea 2.7.1 — Animación de entrada
- Usar estado local `animating: 'entering' | 'idle' | 'exiting'`
- Al montar `isOpen=true`: set `animating='entering'`, después 250ms set `animating='idle'`
- Al cerrar: set `animating='exiting'`, setTimeout(onClose real, 200ms)
- Overlay: `opacity-0` → `opacity-100` con `transition-opacity duration-200`
- Card: `scale-95 opacity-0` → `scale-100 opacity-100` con `transition-all duration-250 ease-out`

### Tarea 2.7.2 — Focus trap
- Al abrir modal, autoFocus en input de nombre
- No implementar focus trap completo (fuera de alcance MVP, pero deseable)

## Hito 2.8: Integración final y ESLint

### Tarea 2.8.1 — Probar integración con Sidebar
- Verificar que "New List" button en Sidebar abre modal
- Verificar que crear lista exitosamente la muestra en ListNav sin recargar

### Tarea 2.8.2 — ESLint y type-check
- Ejecutar `pnpm lint` para verificar reglas
- Verificar tipos: asegurar compatibilidad con `List` de `payload-types.ts`
- No warnings de `no-unused-vars` ni `no-explicit-any`
