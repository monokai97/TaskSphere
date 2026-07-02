# Specs: Crear layout de 3 columnas

## Funcionales

1. La aplicación debe mostrar 3 columnas en desktop: sidebar (288px), workspace (flex-1), detail panel opcional (384px).
2. En mobile (>1024px), el detail panel debe ocultarse (solo sidebar + workspace).
3. El sidebar debe ser fijo (sticky) con altura completa y scroll independiente.
4. El workspace debe tener padding responsive: 3rem en desktop, 1rem en mobile.
5. Las superficies glass deben tener backdrop-filter blur(12px) y fondo semitransparente.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Layout raíz Server Component | No usar `'use client'` — solo renderiza estructura HTML |
| R2 | Sidebar | `<aside>` con `w-sidebar-width`, `h-screen`, `sticky top-0`, `overflow-y-auto`, `flex-col`, `glass-panel`, `hidden lg:flex` (oculto en mobile) |
| R3 | Workspace | `<main>` con `flex-1`, `min-h-screen`, `p-container-padding` desktop, `p-container-padding-mobile` mobile (`max-lg:`), `overflow-y-auto` |
| R4 | Detail Panel | `<aside>` con `w-detail-panel-width`, `h-screen`, `sticky top-0`, `overflow-y-auto`, `glass-panel`, `hidden lg:flex`, borde izquierdo `border-l border-subtle-light dark:border-subtle-dark` |
| R5 | Background decoration | 2 divs fixed: top-right con `w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl`, bottom-left con `w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl`. Ambos con `pointer-events-none -z-10` |
| R6 | GlassPanel props | `className?: string`, `children: React.ReactNode`. Renderiza `<div className={`glass-panel ${className}`}>{children}</div>` |
| R7 | DetailPanel props | `children: React.ReactNode`, `open?: boolean` (default false), `onClose?: () => void`, `className?: string`. Botón X en esquina superior derecha. Animación `animate-slide-in` al abrir |
| R8 | Responsive | Sidebar y DetailPanel con `hidden lg:flex`. Workspace full-width en mobile |
| R9 | Providers preservados | El layout debe mantener `QueryProvider > ThemeProvider > estructura columnar > children` |

## Contratos

```tsx
// GlassPanel
<GlassPanel className="p-4">
  contenido con glassmorphism
</GlassPanel>

// DetailPanel
<DetailPanel open={isOpen} onClose={() => setIsOpen(false)}>
  <TaskDetail taskId="..." />
</DetailPanel>

// Layout (estructura esperada)
<QueryProvider>
  <ThemeProvider>
    {/* Background decoration */}
    <div className="fixed top-0 right-0 ..." />
    <div className="fixed bottom-0 left-0 ..." />
    {/* 3 columnas */}
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ...">{children}</main>
      <DetailPanel />
    </div>
  </ThemeProvider>
</QueryProvider>
```
