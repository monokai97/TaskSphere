# Proposal: Implementar hook useLists y ListNav

## Problema

La Sidebar actualmente tiene listas hardcodeadas (My Day, Important, Planned, Tasks como links de navegación estáticos). No hay forma de crear listas personalizadas, y las listas no persisten entre sesiones. No hay integración con PayloadCMS para fetching de datos reales.

## Solución

1. **API Route `GET /api/lists`**: endpoint que lee `x-guest-id` del header (inyectado por middleware Iron-Session), asegura que el guest está inicializado en DB, y consulta PayloadCMS por las listas del guest.
2. **Hook `useLists`**: hook TanStack Query con `staleTime: 60000` que fetchea las listas y las cachea. `useList(id)` para obtener una lista individual.
3. **Componente `ListNav`**: renderiza las listas desde el hook con icono + nombre + estado activo (`bg-primary-container/10 text-primary border-l-4 border-primary`).
4. **Integración en Sidebar**: reemplaza el placeholder de listas hardcodeadas con `<ListNav />`.

## Estrategia

- API Route sigue el patrón Thin Proxy: Iron-Session → Zod → PayloadCMS
- TanStack Query cachea listas 60s (suficiente para sesiones anónimas)
- ListNav usa `usePathname()` para detectar qué lista está activa

## Impacto

- 1 archivo nuevo: `src/app/(frontend)/api/lists/route.ts`
- 1 archivo nuevo: `src/hooks/useLists.ts`
- 1 archivo nuevo: `src/components/lists/ListNav.tsx`
- 1 archivo modificado: `src/components/layout/Sidebar.tsx` (reemplazar hardcode con `<ListNav />`)
