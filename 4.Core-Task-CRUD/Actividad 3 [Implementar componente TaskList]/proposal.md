# Propuesta: Componente TaskList — Orquestador de Listas + Estados

## Resumen Ejecutivo

Implementar `TaskList`, el componente contenedor que orquesta la visualización de una lista de tareas. Consume el hook `useTasks()` (Act 6) y renderiza `TaskItem` (Act 2) para cada tarea, manejando los 4 estados fundamentales de toda vista de datos: **carga** (Skeleton), **vacío** (EmptyState), **datos** (TaskItems), y **error** (fallback). Además incluye la creación del componente `Skeleton` en common.

## Justificación

### Por qué un componente orquestador separado

| Aspecto | Enfoque sin TaskList (cada stack repite lógica) | Con TaskList (propuesto) |
|---|---|---|
| **Manejo de estados** | Duplicado en 4 stacks | Centralizado en un componente |
| **Data fetching** | Cada stack llama a useTasks | TaskList recibe props, hook interno |
| **Estados vacío** | Mensaje hardcodeado | EmptyState contextual por stack |
| **Loading** | Placeholder manual | Skeletons automáticos |
| **Mantenibilidad** | Cambiar UI de lista = tocar 4 archivos | Cambiar un solo componente |

### Mapeo HTML → TaskList States

| Estado HTML (prototipo) | TaskList State | Componente |
|---|---|---|
| Lista con items (`div.space-y-3 > div.group`) | `data.docs.length > 0` | `TaskItem[]` dentro de `<div className="space-y-3">` |
| Stack vacío (1.Stack Vacio) | `data.docs.length === 0` | `<EmptyState icon="..." title="..." description="..." />` |
| (no existe en HTML estático) | `isLoading` | `<Skeleton />` × 5 |
| (no existe en HTML estático) | `isError` | `<div className="text-error">` con mensaje |

### Mejoras sobre el HTML estático

1. **Skeleton loading:** Mientras TanStack Query resuelve, 5 placeholders con `animate-pulse` evitan layout shift
2. **Estados vacío contextuales:** EmptyState recibe props dinámicas según el stack activo (My Day → "No tasks for today", Important → "No important tasks")
3. **Error recovery:** Si el fetch falla, muestra mensaje de error con opción de reintento (refetch de TanStack Query)
4. **Sin duplicación:** TaskList se instancia en cada stack con diferentes props `listId` y `status`

### Dependencias entre Actividades

```
Act 1 (API Routes) → Act 6 (useTasks hook) ─┐
                                              ├──→ Act 3 (TaskList) ──→ Act 7 (Integración stacks)
Act 2 (TaskItem) ────────────────────────────┘
```

### Colecciones PayloadCMS Involucradas

| Colección | Uso en TaskList |
|---|---|
| `tasks` | Fuente de datos principal (vía useTasks) |
| `lists` | Para filtrar por ID de lista (vía props) |
| Ninguna directamente | TaskList solo recibe props y consume hooks |

### Conclusión

TaskList es el primer componente que completa el pipeline completo: **Prop → Hook → API → PayloadCMS → Render**. Es el habilitador para que los stacks (Act 7) pasen de ser páginas estáticas con EmptyState a vistas dinámicas con datos reales.
