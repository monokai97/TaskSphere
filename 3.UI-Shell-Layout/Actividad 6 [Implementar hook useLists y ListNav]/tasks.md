# Tasks: Implementar hook useLists y ListNav

## Dependencias
- Fase 1 completada (colecciones Lists + GuestSessions registradas, payload-types.ts generado)
- Fase 2 completada (Iron-Session, middleware, lazy init de guest, API session route)
- `src/lib/payload-client.ts` debe existir con `ensureGuestInitialized()` exportado
- `src/payload-types.ts` debe tener la interfaz `List` generada

---

## Hito 6.1: API Route GET /api/lists

- [ ] Crear carpeta `src/app/(frontend)/api/lists/`
- [ ] Crear `src/app/(frontend)/api/lists/route.ts`
- [ ] Importar `NextRequest, NextResponse from 'next/server'`
- [ ] Importar `getPayload from 'payload'`
- [ ] Importar `config from '@payload-config'`
- [ ] Importar `ensureGuestInitialized from '@/lib/payload-client'`
- [ ] Exportar `async function GET(req: NextRequest)`
- [ ] Leer `guestId` de `req.headers.get('x-guest-id')`
- [ ] Si no hay guestId → `NextResponse.json({ error: 'No session' }, { status: 401 })`
- [ ] Resolver config asíncrona: `const payloadConfig = await config`
- [ ] Obtener payload: `const payload = await getPayload({ config: payloadConfig })`
- [ ] Ejecutar `ensureGuestInitialized(payload, guestId)`
- [ ] Consultar: `payload.find({ collection: 'lists', where: { guestId: { equals: guestId } }, sort: 'sortOrder' })`
- [ ] Retornar `NextResponse.json(lists)`
- [ ] Verificar: `npx tsc --noEmit` sin errores

## Hito 6.2: Hook useLists

- [ ] Crear carpeta `src/hooks/` (si no existe)
- [ ] Crear `src/hooks/useLists.ts`
- [ ] Primera línea: `'use client'`
- [ ] Importar `useQuery from '@tanstack/react-query'`
- [ ] Importar `type List from '@/payload-types'`
- [ ] Definir `const LISTS_KEY = 'lists'`
- [ ] Exportar `function useLists()` con `useQuery({ queryKey: ['lists'], queryFn: async () => fetch('/api/lists').then(r => r.json()), staleTime: 60000 })`
- [ ] Exportar `function useList(id: string)` que derive de `useLists()` con `.find()`
- [ ] Verificar: `npx tsc --noEmit` sin errores

## Hito 6.3: Componente ListNav

- [ ] Crear carpeta `src/components/lists/`
- [ ] Crear `src/components/lists/ListNav.tsx`
- [ ] Primera línea: `'use client'`
- [ ] Importar `Link from 'next/link'`
- [ ] Importar `usePathname from 'next/navigation'`
- [ ] Importar `useLists from '@/hooks/useLists'`
- [ ] Exportar `function ListNav()`
- [ ] Obtener `pathname = usePathname()`
- [ ] Obtener `{ data, isLoading, error } = useLists()`
- [ ] Si `error` → retornar `null` (fail silencioso)
- [ ] Si `isLoading` → renderizar 3 skeletons (`animate-pulse bg-surface-container-high rounded-xl h-10`)
- [ ] Si `data.docs.length === 0` → mensaje "No lists yet"
- [ ] Mapear `data.docs.map(list => ...)` renderizando Link con icono + nombre
- [ ] Estado activo: `pathname === '/lists/' + list.id` → `bg-primary-container/10 text-primary border-l-4 border-primary`
- [ ] Estado inactivo: `text-on-surface-variant hover:bg-surface-variant/50`
- [ ] Incluir `<span className="font-label-sm ...">Lists</span>` como header de sección
- [ ] Verificar: `npx tsc --noEmit` sin errores

## Hito 6.4: Integración en Sidebar

- [ ] Abrir `src/components/layout/Sidebar.tsx`
- [ ] Importar `ListNav from '@/components/lists/ListNav'`
- [ ] Reemplazar los links hardcodeados de listas con `<ListNav />`
- [ ] Verificar: `npx tsc --noEmit` sin errores

## Verificación final

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `pnpm lint` no reporta errores
- [ ] Cargar app, abrir Sidebar: ver skeletons (~1s) luego 4 listas default
- [ ] Click en una lista → URL `/lists/{id}`, item resaltado
- [ ] Recargar página → lista persiste seleccionada
- [ ] Abrir otra pestaña → datos cacheados, sin fetch extra
