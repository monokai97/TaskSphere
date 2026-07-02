# Actividad 4: Crear API Routes de Lists — Propuesta

## Justificación

Las API Routes de Lists son la capa thin-proxy entre el frontend (AddListModal, ListNav, TaskListPicker) y PayloadCMS. Siguen el mismo patrón arquitectónico que las API Routes de Tasks (Phase 4 Act 1): validación Zod + guestId desde Iron-Session header + delegación a PayloadCMS CRUD.

### Estado actual

Actualmente solo existe `GET /api/lists` (lectura de listas). Faltan:

| Endpoint | Estado | Consumido por |
|---|---|---|
| `GET /api/lists` | ✅ Existe | ListNav, TaskListPicker |
| `POST /api/lists` | ❌ Falta | AddListModal (Act 2) |
| `PATCH /api/lists/[id]` | ❌ Falta | AddListModal edición (Act 2) |
| `DELETE /api/lists/[id]` | ❌ Falta | Futuro contexto de lista |
| `PATCH /api/lists/reorder` | ❌ Falta | ListNav DnD (Act 3) |

### Por qué una API Route personalizada y no PayloadCMS REST directo

1. **Zod validation en el borde** — Las validaciones ocurren antes de llegar a PayloadCMS, evitando requests inválidos y dando errores 400 descriptivos al frontend.
2. **guestId automático** — El header `x-guest-id` lo inyecta el middleware de Iron-Session. El frontend nunca envía el guestId explícitamente, evitando exposición accidental.
3. **Patrón consistente** — Todas las API Routes del proyecto siguen la misma estructura: validar sesión → validar Zod → operar PayloadCMS → responder.
4. **Protección de listas default** — DELETE debe rechazar eliminación de listas con `isDefault=true`, una regla de negocio que Access Control de PayloadCMS no puede expresar fácilmente.

### Estrategia de implementación

Se crean 3 archivos de ruta y 2 utilidades compartidas:

```
src/app/(frontend)/api/lists/
├── route.ts              → Actualizar: añadir POST handler
└── [id]/
    └── route.ts          → Nuevo: PATCH + DELETE

src/app/(frontend)/api/lists/reorder/
└── route.ts              → Nuevo: PATCH batch reorder

src/lib/
├── schemas.ts            → Nuevo: Zod schemas compartidos (CreateListInput, UpdateListInput)
└── with-retry.ts         → Nuevo: withRetry() wrapper para SQLITE_BUSY
```

### Mejoras respecto al patrón base

- **withRetry()** — Wrapper reusable para SQLITE_BUSY con jitter exponencial (100ms, 200ms, 400ms, max 3 retries). Se aplica en todas las operaciones de escritura (POST, PATCH, DELETE, PATCH reorder).
- **Soft-check en DELETE** — Las listas default (`isDefault=true`) no pueden eliminarse. El endpoint responde 409 Conflict con mensaje explicativo.
- **Error handling granular** — Errores Zod devuelven `{ error: { fieldErrors, formErrors } }` structure. Lista no encontrada o no pertenece al guest retorna 404. Errores PayloadCMS retornan 503 con mensaje genérico.
