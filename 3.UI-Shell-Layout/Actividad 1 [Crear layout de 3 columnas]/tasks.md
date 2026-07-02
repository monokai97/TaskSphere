# Tasks: Crear layout de 3 columnas

## Dependencias
- Fase 2 completada (layout.tsx tiene QueryProvider + ThemeProvider)
- Tailwind tokens configurados (sidebar-width, detail-panel-width, container-padding, glass-panel class)

---

## Hito 1.1: Refactorizar layout raíz

- [ ] Abrir `src/app/(frontend)/layout.tsx`
- [ ] Agregar `<div className="flex min-h-screen">` como contenedor principal dentro de ThemeProvider
- [ ] Agregar `<aside className="w-sidebar-width h-screen sticky top-0 overflow-y-auto glass-panel hidden lg:flex flex-col border-r border-subtle-light dark:border-subtle-dark">` para sidebar
- [ ] Mover `<main>` existente dentro del flex container con clases: `flex-1 min-h-screen overflow-y-auto p-container-padding max-lg:p-container-padding-mobile`
- [ ] Agregar segundo `<aside>` para detail panel: `w-detail-panel-width h-screen sticky top-0 overflow-y-auto glass-panel hidden lg:flex flex-col border-l ...`
- [ ] Verificar que `{children}` está dentro del `<main>`

## Hito 1.2: Background decoration

- [ ] Agregar dentro de ThemeProvider, antes del flex container:
  ```tsx
  <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
  <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10" />
  ```
- [ ] Verificar que `pointer-events-none` permite interactuar con elementos sobrepuestos
- [ ] Verificar que `-z-10` mantiene los círculos detrás de todo el contenido

## Hito 1.3: Componente GlassPanel

- [ ] Crear directorio `src/components/common/` si no existe
- [ ] Crear `src/components/common/GlassPanel.tsx` (Server Component — no necesita 'use client')
- [ ] Exportar función `GlassPanel` con props `children: React.ReactNode` y `className?: string`
- [ ] Renderizar `<div className={`glass-panel ${className}`}>{children}</div>`

## Hito 1.4: Componente DetailPanel

- [ ] Crear directorio `src/components/layout/` si no existe
- [ ] Crear `src/components/layout/DetailPanel.tsx`
- [ ] Primera línea: `'use client'` (necesita estado para open/close y evento onClick del botón)
- [ ] Props: `children: React.ReactNode`, `open?: boolean` (default false), `onClose?: () => void`, `className?: string`
- [ ] Renderizar `<aside>` con clases responsive: visible en lg:flex, condicional con open state
- [ ] Botón de cierre (X) con `material-symbols-outlined` icon `close`, visible solo en mobile (`lg:hidden`)
- [ ] Animación: `animate-slide-in` cuando open=true

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `pnpm dev` inicia sin errores
- [ ] En desktop (>1024px): se ven 3 columnas (sidebar izquierda, workspace central, detail panel derecho)
- [ ] En mobile (<1024px): solo se ve sidebar (oculto si no hay contenido) + workspace full-width
- [ ] Círculos decorativos visibles en el fondo (primary arriba-derecha, secondary abajo-izquierda)
- [ ] GlassPanel aplica backdrop-filter blur en el fondo
- [ ] DetailPanel se oculta/muestra responsive
