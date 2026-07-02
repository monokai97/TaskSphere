# Specs: Implementar MobileNav

## Funcionales

1. En viewports menores a 1024px, debe mostrarse una barra de navegación inferior con 4 iconos.
2. Cada icono debe navegar al stack correspondiente (My Day, Important, Planned, Tasks).
3. El stack actual debe resaltarse con color primary.
4. En desktop (>=1024px), la barra debe ocultarse.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Componente cliente | `'use client'` en primera línea |
| R2 | Posición | `<nav className="fixed bottom-0 left-0 w-full h-16 z-50 lg:hidden ...">` |
| R3 | Fondo | `bg-surface/80 backdrop-blur-md border-t border-subtle-light dark:border-subtle-dark` |
| R4 | Layout | `flex items-center justify-around px-4` |
| R5 | Botones | 4 elementos `<Link>` con icono + label, cada uno `flex flex-col items-center gap-0.5 flex-1` |
| R6 | Iconos | `sunny` (My Day), `star` (Important), `calendar_month` (Planned), `task_alt` (Tasks) |
| R7 | Labels | Texto `font-label-sm text-[10px]` (label pequeña debajo del icono) |
| R8 | Estado activo | `usePathname()` — si `pathname === href`: icono `text-primary`, label `text-primary font-semibold`. Si no: `text-on-surface-variant` |
| R9 | Rutas | `/my-day`, `/important`, `/planned`, `/tasks` |
| R10 | Safe area | `pb-safe` o `pb-[env(safe-area-inset-bottom)]` para notch de iPhone |

## Contratos

```tsx
// Uso en layout raíz
<MobileNav />

// Sin props — auto-configurado con usePathname()
```
