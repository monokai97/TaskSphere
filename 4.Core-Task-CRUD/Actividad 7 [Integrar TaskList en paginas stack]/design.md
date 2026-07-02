# Design: Mapeo UI → CMS — Integración de Stacks

## 1. Visual Mapping: Ruta → Componentes → Colección Payload

| Ruta | Título Stack | listName | Colección Payload | Filtro |
|---|---|---|---|---|
| `/my-day` | "My Day" | `"My Day"` | `tasks` + `lists` | `list.id = lists.find(name="My Day").id` |
| `/important` | "Important" | `"Important"` | `tasks` + `lists` | `list.id = lists.find(name="Important").id` |
| `/planned` | "Planned" | `"Planned"` | `tasks` + `lists` | `list.id = lists.find(name="Planned").id` |
| `/tasks` | "Tasks" | `"Tasks"` | `tasks` + `lists` | `list.id = lists.find(name="Tasks").id` |

## 2. Diagrama de Árbol de Componentes por Stack

```mermaid
graph TD
    subgraph "StacksLayout (layout.tsx)"
        SID[Sidebar]
        MAIN["<main>"]
    end

    subgraph "Cada Página Stack"
        MAIN --> TB[TopBar]
        MAIN --> SS[StackShell<br/>'use client']
    end

    subgraph "StackShell (nuevo)"
        SS --> UL[useLists hook]
        UL -->|data.docs| FIND[find list by name]
        FIND -->|list.id| TL[TaskList]
        FIND -->|list.id + listName| ATB[AddTaskBar]
        TL --> UT[useTasks hook]
    end

    subgraph "Sidebar (existente)"
        SID --> NAV[NAV_ITEMS]
        NAV -->|usePathname| ACTIVE[Active state]
    end
```

## 3. Flujo de Datos: Stack → PayloadCMS

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as Página Stack
    participant SS as StackShell
    participant UL as useLists
    participant UT as useTasks
    participant API as API Routes
    participant PC as PayloadCMS

    U->>P: Navega a /my-day
    P->>SS: Renderiza con listName="My Day"
    
    Note over SS: === Descubrir Lista ===
    SS->>UL: useLists()
    UL->>API: GET /api/lists
    API->>PC: payload.find('lists', { guestId })
    PC-->>API: { docs: [{ id:1, name:"My Day" }, ...] }
    API-->>UL: Response
    UL-->>SS: data.docs
    
    SS->>SS: docs.find(l => l.name === "My Day")
    Note right of SS: listId = 1
    
    Note over SS: === Cargar Tareas ===
    SS->>TL: render <TaskList listId={1} />
    TL->>UT: useTasks({ listId: 1 })
    UT->>API: GET /api/tasks?list=1
    API->>PC: payload.find('tasks', { where: { guestId, list:1 } })
    PC-->>API: { docs: [tasks de My Day] }
    API-->>UT: Response
    
    alt Loading
        TL-->>U: Skeleton loading
    end
    
    alt Data
        TL-->>U: TaskItem × N
    end
    
    alt Empty
        TL-->>U: EmptyState "This is your My Day"
    end
    
    Note over SS: === Crear Tarea ===
    SS->>ATB: render <AddTaskBar listId={1} listName="My Day" />
    U->>ATB: Escribe título + Enter
    ATB->>API: POST /api/tasks { title, list: "1" }
    API->>PC: payload.create('tasks', { ...data })
    PC-->>API: 201 Created
    API-->>ATB: task
    ATB-->>U: Input limpio
    Note over UT: invalidateQueries(['tasks'])
    TL-->>U: Nueva tarea visible
```

## 4. Mapa de Navegación entre Stacks

```mermaid
graph LR
    LANDING[/ → redirect] --> MYDAY[/my-day]
    
    MYDAY -->|sidebar| IMP[/important]
    MYDAY -->|sidebar| PLAN[/planned]
    MYDAY -->|sidebar| ALL[/tasks]
    
    IMP -->|sidebar| MYDAY
    IMP -->|sidebar| PLAN
    IMP -->|sidebar| ALL
    
    PLAN -->|sidebar| MYDAY
    PLAN -->|sidebar| IMP
    PLAN -->|sidebar| ALL
    
    ALL -->|sidebar| MYDAY
    ALL -->|sidebar| IMP
    ALL -->|sidebar| PLAN
    
    MYDAY -.->|AddTaskBar crea en My Day| LIST1[(My Day list)]
    IMP -.->|AddTaskBar crea en Important| LIST2[(Important list)]
    PLAN -.->|AddTaskBar crea en Planned| LIST3[(Planned list)]
    ALL -.->|AddTaskBar crea en Tasks| LIST4[(Tasks list)]
    
    style MYDAY fill:#dbe1ff
    style IMP fill:#ffe083
    style PLAN fill:#dce2f7
    style ALL fill:#e1e3e4
```

## 5. StackShell: Props y Tipos

```typescript
// StackShell props
interface StackShellProps {
  listName: string
  emptyState: {
    icon: string
    title: string
    description: string
  }
}

// Internal state
interface StackShellState {
  listId: number | null
  isLoading: boolean
  error: string | null
}
```

## 6. Sidebar Active State (ya implementado)

El Sidebar actual ya implementa la navegación activa usando `usePathname()`:

```typescript
// Sidebar.tsx (existente) — no requiere cambios
const NAV_ITEMS = [
  { href: '/my-day', label: 'My Day', icon: 'sunny' },
  { href: '/important', label: 'Important', icon: 'star' },
  { href: '/planned', label: 'Planned', icon: 'calendar_month' },
  { href: '/tasks', label: 'Tasks', icon: 'task_alt' },
]

const isActive = pathname === item.href
// → bg-primary-container/10 text-primary font-semibold border-l-4 border-primary
```

## 7. Mapa de Archivos

```diff
src/app/(frontend)/(stacks)/
├── layout.tsx                          # Sin cambios
├── my-day/
-│   └── page.tsx                       # EmptyState placeholder
+│   └── page.tsx                       # TopBar + StackShell
├── important/
-│   └── page.tsx                       # EmptyState placeholder
+│   └── page.tsx                       # TopBar + StackShell
├── planned/
-│   └── page.tsx                       # EmptyState placeholder
+│   └── page.tsx                       # TopBar + StackShell
└── tasks/
-    └── page.tsx                       # EmptyState placeholder
+    └── page.tsx                       # TopBar + StackShell

src/components/tasks/
+   └── StackShell.tsx                  # NUEVO: orquestador cliente
```

## 8. Consideraciones de Performance

- **useLists se comparte:** Las 4 páginas stack llaman a `useLists()`, pero TanStack Query lo cachea (staleTime 60s). Navegar entre stacks no dispara nuevo fetch de lists
- **useTasks por stack:** Cada stack tiene su propia query `['tasks', listId]`. Navegar entre stacks cambia el queryKey, por lo que cada stack tiene su propio caché
- **AddTaskBar inline:** Cada stack tiene su propio AddTaskBar. No hay estado compartido entre stacks — cada uno opera independientemente
