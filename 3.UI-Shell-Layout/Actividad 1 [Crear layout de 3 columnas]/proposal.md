# Proposal: Crear layout de 3 columnas

## Problema

Actualmente el layout raíz (`src/app/(frontend)/layout.tsx`) es un Server Component mínimo con solo `<main>{children}</main>`. No hay estructura de columnas, no hay sidebar, no hay panel de detalle. Los prototipos HTML de Stitch (`2.Stack My Day`) muestran un diseño de 3 columnas con glassmorphism que no tiene equivalente en código.

## Solución

Implementar el layout de 3 columnas de Ethereal Focus:

1. **Sidebar (288px)**: fijo a la izquierda con fondo glass, contiene logo + navegación + listas + perfil
2. **Workspace (flex-1)**: área central donde se renderizan los stacks (My Day, Important, Planned, Tasks) con padding responsive
3. **Detail Panel (384px)**: panel derecho opcional, oculto en mobile, para vistas de detalle de tarea

## Estrategia

- El layout raíz se mantiene como Server Component, pero ahora renderiza la estructura columnar
- `GlassPanel` se extrae como componente reutilizable para sidebar, detail panel y cualquier superficie glass
- `DetailPanel` es un wrapper que acepta children + open state, con botón de cierre y responsive hidden
- Background decoration (círculos blur) se añade como elementos decorativos fijos

## Impacto

- 1 archivo modificado: `src/app/(frontend)/layout.tsx`
- 2 archivos nuevos: `src/components/common/GlassPanel.tsx`, `src/components/layout/DetailPanel.tsx`
- Dependencia: Tailwind tokens `sidebar-width` (288px), `detail-panel-width` (384px), `container-padding` (3rem) deben estar configurados
- Sin cambios en colecciones PayloadCMS
