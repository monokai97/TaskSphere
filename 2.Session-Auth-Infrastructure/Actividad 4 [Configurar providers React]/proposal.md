# Proposal: Configurar providers React

## Problema

Actualmente la app no tiene estado global. No hay TanStack Query (caché servidor-cliente, optimistic updates), no hay ThemeProvider (modo claro/oscuro), el layout usa metadata genérica de PayloadCMS y no hay estructura de providers anidados para el árbol de componentes.

## Solución

1. **QueryProvider**: Cliente TanStack Query con configuración default (`staleTime: 30s`, `gcTime: 5min`, `retry: 1`). Envuelve todo el árbol para que hooks como `useTasks()` funcionen.
2. **ThemeProvider**: Detección de `prefers-color-scheme`, aplicación de clase `dark` en `<html>`, persistencia en `localStorage`, contexto React para que componentes puedan leer/cambiar el tema.
3. **Layout update**: Reemplazar metadata genérica de PayloadCMS con datos de Task Sphere, anidar providers en orden correcto: `QueryProvider > ThemeProvider > children`.

## Estrategia

- `QueryProvider` es un componente cliente mínimo — solo configura `QueryClient` con opciones sensibles y renderiza `QueryClientProvider`
- `ThemeProvider` usa `matchMedia('(prefers-color-scheme: dark)')` para detectar preferencia del sistema, `localStorage` para override manual, y sincroniza clase `dark` en `<html>` mediante `useEffect`
- Layout mantiene Server Component nature — solo importa los providers como capa de wrapper

## Impacto

- 2 archivos nuevos: `src/providers/QueryProvider.tsx`, `src/providers/ThemeProvider.tsx`
- 1 archivo modificado: `src/app/(frontend)/layout.tsx`
- Sin cambios en colecciones PayloadCMS
- Dependencia: `@tanstack/react-query` instalado (Fase 1 Act 5)
