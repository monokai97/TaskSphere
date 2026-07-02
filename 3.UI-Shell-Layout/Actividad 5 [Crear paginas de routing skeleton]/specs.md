# Specs: Crear páginas de routing skeleton

## Funcionales

1. Las 4 rutas `/my-day`, `/important`, `/planned`, `/tasks` deben existir y cargar el layout de 3 columnas.
2. Cada página debe mostrar el título del stack y un EmptyState con mensaje contextual.
3. Visitar `/` debe redirigir automáticamente a `/my-day`.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Route group | Carpeta `(stacks)` dentro de `(frontend)` con su propio `layout.tsx` |
| R2 | Layout stacks | Renderiza `<Sidebar />`, `<TopBar />`, `<main>{children}</main>`, `<DetailPanel />`. Sidebar ya visible en desktop, TopBar con título dinámico pasado vía props |
| R3 | TopBar título | TopBar solo presentacional; el título se pasa como prop `top={<TopBar title="My Day" />}` no — cada página renderiza `<TopBar title="..." sortBy focus />` como parte de su return, NO en el layout |
| R4 | EmptyState | Placeholder simple: div centrado con icono grande + título + descripción |
| R5 | Redirect | `page.tsx` raíz usa `redirect('/my-day')` de `next/navigation` |
| R6 | Server Components | Las 4 páginas y layout son Server Components (sin `'use client'`) |
| R7 | Rutas exactas | `my-day/page.tsx`, `important/page.tsx`, `planned/page.tsx`, `tasks/page.tsx` dentro de `(stacks)` |

## Contratos

```tsx
// (stacks)/layout.tsx
export default async function StacksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
      <DetailPanel />
    </>
  )
}

// (stacks)/my-day/page.tsx
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MyDayPage() {
  return (
    <>
      <TopBar title="My Day" />
      <EmptyState
        icon="sunny"
        title="This is your My Day"
        description="Tasks added here appear when you need them most."
      />
    </>
  )
}
```
