# Specs: Implementar Sidebar

## Funcionales

1. La sidebar debe mostrar el logo "Ethereal Focus" con icono `blur_on`.
2. La sidebar debe tener 4 enlaces de navegación: My Day, Important, Planned, Tasks.
3. El enlace de la página activa debe resaltarse con fondo primary/10, texto primary, y borde izquierdo primary.
4. La sidebar debe mostrar las listas del guest obtenidas dinámicamente desde PayloadCMS.
5. Mientras las listas cargan, debe mostrar 3 skeleton items.
6. Debe tener un botón "New List" (placeholder).
7. El footer debe mostrar avatar circular + nombre "Guest" + enlaces Settings y Help.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Componente cliente | `'use client'` en primera línea |
| R2 | Logo | Icono `blur_on` con FILL=1 en contenedor `w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white`. Texto "Ethereal Focus" con `font-headline-md font-bold text-primary`. Subtítulo "Stay productive" con `font-label-sm text-on-surface-variant` |
| R3 | Nav links | Usar `next/link` con href: `/my-day`, `/important`, `/planned`, `/tasks` |
| R4 | Estado activo | `usePathname()` de `next/navigation` para detectar ruta activa. Item activo: `bg-primary-container/10 text-primary font-semibold border-l-4 border-primary`. Inactivo: `text-on-surface-variant hover:bg-surface-variant/50` |
| R5 | Iconos nav | My Day: `sunny`, Important: `star`, Planned: `calendar_month`, Tasks: `task_alt` |
| R6 | Sección Lists | Título "Lists" con `font-label-sm text-on-surface-variant uppercase tracking-wider px-4 pt-6 pb-2`. Usar `useLists()` hook |
| R7 | Loading skeleton | 3 items con `w-full h-10 bg-surface-container-high rounded-lg animate-pulse` |
| R8 | Lista item | `<Link>` con icono (desde `list.icon`) + nombre. Clase hover consistente con nav |
| R9 | New List button | Botón `<button>` full-width: `w-full py-2.5 px-4 bg-primary text-white rounded-xl font-body-md font-semibold flex items-center justify-center gap-2`. Icono `add`. Placeholder: `onClick={() => {}}` |
| R10 | Footer | Avatar: `w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center` con icono `person`. Nombre "Guest" (`font-body-md font-semibold`). Links: Settings (icono `settings`, href `/settings`), Help (icono `help`, href `/help`) |
| R11 | Separadores | `border-t border-subtle-light dark:border-subtle-dark` entre nav y footer y entre avatar y links |
| R12 | Scroll | Sidebar completa con `overflow-y-auto` y `custom-scrollbar` |

## Contratos

```tsx
<Sidebar />
// Sin props — el componente se auto-configura con usePathname() y useLists()
```
