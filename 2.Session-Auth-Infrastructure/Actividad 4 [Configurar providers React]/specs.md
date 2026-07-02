# Specs: Configurar providers React

## Funcionales

1. La app debe tener TanStack Query configurado globalmente para caching y mutations.
2. La app debe detectar la preferencia de tema del sistema (claro/oscuro) y aplicarla automáticamente.
3. El usuario debe poder sobrescribir el tema manualmente, y la preferencia debe persistir entre sesiones.
4. El layout raíz debe tener metadata correcta: title "Task Sphere", description relevante.
5. El layout debe soportar Server Components como hijos (los providers son solo client wrappers).

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | QueryProvider 'use client' | Marcar con `'use client'` en la primera línea |
| R2 | QueryClient defaults | `staleTime: 30_000` (30s), `gcTime: 300_000` (5min), `retry: 1` |
| R3 | Sin devtools | No incluir `ReactQueryDevtools` en producción |
| R4 | ThemeProvider 'use client' | Marcar con `'use client'` |
| R5 | Detección sistema | `window.matchMedia('(prefers-color-scheme: dark)')` |
| R6 | Persistencia | `localStorage.setItem('theme', value)` al cambiar |
| R7 | Inicialización | Leer `localStorage` primero; si no hay, usar preferencia del sistema |
| R8 | Sincronización DOM | `document.documentElement.classList.toggle('dark', isDark)` en useEffect |
| R9 | Context expuesto | `{ theme: 'light' | 'dark' | 'system', setTheme: (t) => void }` |
| R10 | Layout metadata | `title: 'Task Sphere'`, `description: 'Task management app'` |
| R11 | Orden providers | `QueryProvider` debe envolver a `ThemeProvider` (para que ThemeProvider pueda usar TanStack Query en el futuro) |
| R12 | Layout Root | `<html lang="es">` (idioma default), `suppressHydrationWarning` para evitar warning de clase dark |
| R13 | Provider dir | `src/providers/` debe contener ambos archivos |

## Contratos

```tsx
// Uso esperado en componentes
'use client'
import { useTheme } from '@/providers/ThemeProvider'

function ThemeButton() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    {theme}
  </button>
}
```

```tsx
// Layout raíz esperado
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```
