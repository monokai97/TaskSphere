# Tasks: Implementar Sidebar

## Dependencias
- Actividad 1 completada (layout.tsx tiene `<aside>` sidebar listo)
- `next/link` y `next/navigation` disponibles (Next.js 16)

---

## Hito 2.1: Estructura del Sidebar

- [ ] Crear `src/components/layout/Sidebar.tsx`
- [ ] Primera línea: `'use client'`
- [ ] Importar `Link from 'next/link'` y `usePathname from 'next/navigation'`
- [ ] Definir array `NAV_ITEMS` con 4 objetos: href, label, icon
- [ ] Exportar función `Sidebar` sin props
- [ ] Renderizar logo: contenedor flex con icono `blur_on` en caja primary + "Ethereal Focus" + "Stay productive"
- [ ] Renderizar navegación: map sobre `NAV_ITEMS`, cada uno como `<Link>` con Material Symbol + label
- [ ] Usar `usePathname()` para comparar con `item.href` y aplicar estado activo: `bg-primary-container/10 text-primary font-semibold border-l-4 border-primary`
- [ ] Items inactivos: `text-on-surface-variant hover:bg-surface-variant/50 transition-all duration-200`

## Hito 2.2: Sección Lists dinámica

- [ ] Agregar sección "Lists" con label `font-label-sm uppercase tracking-wider`
- [ ] Renderizar 3 skeleton items animados: `w-full h-10 bg-surface-container-high rounded-lg animate-pulse`
- [ ] Nota: La integración real con `useLists()` se completa en Actividad 6 — por ahora solo skeleton

## Hito 2.3: Botón New List

- [ ] Agregar botón `<button>` full-width con `bg-primary text-white rounded-xl`
- [ ] Icono `add` + texto "New List"
- [ ] Placeholder: función vacía `onClick={() => {}}`
- [ ] Hover: `bg-primary-container`, active: `active:scale-[0.98]`

## Hito 2.4: Footer del Sidebar

- [ ] Sección footer con `mt-auto border-t`
- [ ] Avatar circular placeholder: `w-10 h-10 rounded-full bg-surface-container-high` con icono `person`
- [ ] Nombre "Guest" con `font-body-md font-semibold`
- [ ] Link Settings: `<Link href="/settings">` con icono `settings`
- [ ] Link Help: `<Link href="/help">` con icono `help`
- [ ] Ambos links con hover state consistente

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] Sidebar se renderiza dentro del layout de 3 columnas
- [ ] Logo visible con icono blur_on y texto "Ethereal Focus"
- [ ] Navegación con 4 links funcionales (click navega a ruta)
- [ ] Item activo (según URL actual) tiene highlight primary
- [ ] 3 skeleton items visibles en sección Lists
- [ ] Botón "New List" visible y clickeable (sin acción aún)
- [ ] Footer visible con avatar, "Guest", Settings y Help links
