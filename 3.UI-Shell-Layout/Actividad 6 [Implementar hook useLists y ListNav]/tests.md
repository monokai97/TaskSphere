# Tests: Implementar hook useLists y ListNav

## Estrategia

Tests de integración para API Route + hooks + componente. Pruebas manuales para navegación y estado.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores

### 2. Test de API Route (manual o con fetch directo)

| Paso | Resultado esperado |
|---|---|
| `GET /api/lists` sin cookie de sesión | 401 `{ error: 'No session' }` |
| `GET /api/lists` con cookie Iron-Session válida | 200 `{ docs: [...] }` con 4 listas default |
| Verificar listas default | `My Day` (icono `light_mode`), `Important` (`star`), `Planned` (`calendar_month`), `Tasks` (`task_alt`) |
| Verificar sortOrder | Listas en orden: 0, 1, 2, 3 |

### 3. Test de Hook useLists

- [ ] Importar `useLists` en un componente de prueba
- [ ] Verificar `isLoading = true` en el primer render
- [ ] Verificar `data.docs` con 4 listas después de fetch
- [ ] Navegar a otra página y volver → no hay fetch extra (cache hit)
- [ ] Esperar 60s → fetch de re-validación

### 4. Test de Hook useList

- [ ] `useList('nonexistent')` → `data: undefined`
- [ ] `useList(realId)` → `data` es el objeto List completo

### 5. Test de componente ListNav

- [ ] **Loading state:** 3 skeletons visibles, className `animate-pulse`
- [ ] **Success state:** 4 items con icono + nombre, header "Lists"
- [ ] **Empty state:** Mensaje "No lists yet"
- [ ] **Error state:** ListNav retorna null (fail silencioso)
- [ ] **Estado activo:** Click en una lista → clase `bg-primary-container/10 text-primary border-l-4 border-primary`
- [ ] **Truncamiento:** Nombres largos se cortan con `truncate`

### 6. Test de integración Sidebar

- [ ] Sidebar renderizada con sección "Lists" y 4 listas default
- [ ] Click en "My Day" → activa resaltado (estilo sidebar nav)
- [ ] Click en lista personalizada → URL correcta `/lists/{id}`
- [ ] Sin listas en DB → mensaje "No lists yet"

### 7. Test de sesión persistente

- [ ] Cerrar pestaña, abrir nueva → misma sesión (cookie persiste)
- [ ] Listas cargan sin skeleton (cache caliente 60s)
