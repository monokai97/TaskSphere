# Propuesta: Integrar TaskList en Páginas Stack — De Placeholders a Vistas Vivas

## Resumen Ejecutivo

Reemplazar los `EmptyState` estáticos en las 4 páginas stack (`my-day`, `important`, `planned`, `tasks`) con componentes funcionales conectados a PayloadCMS. Cada stack descubre su lista correspondiente vía `useLists()` (por nombre predefinido), inyecta el `listId` a `TaskList` y `AddTaskBar`, y muestra datos reales del guest autenticado.

## Justificación

### Estado Actual vs. Estado Final

| Stack | Estado Actual | Estado Final |
|---|---|---|
| `/my-day` | EmptyState hardcodeado | TopBar + TaskList(listId=MyDay) + AddTaskBar |
| `/important` | EmptyState hardcodeado | TopBar + TaskList(listId=Important) + AddTaskBar |
| `/planned` | EmptyState hardcodeado | TopBar + TaskList(listId=Planned) + AddTaskBar |
| `/tasks` | EmptyState hardcodeado | TopBar + TaskList(listId=Tasks) + AddTaskBar |

### Arquitectura: StackShell como Componente Compartido

Para evitar duplicar lógica en 4 páginas, se introduce `StackShell`, un componente cliente que orquesta:

```
Página Stack (Server Component)
  └── StackShell (Client Component)
        ├── TopBar
        ├── TaskList (con listId resuelto dinámicamente)
        └── AddTaskBar (con listId + listName)
```

**Flujo de descubrimiento de lista:**
```
Stack recibe listName ("My Day")
  → useLists() obtiene todas las listas del guest
  → find(list => list.name === "My Day")
  → extrae list.id
  → pasa list.id a TaskList y AddTaskBar
```

### Mapeo Stack → Lista Predefinida

| Ruta | listName | isDefault | Icono |
|---|---|---|---|
| `/my-day` | `"My Day"` | `true` | `today` |
| `/important` | `"Important"` | `false` | `star` |
| `/planned` | `"Planned"` | `false` | `calendar_today` |
| `/tasks` | `"Tasks"` | `false` | `list` |

Estos nombres coinciden con `DEFAULT_LISTS` en `src/lib/payload-client.ts`, creados automáticamente al inicializar un guest.

### Mejoras sobre los placeholders actuales

1. **Datos reales:** Cada stack muestra las tareas del guest filtradas por su lista correspondiente
2. **EmptyState contextual:** Si no hay tareas, el EmptyState aparece con mensaje específico del stack
3. **Creación directa:** `AddTaskBar` crea tareas directamente en la lista del stack actual
4. **Sin duplicación:** La lógica de descubrimiento de lista vive en `StackShell`, no en cada página
5. **Navegación activa:** Sidebar destaca el stack actual con `bg-primary-container/10` + borde primary

### Colecciones PayloadCMS Involucradas

| Colección | Uso |
|---|---|
| `lists` | `useLists()` descubre el ID de cada lista por nombre |
| `tasks` | `useTasks(listId)` filtra tareas de la lista específica |

### Conclusión

Esta actividad es la integración final que convierte 4 páginas estáticas en vistas dinámicas completas. Es el cierre de la Fase 4 — después de esto, el usuario puede navegar entre stacks, ver tareas reales, crearlas y gestionarlas desde cualquier vista. La actividad 7 es la "capa de pegamento" que ensambla todos los componentes previos (Act 2-6) en una experiencia de usuario cohesiva.
