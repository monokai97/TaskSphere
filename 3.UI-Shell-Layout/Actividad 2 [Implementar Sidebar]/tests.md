# Tests: Implementar Sidebar

## Estrategia

Tests visuales y de navegación en navegador. La lógica del Sidebar es puramente UI + routing.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores

### 2. Renderizado visual

| Verificación | Método |
|---|---|
| Sidebar visible en desktop | Layout con 3 columnas, sidebar a la izquierda |
| Logo visible | Icono `blur_on` + "Ethereal Focus" |
| 4 links de navegación | My Day, Important, Planned, Tasks |
| Sección "Lists" | Label "LISTS" + 3 skeleton items |
| Botón "New List" | Botón primary con icono `add` |
| Footer | Avatar circular + "Guest" + Settings + Help |

### 3. Test de navegación

| Paso | Resultado |
|---|---|
| Click en "My Day" | URL cambia a `/my-day`, item se resalta con primary |
| Click en "Important" | URL cambia a `/important`, item se resalta |
| Click en "Planned" | URL cambia a `/planned`, item se resalta |
| Click en "Tasks" | URL cambia a `/tasks`, item se resalta |
| Refrescar en `/important` | Sidebar persiste el estado activo en Important |

### 4. Test de estado activo

- [ ] Navegar a `/my-day` → My Day tiene `bg-primary-container/10` y `border-l-4 border-primary`
- [ ] Navegar a `/important` → Important está activo, My Day vuelve a estado inactivo
- [ ] Verificar que solo UN item tiene la clase activa a la vez

### 5. Test responsive

- [ ] Redimensionar a <1024px: Sidebar se oculta (`hidden lg:flex` en el aside del layout)
- [ ] En mobile: se espera MobileNav (Actividad 4)

### 6. Test de links del footer

- [ ] Click en "Settings" → navega a `/settings` (404 por ahora, pero la ruta existe)
- [ ] Click en "Help" → navega a `/help` (404 por ahora)

### 7. Test de placeholder

- [ ] Click en "New List" → no hace nada (placeholder). Verificar en consola que no hay errores
