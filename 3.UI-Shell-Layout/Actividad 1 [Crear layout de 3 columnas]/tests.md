# Tests: Crear layout de 3 columnas

## Estrategia

Tests visuales y responsive en navegador. El layout es puramente estructural — no hay lógica de negocio que testear con unit tests.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Componentes compilan con tipos de React y Next.js

### 2. Renderizado inicial

```bash
pnpm dev
```
- **Criterio:** Servidor inicia sin errores
- **Verifica:** Layout raíz compila con la estructura de 3 columnas

### 3. Test visual desktop (>1024px)

| Verificación | Método |
|---|---|
| 3 columnas visibles | DevTools > Elements: `flex` container con 3 hijos directos |
| Sidebar 288px | Computed style: width = 288px |
| Detail panel 384px | Computed style: width = 384px |
| Workspace flex-1 | Computed style: flex-grow = 1 |
| Padding workspace 3rem | Computed style: padding = 48px (3rem) |
| Glass effect en sidebar | DevTools: backdrop-filter: blur(12px) presente |
| Blur circles visibles | Scroll down: círculo secondary en bottom-left visible |

### 4. Test responsive (<1024px)

- [ ] Redimensionar navegador a <1024px de ancho
- [ ] Sidebar debe ocultarse (display: none)
- [ ] Workspace debe ocupar todo el ancho
- [ ] Detail panel debe ocultarse (display: none)
- [ ] Padding workspace debe ser 1rem (16px)

### 5. Test de GlassPanel

Crear `src/app/(frontend)/test-glass/page.tsx` temporal:

```tsx
import { GlassPanel } from '@/components/common/GlassPanel'

export default function TestGlass() {
  return (
    <div className="p-8">
      <GlassPanel className="p-6">
        <h2 className="font-headline-md">Glass Panel Test</h2>
        <p className="font-body-md text-on-surface-variant mt-2">
          This surface should have backdrop-blur effect
        </p>
      </GlassPanel>
    </div>
  )
}
```

- [ ] Navegar a `/test-glass`: panel con glassmorphism visible
- [ ] Verificar backdrop-filter en DevTools
- [ ] Eliminar `test-glass/` después

### 6. Test de DetailPanel

Crear `src/app/(frontend)/test-detail/page.tsx` temporal:

```tsx
'use client'
import { DetailPanel } from '@/components/layout/DetailPanel'
import { useState } from 'react'

export default function TestDetail() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle Detail</button>
      <DetailPanel open={open} onClose={() => setOpen(false)}>
        <p className="p-4">Detail panel content</p>
      </DetailPanel>
    </div>
  )
}
```

- [ ] Botón toggle: abre/cierra el panel
- [ ] Botón X (visible en mobile): cierra el panel
- [ ] Animación slide-in al abrir
- [ ] Eliminar `test-detail/` después
