# Tasks: Implementar MobileNav

## Dependencias
- Actividad 1 completada (layout raíz con flex container)
- `next/link` y `next/navigation` disponibles

---

## Hito 4.1: Estructura MobileNav

- [ ] Crear `src/components/layout/MobileNav.tsx`
- [ ] Primera línea: `'use client'`
- [ ] Importar `Link from 'next/link'` y `usePathname from 'next/navigation'`
- [ ] Definir array `NAV_ITEMS` con 4 objetos: href, label, icon
- [ ] Exportar función `MobileNav` sin props
- [ ] Renderizar `<nav className="fixed bottom-0 left-0 w-full h-16 z-50 lg:hidden bg-surface/80 backdrop-blur-md border-t border-subtle-light dark:border-subtle-dark">`
- [ ] Contenedor interno: `flex items-center justify-around h-full px-4`
- [ ] 4 `<Link>` con `flex flex-col items-center gap-0.5 flex-1 py-1`

## Hito 4.2: Navegación activa

- [ ] Usar `usePathname()` para obtener ruta actual
- [ ] Comparar `pathname === item.href` para determinar estado activo
- [ ] Tab activo: icono `text-primary` con `fontVariationSettings: "'FILL' 1"`, label `text-primary font-semibold`
- [ ] Tab inactivo: icono `text-on-surface-variant` con `fontVariationSettings: "'FILL' 0"`, label `text-on-surface-variant`

## Integración en layout

- [ ] Importar `MobileNav` en `src/app/(frontend)/layout.tsx`
- [ ] Renderizar `<MobileNav />` después del flex container (no dentro)

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] En mobile (<1024px): MobileNav visible en la parte inferior
- [ ] En desktop (>1024px): MobileNav oculto (display: none)
- [ ] 4 tabs con iconos y labels correctos
- [ ] Click en cada tab navega a la ruta correspondiente
- [ ] Tab activo resaltado con color primary
- [ ] Fondo glass semitransparente con backdrop-blur
