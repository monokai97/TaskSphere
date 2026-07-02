# Proposal: Implementar TopBar

## Problema

Cada stack (My Day, Important, Planned, Tasks) necesita un header que identifique la vista actual. Actualmente no hay ningún componente de encabezado — las páginas skeleton mostrarían contenido sin título ni fecha.

## Solución

Componente `TopBar` reutilizable: sticky header glass con título del stack a la izquierda, fecha formateada, y botones de acción a la derecha.

## Estrategia

- Componente Server Component (no necesita estado cliente) — acepta props para personalización
- Sticky con `position: sticky top-0` y `z-20` para mantenerse visible al hacer scroll
- Fondo semitransparente con backdrop-blur (glass effect) para que el contenido detrás se vea difuso
- Fecha formateada en español: `new Intl.DateTimeFormat('es-ES', { ... })` con día de semana + fecha
- Botones de acción como placeholder funcional (sin lógica aún)

## Impacto

- 1 archivo nuevo: `src/components/layout/TopBar.tsx`
- Sin cambios en colecciones PayloadCMS
- Se consume desde las páginas de stacks (Actividad 5)
