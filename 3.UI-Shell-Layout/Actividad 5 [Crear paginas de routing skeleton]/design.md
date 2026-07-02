# Design: Crear páginas de routing skeleton

## Visual Mapping

| Ruta | Título TopBar | Icono EmptyState | Mensaje EmptyState |
|---|---|---|---|
| `/my-day` | "My Day" | `sunny` | "This is your My Day — tasks added here appear when you need them most." |
| `/important` | "Important" | `star` | "Flag tasks as important to see them here." |
| `/planned` | "Planned" | `calendar_month` | "Tasks with a due date will show up here." |
| `/tasks` | "Tasks" | `task_alt` | "All your tasks live here." |

## Diagrama de Routing

```text
(Root)
src/app/(frontend)/
├── page.tsx              → redirect('/my-day')
├── layout.tsx            → providers + flex container (existente)
└── (stacks)/
    ├── layout.tsx        → Sidebar + main{children} + DetailPanel
    ├── my-day/page.tsx   → TopBar("My Day") + EmptyState(sunny)
    ├── important/page.tsx→ TopBar("Important") + EmptyState(star)
    ├── planned/page.tsx  → TopBar("Planned") + EmptyState(calendar)
    └── tasks/page.tsx    → TopBar("Tasks") + EmptyState(task)
```

## Integración con layout existente

El layout `(frontend)/layout.tsx` ya tiene el flex container con 3 columnas. El layout `(stacks)/layout.tsx` renderiza las partes dentro de ese flex:

```tsx
// (stacks)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { DetailPanel } from '@/components/layout/DetailPanel'

export default function StacksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
      <DetailPanel />
    </>
  )
}
```

## Landing page modificada

```tsx
// src/app/(frontend)/page.tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/my-day')
}
```

## EmptyState placeholder (para crear ahora)

```tsx
// src/components/ui/EmptyState.tsx — Server Component
interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">
        {icon}
      </span>
      <h2 className="font-heading-sm text-on-surface">{title}</h2>
      <p className="font-body-md text-on-surface-variant max-w-sm">{description}</p>
    </div>
  )
}
```

## Tipos

```ts
// Ningún tipo nuevo de PayloadCMS — solo props de componentes UI existentes
interface TopBarProps {
  title: string
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate'
  focus?: boolean
}

interface EmptyStateProps {
  icon: string
  title: string
  description: string
}
```
