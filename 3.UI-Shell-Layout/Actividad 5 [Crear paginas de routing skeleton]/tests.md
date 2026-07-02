# Tests: Crear páginas de routing skeleton

## Estrategia

Tests de routing, navegación y contenido esperado en cada stack. Pruebas manuales + type check.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores

### 2. Test de redirect

| Paso | Resultado |
|---|---|
| Visitar `http://localhost:3000/` | Redirige a `http://localhost:3000/my-day` |
| Código de redirección | Usa `redirect()` de Next.js (no client-side `router.push`) |

### 3. Test de rutas

| Ruta | Título TopBar visible | Icono EmptyState | Descripción EmptyState |
|---|---|---|---|
| `/my-day` | "My Day" | `sunny` | "Tasks added here appear when you need them most." |
| `/important` | "Important" | `star` | "Flag tasks as important to see them here." |
| `/planned` | "Planned" | `calendar_month` | "Tasks with a due date will show up here." |
| `/tasks` | "Tasks" | `task_alt` | "All your tasks live here." |

### 4. Test de layout

- [ ] Las 4 rutas cargan el layout de 3 columnas (Sidebar izquierda, main centro, DetailPanel derecha)
- [ ] Sidebar visible en desktop (>1024px)
- [ ] MobileNav visible en mobile (<1024px)
- [ ] TopBar sticky con título correcto

### 5. Test de navegación lateral

| Paso | Resultado |
|---|---|
| Click "My Day" en Sidebar | URL cambia a `/my-day`, el layout se mantiene |
| Click "Important" en MobileNav | URL cambia a `/important` |
| Navegar directamente a `/planned` | Página carga con layout completo |

### 6. Test de 404

- [ ] Visitar `/nonexistent` → página 404 de Next.js (no error en consola)
