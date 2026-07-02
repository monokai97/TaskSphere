# Tests: Implementar MobileNav

## Estrategia

Tests visuales responsive y de navegación.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores

### 2. Test responsive

| Viewport | Comportamiento esperado |
|---|---|
| >1024px (desktop) | MobileNav oculto (display: none) |
| <1024px (mobile) | MobileNav visible en bottom |
| 375px (iPhone) | 4 tabs distribuidos equitativamente |
| 768px (tablet portrait) | MobileNav visible, sidebar oculto |

### 3. Test de navegación

| Paso | Resultado |
|---|---|
| Click "My Day" | URL → `/my-day`, icono + label primary |
| Click "Important" | URL → `/important`, primary en Important |
| Click "Planned" | URL → `/planned`, primary en Planned |
| Click "Tasks" | URL → `/tasks`, primary en Tasks |
| Refrescar en `/important` | Estado activo persiste en Important |

### 4. Test visual mobile

- [ ] Abrir DevTools > Toggle Device Toolbar (iPhone 14)
- [ ] MobileNav visible abajo con 4 tabs
- [ ] Fondo semitransparente (ver contenido detrás borroso)
- [ ] Borde superior visible (`border-t border-subtle-light`)
- [ ] Safe area: contenido no oculto detrás de la barra

### 5. Test de desktop

- [ ] En desktop, hacer resize a >1024px
- [ ] MobileNav debe desaparecer
- [ ] Sidebar debe ser visible (navegación desktop)

### 6. Test de iconos

| Tab | Icono esperado |
|---|---|
| My Day | `sunny` |
| Important | `star` |
| Planned | `calendar_month` |
| Tasks | `task_alt` |
