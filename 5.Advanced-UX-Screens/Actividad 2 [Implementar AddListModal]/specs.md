# Actividad 2: Implementar AddListModal — Especificación Técnica

## 1. Requisitos Funcionales

### 1.1 Modal Overlay y Estructura
| ID | Requisito | Prioridad |
|---|---|---|
| F1 | Modal se abre con overlay `bg-black/50 backdrop-blur-sm` centrado en la pantalla | Alta |
| F2 | Modal container: `max-w-md bg-surface-container-lowest rounded-xl shadow-2xl` | Alta |
| F3 | Animación de entrada: `scale-95 opacity-0 → scale-100 opacity-100` en 200ms | Alta |
| F4 | Animación de salida: `scale-100 → scale-95 opacity-0` en 200ms antes de desmontar | Alta |
| F5 | Cerrar modal al hacer clic fuera del container (overlay click) | Alta |
| F6 | Cerrar modal al presionar Escape | Alta |
| F7 | Props: `isOpen: boolean`, `onClose: () => void`, `onSuccess?: (list: List) => void`, `editList?: List` | Alta |

### 1.2 Formulario — Input de Nombre
| ID | Requisito | Prioridad |
|---|---|---|
| F8 | Input de texto sin label visible, placeholder "Sin título" | Alta |
| F9 | Estilo: `text-display-xl-mobile font-display-xl-mobile`, solo bottom border | Alta |
| F10 | Focus automático al abrir el modal (autoFocus) | Alta |
| F11 | Validación Zod cliente: `z.string().min(1).max(100).trim()` | Alta |
| F12 | Botón "Crear lista" deshabilitado (`disabled` + `opacity-40 cursor-not-allowed`) cuando input vacío | Alta |
| F13 | Botón se habilita al escribir al menos 1 carácter no-espacio | Alta |
| F14 | Modo edición: input precargado con `editList.name` | Alta |

### 1.3 Selector de Iconos
| ID | Requisito | Prioridad |
|---|---|---|
| F15 | Grid de 12 iconos Material Symbols en 6 columnas | Alta |
| F16 | Iconos predefinidos: `list, shopping_cart, work, fitness_center, school, home, favorite, flight, palette, restaurant, savings, more_horiz` | Alta |
| F17 | Estado default: primer icono (`list`) seleccionado | Alta |
| F18 | Estado seleccionado: `text-primary bg-primary-container/10 border-primary` | Alta |
| F19 | Modo edición: icono precargado desde `editList.icon` | Alta |
| F20 | Solo un icono seleccionable a la vez (radio behavior) | Alta |

### 1.4 Selector de Color
| ID | Requisito | Prioridad |
|---|---|---|
| F21 | 5 círculos de color de 32x32px (`w-8 h-8 rounded-full`) | Alta |
| F22 | Colores: `#004ac6` (primary), `#735c00` (secondary), `#4e5566` (tertiary), `#003ea8` (blue-dark), `#574500` (gold) | Alta |
| F23 | Estado seleccionado: `ring-2 ring-primary ring-offset-4 scale-110` | Alta |
| F24 | Color default: primero (`#004ac6` — primary) | Alta |
| F25 | Modo edición: color precargado desde `editList.color` | Alta |
| F26 | Color es opcional — puede no seleccionarse ninguno | Media |

### 1.5 Footer Actions
| ID | Requisito | Prioridad |
|---|---|---|
| F27 | Botón "Cancelar" — ghost style, cierra modal sin acción | Alta |
| F28 | Botón "Crear lista" (o "Guardar cambios" en modo edición) — primary style | Alta |
| F29 | Submit deshabilitado si nombre vacío o solo espacios | Alta |
| F30 | Loading state en botón submit durante la mutación: `isPending` muestra spinner o texto "Creando..." | Alta |

