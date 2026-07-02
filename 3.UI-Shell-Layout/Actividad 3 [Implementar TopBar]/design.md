# Design: Implementar TopBar

## Visual Mapping

| Elemento Stitch (HTML) | Componente React | Token/Clase |
|---|---|---|
| "My Day" título (h2) | `<h1>` prop `title` | `font-display-xl text-display-xl font-bold text-on-surface` |
| "Wednesday, October 25" fecha | `<p>` formateado | `font-body-md text-on-surface-variant` |
| Botón sort (no visible en HTML básico) | `<button>` icono `sort` | `rounded-full hover:bg-surface-container` |
| Botón focus (icono lightbulb) | `<button>` icono `lightbulb` | `rounded-full hover:bg-surface-container` |

## Diagrama de Layout

```text
┌──────────────────────────────────────────────────────┐
│  TopBar (sticky top-0, z-20, glass effect)           │
│                                                        │
│  ┌──────────────────────┐  ┌────────────────────────┐ │
│  │ My Day               │  │  [sort]  [lightbulb]   │ │
│  │ miércoles, 25 octubre│  │                        │ │
│  └──────────────────────┘  └────────────────────────┘ │
│                                                       │
│  ──────── borde inferior sutil (opcional) ─────────   │
├──────────────────────────────────────────────────────┤
│  Contenido del workspace (TaskList, EmptyState, etc.) │
└──────────────────────────────────────────────────────┘
```

## Código Esperado

```tsx
// src/components/layout/TopBar.tsx
export function TopBar({
  title,
  date,
  actions,
}: {
  title: string
  date?: string
  actions?: React.ReactNode
}) {
  const formattedDate = date
    ? new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(date))
    : new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date())

  return (
    <header className="sticky top-0 z-20 bg-surface-container-lowest/80 backdrop-blur-md py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display-xl text-display-xl font-bold text-on-surface">
            {title}
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container transition-colors"
            title="Ordenar"
          >
            <span className="material-symbols-outlined text-on-surface-variant">sort</span>
          </button>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container transition-colors"
            title="Modo enfoque"
          >
            <span className="material-symbols-outlined text-on-surface-variant">lightbulb</span>
          </button>
        </div>
      </div>
    </header>
  )
}
```
