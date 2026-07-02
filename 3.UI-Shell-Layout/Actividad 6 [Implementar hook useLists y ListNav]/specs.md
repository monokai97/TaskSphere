# Specs: Implementar hook useLists y ListNav

## Funcionales

1. Las listas del guest deben obtenerse desde PayloadCMS vía API Route.
2. Las listas deben mostrarse en la Sidebar con icono + nombre.
3. La lista actualmente activa debe resaltarse visualmente.
4. Mientras se cargan las listas, deben mostrarse 3 skeletons.
5. El hook debe estar disponible para otros componentes (AddListModal, etc.).

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | API Route GET | `src/app/(frontend)/api/lists/route.ts`: GET handler |
| R2 | Guest check | Si no hay `x-guest-id` header → 401 `{ error: 'No session' }` |
| R3 | Lazy init | Ejecutar `ensureGuestInitialized()` antes de consultar |
| R4 | Payload find | `payload.find({ collection: 'lists', where: { guestId }, sort: 'sortOrder' })` |
| R5 | Response | `NextResponse.json({ docs: List[] })` |
| R6 | Hook path | `src/hooks/useLists.ts` |
| R7 | Query key | `['lists']` |
| R8 | Query fn | `fetch('/api/lists').then(r => r.json())` |
| R9 | Stale time | `60_000` (1 minuto) |
| R10 | Error handling | Si fetch falla, mostrar estado de error (silencioso) |
| R11 | ListNav props | `listId?: string` para external control (opcional) |
| R12 | Link href | `/lists/${list.id}` — prefijo `/lists/` para URLs de listas |
| R13 | Estado activo | `pathname === '/lists/' + list.id` |
| R14 | Skeleton | 3 divs con `animate-pulse bg-surface-container-high rounded-xl h-10` |
| R15 | Empty list | Si no hay listas, mostrar mensaje "No lists yet" |

## Contratos

```tsx
// API Response
GET /api/lists → { docs: List[] }

// Hook
function useLists(): { data: { docs: List[] } | undefined; isLoading: boolean; error: Error | null }
function useList(id: string): { data: List | undefined; isLoading: boolean }

// Component
<ListNav />  // Sin props, auto-configurado con usePathname()
```
