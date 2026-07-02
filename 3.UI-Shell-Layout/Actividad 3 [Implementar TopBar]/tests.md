# Tests: Implementar TopBar

## Estrategia

Tests visuales de renderizado y comportamiento sticky.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Props tipadas correctamente

### 2. Renderizado visual

Crear temporalmente una página de test y navegar a ella:

```tsx
// src/app/(frontend)/test-topbar/page.tsx
import { TopBar } from '@/components/layout/TopBar'

export default function TestTopBar() {
  return (
    <div>
      <TopBar title="My Day" />
      <TopBar title="Important" date="2026-06-19" />
      <TopBar
        title="Custom"
        actions={<button className="px-3 py-1 bg-primary text-white rounded-lg">Action</button>}
      />
    </div>
  )
}
```

| Verificación | Método |
|---|---|
| Título "My Day" visible | Texto renderizado como h1 |
| Fecha formateada | "jueves, 19 de junio" o similar |
| Botón sort | Icono `sort` presente |
| Botón focus | Icono `lightbulb` presente |
| Custom action | Botón "Action" renderizado antes de sort/focus |
| Efecto glass | DevTools: `backdrop-filter: blur(16px)` en header |

Eliminar `test-topbar/` después.

### 3. Test sticky

- [ ] Agregar contenido alto después de TopBar (ej: 50 divs con `h-20`)
- [ ] Hacer scroll hacia abajo
- [ ] TopBar permanece fijo en top-0
- [ ] Contenido detrás se ve borroso por backdrop-blur
- [ ] DevTools: position: sticky, z-index: 20

### 4. Test de fecha

| Input `date` | Output esperado |
|---|---|
| `undefined` | Fecha actual formateada |
| `"2026-01-01"` | "jueves, 1 de enero" |
| `"2026-12-25"` | "viernes, 25 de diciembre" |

### 5. Test responsive

- [ ] TopBar debe mantener estructura en mobile (título arriba, botones a la derecha)
- [ ] No debe romper el layout en viewports pequeños
- [ ] Padding `py-6` consistente
