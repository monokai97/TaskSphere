# Proposal: Implementar Sidebar

## Problema

El layout de 3 columnas tiene un `<aside>` vacío para la sidebar. No hay componente de navegación: sin logo, sin enlaces a los stacks, sin listas dinámicas, sin perfil de usuario. El prototipo HTML `2.Stack My Day` muestra una sidebar completa con glassmorphism, navegación principal, listas, y footer que debe replicarse fielmente.

## Solución

Componente `Sidebar` que replica el prototipo Stitch:

1. **Logo + branding**: icono `blur_on` en contenedor primary rounded-xl + texto "Ethereal Focus" + subtítulo
2. **Navegación principal**: 4 links (My Day, Important, Planned, Tasks) con Material Symbols, estado activo con highlight primary
3. **Listas dinámicas**: sección "Lists" que renderiza datos del hook `useLists()` (loading → skeleton, datos → icono+nombre, vacío → oculto)
4. **New List button**: botón primario placeholder (Fase 5 implementa el modal)
5. **Footer**: avatar circular placeholder, nombre "Guest", enlaces Settings + Help

## Estrategia

- Componente `'use client'` (usa hooks de navegación y TanStack Query)
- Navegación con `next/link` y `usePathname()` para estado activo
- Listas consumen `useLists()` con skeleton loading state
- Footer con links a `/settings` y `/help` (páginas que se crean en Fase 5-6)

## Impacto

- 1 archivo nuevo: `src/components/layout/Sidebar.tsx`
- Dependencia: `useLists()` hook (Actividad 6) — hasta entonces, el Sidebar funciona con skeleton
- Sin cambios en colecciones PayloadCMS
