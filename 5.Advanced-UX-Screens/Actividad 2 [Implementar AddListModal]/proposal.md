# Actividad 2: Implementar AddListModal — Propuesta

## Justificación

El modal de creación de listas es la puerta de entrada a la organización personalizada del usuario. Mientras que las 4 listas default (My Day, Important, Planned, Tasks) cubren el caso base, la capacidad de crear listas temáticas (Work, Shopping, Fitness, etc.) convierte a Task Sphere de un capturador de tareas genérico en un sistema de organización real.

### Por qué un modal con overlay y no una página o inline form

1. **Enfoque contextual** — El modal se superpone al workspace actual sin perder el contexto de navegación. El usuario ve su lista actual desenfocada detrás del modal, recordándole dónde estaba.
2. **Riqueza visual** — El selector de 12 iconos y 5 colores requiere espacio horizontal que un inline form no puede proporcionar sin romper el layout de 288px del sidebar.
3. **Modo edición** — El mismo componente se reutiliza para editar listas existentes (renombrar, cambiar icono/color) usando la prop `editList?: List`. Esto evita duplicar lógica.
4. **Animación de entrada/salida** — Overlay con `backdrop-blur-sm` + modal con `scale-100 → scale-95 opacity-0` proporciona retroalimentación visual premium.

### Estrategia de transformación UI → CMS

El HTML de `7.Add List.html` contiene ~80 líneas de markup modal significativo. Cada elemento se mapea a la colección `lists` de PayloadCMS:

| Sección HTML | Campo Payload | Tipo | Notas |
|---|---|---|---|
| Input nombre lista | `name` | `text` | Validación Zod: min 1, max 100, trim |
| 12 iconos Material Symbols | `icon` | `text` | Guarda nombre del icono (ej. "work"), default "list" |
| 5 colores circulares | `color` | `text` | Guarda hex (#004ac6, etc.), opcional |
| Botón "Crear lista" | POST operation | — | Crea documento en colección `lists` |
| Botón "Cancelar" | — | — | Cierra modal sin acción |
| Botón X (close) | — | — | Cierra modal sin acción |

**Mejoras arquitectónicas respecto al HTML:**

1. **Creación y edición unificadas** — El HTML solo contempla creación. El componente React acepta `editList?: List` para modo edición, reutilizando el mismo formulario con valores precargados y cambiando el título a "Editar lista" y el botón a "Guardar cambios".
2. **Validación Zod doble capa** — Validación cliente (Zod en el formulario) + servidor (Zod en API Route POST/PATCH). El HTML solo tiene validación cliente básica (input vacío → botón deshabilitado).
3. **Query invalidation automática** — Al crear/editar lista, TanStack Query invalida `['lists']` para que ListNav y TaskListPicker reflejen los cambios sin recargar.
4. **12 iconos estratégicos** — Los iconos del HTML se mantienen pero se documentan como constantes en `src/lib/constants.ts` para consistencia entre AddListModal y ListNav.

### Dependencias

- **Act 4 (API Routes de Lists)** — `POST /api/lists` para crear, `PATCH /api/lists/[id]` para editar
- **`useLists` hook** — Se añade `useCreateList` y `useUpdateList` mutations al hook existente
- **Zod `CreateListInput`** — Schema compartido en `src/lib/schemas.ts`

### Archivos a crear/modificar

```
src/components/lists/
├── AddListModal.tsx          # Modal de creación/edición de listas

src/hooks/
├── useLists.ts               # Añadir useCreateList + useUpdateList mutations

src/lib/
├── constants.ts              # Añadir ICON_OPTIONS array de 12 iconos
```

### Sin cambios en PayloadCMS

La colección `lists` ya tiene todos los campos necesarios: `name`, `icon`, `color`, `guestId`, `isDefault`, `sortOrder`. No se requieren migraciones ni nuevos fields.
