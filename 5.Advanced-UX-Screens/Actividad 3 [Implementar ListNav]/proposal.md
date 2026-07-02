# Actividad 3: Implementar ListNav — Propuesta

## Justificación

La navegación de listas (ListNav) es el mecanismo primario de organización en Task Sphere. Mientras que los 4 stacks principales (My Day, Important, Planned, Tasks) cubren vistas predefinidas, las listas personalizadas del usuario son la clave para una organización temática (Work, Shopping, Fitness, etc.).

### Estado actual vs objetivo

Un ListNav básico ya existe en `src/components/lists/ListNav.tsx` (creado en Phase 3), con:
- Lectura de listas vía `useLists()`
- Renderizado de icono + nombre
- Estado activo vía `usePathname()`
- Links a `/lists/{id}`
- Loading skeleton y empty state

Esta actividad lo **reemplaza con la versión completa** que incluye:

1. **Color dot indicator** — Cada lista muestra un punto de color junto al icono, usando el campo `list.color`. Si no tiene color, usa el color por defecto `#004ac6`.
2. **Drag handle** — Icono `drag_indicator` visible solo en hover (`opacity-0 group-hover:opacity-100`) para indicar que las listas son reordenables.
3. **Drag & drop reorder** — HTML5 Drag & Drop API nativa para reordenar listas. Al soltar, batch PATCH actualiza `sortOrder` de todas las listas afectadas. Con optimistic update para feedback inmediato.
4. **Edición contextual** — (Post-MVP) Botón de edición/eliminación por lista vía menú contextual o click derecho.

### Estrategia de transformación

| Elemento visual | Estado actual | Mejora |
|---|---|---|
| List item (icon + name) | Existe, sin color | Añadir color dot indicador |
| Hover state | `hover:bg-surface-variant/50` | Añadir `cursor-grab` + drag handle |
| Reordenamiento | No existe | HTML5 Drag & Drop + batch PATCH |
| Navegación a lista | Link a `/lists/{id}` | Crear page route `/lists/[id]` |
| Active state | `usePathname()` match | Sincronizar con `useParams()` para `/lists/{id}` |
| Context menu (edit/delete) | No existe | Placeholder visual (post-MVP) |

### Dependencias

- **Act 4 (API Routes de Lists)** — Endpoint `PATCH /api/lists/reorder` para batch update de `sortOrder`
- **`useLists` hook** — Se añade `useReorderLists()` mutation
- **Page route `/lists/[id]`** — Página que muestra tareas de una lista específica (post-MVP, puede ser placeholder)

### Archivos a modificar

```
src/components/lists/ListNav.tsx    → Refactor completo con DnD + color + drag handle
src/hooks/useLists.ts              → Añadir useReorderLists mutation
src/app/(frontend)/lists/[id]/     → Nueva page route (placeholder o real)
```

### Sin cambios en PayloadCMS

La colección `lists` ya tiene `sortOrder` (number) y `color` (hex). No se requieren migraciones.
