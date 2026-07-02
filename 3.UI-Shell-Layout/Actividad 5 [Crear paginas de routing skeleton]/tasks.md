# Tasks: Crear páginas de routing skeleton

## Dependencias
- Actividad 1 completada (layout 3 columnas con DetailPanel)
- Actividad 2 completada (Sidebar)
- Actividad 3 completada (TopBar)

---

## Hito 5.1: Route group (stacks)

- [ ] Crear carpeta `src/app/(frontend)/(stacks)/`
- [ ] Crear `src/app/(frontend)/(stacks)/layout.tsx`
- [ ] Importar `Sidebar` desde `@/components/layout/Sidebar`
- [ ] Importar `DetailPanel` desde `@/components/layout/DetailPanel`
- [ ] Exportar `async function StacksLayout({ children }: { children: React.ReactNode })`
- [ ] Renderizar: `<Sidebar />` + `<main className="flex-1 flex flex-col min-w-0">{children}</main>` + `<DetailPanel />`

## Hito 5.2: Páginas skeleton

- [ ] Crear `EmptyState.tsx` en `src/components/ui/EmptyState.tsx`
- [ ] Componente Server Component con props `icon: string`, `title: string`, `description: string`
- [ ] Renderizar div centrado con icono grande, título, descripción
- [ ] Crear `src/app/(frontend)/(stacks)/my-day/page.tsx`
  - [ ] Importar `TopBar` y `EmptyState`
  - [ ] Renderizar `<TopBar title="My Day" />` + `<EmptyState icon="sunny" title="This is your My Day" description="Tasks added here appear when you need them most." />`
- [ ] Crear `src/app/(frontend)/(stacks)/important/page.tsx`
  - [ ] Igual con icon `star`, title "Important"
- [ ] Crear `src/app/(frontend)/(stacks)/planned/page.tsx`
  - [ ] Igual con icon `calendar_month`, title "Planned"
- [ ] Crear `src/app/(frontend)/(stacks)/tasks/page.tsx`
  - [ ] Igual con icon `task_alt`, title "Tasks"

## Hito 5.3: Landing page redirect

- [ ] Reemplazar contenido de `src/app/(frontend)/page.tsx`
  - [ ] Importar `redirect` desde `'next/navigation'`
  - [ ] Exportar función `HomePage` que llama `redirect('/my-day')`

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] Visitar `/` → redirige a `/my-day`
- [ ] Visitar `/my-day` → layout 3 columnas con título "My Day" + EmptyState icono sunny
- [ ] Visitar `/important` → layout 3 columnas con título "Important" + EmptyState icono star
- [ ] Visitar `/planned` → layout 3 columnas con título "Planned" + EmptyState icono calendar_month
- [ ] Visitar `/tasks` → layout 3 columnas con título "Tasks" + EmptyState icono task_alt
- [ ] MobileNav visible en mobile, oculto en desktop
