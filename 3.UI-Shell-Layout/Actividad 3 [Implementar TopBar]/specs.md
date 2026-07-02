# Specs: Implementar TopBar

## Funcionales

1. Cada stack debe mostrar un header con el título de la vista actual y la fecha del día.
2. El header debe mantenerse visible al hacer scroll (sticky).
3. El header debe tener efecto glass (backdrop-blur).
4. Debe incluir botones de acción: sort y focus mode.
5. El componente debe ser reutilizable en los 4 stacks con diferentes títulos.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Server Component | No usar `'use client'` — es un componente puramente presentacional |
| R2 | Props | `title: string` (requerido), `date?: string` (opcional, ISO string), `actions?: React.ReactNode` (opcional) |
| R3 | Default date | Si `date` no se provee, formatear `new Date()` con `Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })` — ej: "miércoles, 25 de octubre" |
| R4 | Sticky | `<header className="sticky top-0 z-20 ...">` |
| R5 | Glass effect | `bg-surface-container-lowest/80 backdrop-blur-md` |
| R6 | Título | `<h1>` con `font-display-xl text-display-xl font-bold text-on-surface` (coincide con prototipo HTML) |
| R7 | Fecha | `<p>` con `font-body-md text-on-surface-variant` |
| R8 | Botón sort | Icono `sort`, `rounded-full hover:bg-surface-container`, tooltip "Ordenar" |
| R9 | Botón focus | Icono `lightbulb`, `rounded-full hover:bg-surface-container`, tooltip "Modo enfoque" |
| R10 | Contenedor | `flex items-center justify-between` con padding `py-6` (no px, el workspace ya tiene padding del layout) |

## Contratos

```tsx
// Uso en página de stack
<TopBar title="My Day" />

// Uso con fecha personalizada
<TopBar title="Planned" date="2026-06-19" />

// Uso con acciones adicionales
<TopBar
  title="Important"
  actions={<button className="...">Custom Action</button>}
/>
```
