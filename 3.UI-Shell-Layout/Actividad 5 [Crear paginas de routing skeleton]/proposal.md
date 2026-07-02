# Proposal: Crear páginas de routing skeleton

## Problema

Actualmente solo existe la landing page de PayloadCMS blank template con logo y "Welcome to your new project." No hay rutas para los 4 stacks (My Day, Important, Planned, Tasks), no hay route group compartido que herede el layout de 3 columnas, y la landing page no redirige a la aplicación real.

## Solución

1. **Route group `(stacks)/`**: carpeta compartida con `layout.tsx` que importa Sidebar (ya creada en Act 2), TopBar (Act 3), DetailPanel (Act 1) y renderiza el layout completo. Todas las páginas dentro heredan la estructura de 3 columnas sin repetir código.
2. **4 páginas skeleton**: `my-day/page.tsx`, `important/page.tsx`, `planned/page.tsx`, `tasks/page.tsx`. Cada una renderiza TopBar con título + EmptyState con mensaje contextual.
3. **Landing page redirect**: `/` redirige a `/my-day` con `redirect()` de Next.js.

## Estrategia

- El layout del route group `(stacks)/layout.tsx` renderiza: `<Sidebar />` + `<TopBar />` + `<main>{children}</main>` + `<DetailPanel />`
- Las páginas skeleton son Server Components que solo importan TopBar + EmptyState (que se crea en Fase 4 pero podemos usar un placeholder simple)
- La landing page usa `redirect('/my-day')` de `next/navigation`

## Impacto

- 1 archivo nuevo: `src/app/(frontend)/(stacks)/layout.tsx`
- 4 archivos nuevos: `my-day/page.tsx`, `important/page.tsx`, `planned/page.tsx`, `tasks/page.tsx`
- 1 archivo modificado: `src/app/(frontend)/page.tsx` (reemplazar contenido con redirect)
- Sin cambios en colecciones PayloadCMS
