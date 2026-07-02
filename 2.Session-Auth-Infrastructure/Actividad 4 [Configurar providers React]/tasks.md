# Tasks: Configurar providers React

## Dependencias
- `@tanstack/react-query` instalado (Fase 1, Actividad 5)
- `src/providers/` directory existe

---

## Hito 4.1: Crear QueryProvider

- [ ] Crear directorio `src/providers/` si no existe
- [ ] Crear `src/providers/QueryProvider.tsx`
- [ ] Primera línea: `'use client'`
- [ ] Importar `{ QueryClient, QueryClientProvider } from '@tanstack/react-query'`
- [ ] Importar `{ useState } from 'react'` (para lazy initialization del QueryClient)
- [ ] Exportar función `QueryProvider({ children }: { children: React.ReactNode })`
- [ ] Crear `QueryClient` con `useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, gcTime: 300_000, retry: 1 } } }))`
- [ ] Renderizar `<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>`

## Hito 4.2: Crear ThemeProvider

- [ ] Crear `src/providers/ThemeProvider.tsx`
- [ ] Primera línea: `'use client'`
- [ ] Definir tipo `Theme = 'light' | 'dark' | 'system'`
- [ ] Definir interfaz `ThemeContextValue { theme: Theme; setTheme: (theme: Theme) => void }`
- [ ] Crear `ThemeContext` con `createContext<ThemeContextValue>(...)`, valores default
- [ ] Exportar `useTheme()` hook que retorna `useContext(ThemeContext)`
- [ ] Implementar función `getInitialTheme()`: lee `localStorage`, fallback a `'system'`
- [ ] Implementar función `resolveTheme(theme)`: 'system' → `matchMedia`, else comparación directa
- [ ] En componente `ThemeProvider`: estado `theme`, estado `mounted`, dos useEffects (uno para init, otro para sync DOM + localStorage)
- [ ] Listener de `matchMedia` change cuando theme es 'system'
- [ ] Provider envuelve children con `ThemeContext.Provider`

## Hito 4.3: Integrar en layout raíz

- [ ] Abrir `src/app/(frontend)/layout.tsx`
- [ ] Cambiar metadata: `title: 'Task Sphere'`, `description: 'Task Sphere — Gestión de tareas simple y elegante'`
- [ ] Importar `QueryProvider` y `ThemeProvider` desde `@/providers/...`
- [ ] Envolver `{children}` en `<QueryProvider><ThemeProvider>{children}</ThemeProvider></QueryProvider>`
- [ ] Cambiar `<html lang="en">` a `<html lang="es">`
- [ ] Agregar `suppressHydrationWarning` en `<html>` (evita warning por clase dark)

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `pnpm dev` inicia sin errores
- [ ] En consola del navegador: no hay errores de hidratación
- [ ] En `<html>` tag en DevTools: no hay clase `dark` si el sistema está en modo claro
- [ ] Cambiar `localStorage.setItem('theme', 'dark')` y recargar: `<html>` tiene clase `dark`
- [ ] En React DevTools: aparecen `QueryClientProvider` y `ThemeProvider` en el árbol
- [ ] Layout muestra "Task Sphere" en el title de la pestaña
