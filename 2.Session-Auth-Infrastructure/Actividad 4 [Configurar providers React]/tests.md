# Tests: Configurar providers React

## Estrategia

Tests de integración y visuales para verificar que los providers funcionan correctamente en el navegador.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Tipos de TanStack Query, React context, y layout compilan

### 2. Renderizado inicial

```bash
pnpm dev
```
- **Criterio:** Servidor inicia sin errores
- **Verifica:** Layout raíz compila correctamente con providers anidados

### 3. Test de providers (navegador manual)

| Paso | Resultado esperado |
|---|---|
| Abrir `http://localhost:3000` | Página se renderiza, title "Task Sphere" |
| DevTools > React > Components | `QueryClientProvider` y `ThemeProvider` en el árbol |
| DevTools > Console | Sin errores de hydration o runtime |
| DevTools > Elements > `<html>` | Sin clase `dark` si el sistema está en modo claro |

### 4. Test de tema (navegador manual)

| Paso | Resultado esperado |
|---|---|
| Ejecutar en console: `localStorage.setItem('theme', 'dark'); location.reload()` | `<html>` tiene clase `dark`, fondo oscuro |
| Ejecutar en console: `localStorage.setItem('theme', 'light'); location.reload()` | `<html>` sin clase `dark`, fondo claro |
| Eliminar `localStorage.setItem('theme')` y recargar | Tema sigue preferencia del sistema (`matchMedia`) |
| Cambiar preferencia del sistema (Windows: Config > Personalización > Colores) | Tema cambia en vivo si theme='system' |

### 5. Test de TanStack Query (con componente temporal)

Crear `src/app/(frontend)/test-query/page.tsx`:

```tsx
'use client'
import { useQuery } from '@tanstack/react-query'

export default function TestQuery() {
  const { data, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: () => fetch('/api/session').then(r => r.json()),
  })
  if (isLoading) return <p>Loading...</p>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

Navegar a `/test-query`:
- [ ] Muestra "Loading..." inicialmente
- [ ] Luego muestra JSON de la sesión (debe funcionar GET /api/session)
- [ ] Eliminar `test-query/` después de verificar

### 6. Test de `useTheme` hook

Crear `src/app/(frontend)/test-theme/page.tsx`:

```tsx
'use client'
import { useTheme } from '@/providers/ThemeProvider'

export default function TestTheme() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

Navegar a `/test-theme`:
- [ ] Botón "Dark" aplica clase dark y persiste en localStorage
- [ ] Botón "Light" quita clase dark
- [ ] Botón "System" vuelve a preferencia del sistema
- [ ] Eliminar `test-theme/` después de verificar
