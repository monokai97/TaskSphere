# Proposal: Implementar MobileNav

## Problema

En mobile (<1024px), la sidebar se oculta (`hidden lg:flex`). No hay forma de navegar entre stacks (My Day, Important, Planned, Tasks) desde dispositivos móviles. Los prototipos de Stitch muestran una bottom navigation bar fija que reemplaza la sidebar en viewports pequeños.

## Solución

Componente `MobileNav`: barra de navegación inferior fija con 4 iconos + label, visible solo en mobile. Los mismos 4 stacks de la sidebar, con estado activo sincronizado.

## Estrategia

- Componente `'use client'` (usa `usePathname()` y `next/link`)
- Posición fija `bottom-0`, ancho completo, altura 64px (h-16)
- Fondo glass semitransparente con borde superior
- Oculto en desktop (`lg:hidden`), visible en mobile
- Estado activo: icono y texto cambian a color primary cuando la ruta coincide

## Impacto

- 1 archivo nuevo: `src/components/layout/MobileNav.tsx`
- Sin cambios en colecciones PayloadCMS
- Se integra en el layout raíz (dentro del flex container, como sibling de las 3 columnas)
