# Tasks: Implementar TopBar

## Dependencias
- Actividad 1 completada (layout.tsx con workspace `<main>` renderiza children)

---

## Hito 3.1: Estructura TopBar

- [ ] Crear `src/components/layout/TopBar.tsx`
- [ ] Exportar función `TopBar` con props `title: string`, `date?: string`, `actions?: React.ReactNode`
- [ ] Renderizar `<header className="sticky top-0 z-20 bg-surface-container-lowest/80 backdrop-blur-md py-6">`
- [ ] Lado izquierdo: `<h1>` con `font-display-xl text-display-xl font-bold text-on-surface` para el título
- [ ] Lado derecho: contenedor `<div className="flex items-center gap-2">` para botones
- [ ] Fecha formateada debajo del título con `font-body-md text-on-surface-variant mt-1`
- [ ] Usar `Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })` para formateo

## Hito 3.2: Botones de acción

- [ ] Botón sort: `<button>` con icono `sort`, `rounded-full hover:bg-surface-container`, `title="Ordenar"`
- [ ] Botón focus: `<button>` con icono `lightbulb`, `rounded-full hover:bg-surface-container`, `title="Modo enfoque"`
- [ ] Ambos botones sin `onClick` por ahora (placeholder funcional)

## Hito 3.3: Props de personalización

- [ ] Renderizar `{actions}` antes de los botones default si la prop está presente
- [ ] Formatear `date` si se provee, o default a `new Date()` si no
- [ ] El componente debe ser Server Component (sin `'use client'`)

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] TopBar renderiza título + fecha formateada en español
- [ ] Botones sort y lightbulb visibles con hover effect
- [ ] Al hacer scroll, TopBar se mantiene visible (sticky)
- [ ] TopBar tiene efecto glass (backdrop-blur visible en DevTools)