### 1.6 Feedback y Post-Submit
| ID | Requisito | Prioridad |
|---|---|---|
| F31 | Al crear exitosamente: invalidar `['lists']` query, cerrar modal, llamar `onSuccess(list)` | Alta |
| F32 | Al editar exitosamente: invalidar `['lists']` query, cerrar modal, llamar `onSuccess(list)` | Alta |
| F33 | Error en submit: mostrar mensaje de error inline, no cerrar modal | Media |
| F34 | Evitar doble submit: botón deshabilitado mientras `isPending` | Alta |

## 2. Contratos de Datos

### 2.1 Zod Schemas (compartidos)
```typescript
// src/lib/schemas.ts
import { z } from 'zod'

export const CreateListInput = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform(s => s.trim()),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Formato hex inválido')
    .optional(),
})

export type CreateListInput = z.infer<typeof CreateListInput>
```

### 2.2 Iconos Disponibles (constantes)
```typescript
// src/lib/constants.ts
export const LIST_ICONS = [
  'list',
  'shopping_cart',
  'work',
  'fitness_center',
  'school',
  'home',
  'favorite',
  'flight',
  'palette',
  'restaurant',
  'savings',
  'more_horiz',
] as const

export const LIST_COLORS = [
  '#004ac6', // primary
  '#735c00', // secondary
  '#4e5566', // tertiary
  '#003ea8', // blue-dark
  '#574500', // gold
] as const
```

### 2.3 AddListModal Props
```typescript
interface AddListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (list: List) => void
  editList?: List | null  // null = create mode, List = edit mode
}

type ModalMode = 'create' | 'edit'

// Estado interno del formulario
interface AddListFormState {
  name: string
  icon: string
  color: string | null
  errors: {
    name?: string
  }
}
```

### 2.4 Payload List Type (de `src/payload-types.ts`)
```typescript
interface List {
  id: number
  name: string
  icon?: string | null
  color?: string | null
  guestId: string
  isDefault?: boolean | null
  sortOrder?: number | null
  updatedAt: string
  createdAt: string
}
```

### 2.5 API Contract
```
POST /api/lists
Headers: x-guest-id (automático desde Iron-Session)
Body: { name: string, icon?: string, color?: string }
Response 201: { id, name, icon, color, guestId, isDefault, sortOrder, ... }
Error 400: { error: { fieldErrors: { name?: string[] } } }
Error 401: { error: 'No session' }

PATCH /api/lists/{id}
Headers: x-guest-id
Body: { name?: string, icon?: string, color?: string }
Response 200: List (updated)
Error 404: { error: 'List not found' }
```

## 3. Estados de la UI

```
Modal cerrado:  (no renderizado — isOpen=false)

Modal abierto:
┌──────────────────────────────────────────┐
│  [overlay: bg-black/50 backdrop-blur-sm] │
│  ┌────────── max-w-md ──────────────────┐│
│  │  Nueva lista                       × ││
│  │                                       ││
│  │  [      Sin título        ]           ││  ← input display-xl-mobile
│  │                                       ││
│  │  ELEGIR ICONO                         ││
│  │  [list][cart][work][fitness][...]  ││
│  │                                       ││
│  │  COLOR DE LA LISTA                    ││
│  │  (●) (○) (○) (○) (○)                ││  ← 5 círculos
│  │                                       ││
│  │  ┌────────┬──────────┐               ││
│  │  │Cancelar│Crear lista│               ││
│  │  └────────┴──────────┘               ││
│  └───────────────────────────────────────┘│
└──────────────────────────────────────────┘

Loading state (submit):
│  │  ┌────────┬──────────────────┐        ││
│  │  │Cancelar│⏳ Creando...     │        ││
│  │  └────────┴──────────────────┘        ││

Error state (submit):
│  │  ⚠️ Error al crear la lista          ││  ← toast o inline error
│  │  ┌────────┬──────────┐               ││
│  │  │Cancelar│Crear lista│               ││
│  │  └────────┴──────────┘               ││

Edit mode:
│  │  Editar lista                      × ││
│  │  [   Trabajo          ]              ││  ← precargado
│  │  ... icono y color precargados ...   ││
│  │  ┌────────┬──────────────┐          ││
│  │  │Cancelar│Guardar cambios│          ││
│  │  └────────┴──────────────┘          ││
```
