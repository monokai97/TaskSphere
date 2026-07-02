Desarrollar la arquitectura full-stack e integración local de una aplicación de gestión de tareas (To-Do List App) empresarial de alta fidelidad, utilizando un enfoque monolítico moderno basado en Next.js.

### STACK TÉCNICO COMPLETO & ARQUITECTURA DE INTEGRACIÓN:
- **Frontend & Routing:** Next.js 14+ (App Router) & React 18+
- **Estilos & UI:** Tailwind CSS (Arquitectura Mobile-First y soporte nativo para Dark Mode)
- **CMS & Headless API:** PayloadCMS 3.0+ (utilizado como motor de API, logs de auditoría y gestión de colecciones)
- **Data Layer & ORM:** Prisma ORM v5+ mapeando a una base de datos local **SQLite** (archivo local físico)
- **Manejo de Sesiones & Estado de Autenticación:** **Iron-Session** para la gestión de cookies seguras, cifradas y sin estado en los API Routes de Next.js.
- **Autenticación Middleware:** Passport.js (Estrategia Anónima/Invitado customizada) integrado con el ciclo de vida de Iron-Session.
- **State Management & Server Cache:** **TanStack Query v5 (React Query)** para la sincronización de estado cliente-servidor, manejo de mutaciones y re-validaciones.
- **Validación de Esquemas:** **Zod** para la validación estricta de payloads (Type-Safety de extremo a extremo) en la capa de transporte API y mutaciones del cliente.

### REQUISITOS DE FUNCIONALIDAD & FLUJOS CRÍTICOS:

1. **Flujo de Ciclo de Vida del Usuario Invitado (Passport + Iron-Session + Prisma):**
   - **Paso de Entrada:** Al acceder a la app sin sesión activa, un middleware intercepta la solicitud. Passport.js genera un perfil de `Guest` con un ID único (`crypto.randomUUID()`).
   - **Persistencia de Sesión:** Iron-Session sella esta identidad en una cookie cifrada del lado del cliente.
   - **Aislamiento en Base de Datos:** Prisma debe registrar la sesión del invitado en SQLite. Todas las tareas subsiguientes creadas por este cliente deben estar vinculadas mediante una relación de clave foránea (`guestId`) para garantizar el estricto aislamiento de datos local.

2. **Core de Gestión de Tareas (CRUD robusto vía PayloadCMS + Prisma):**
   - Las tareas se definen como una colección en PayloadCMS (`tasks`).
   - **Crear:** Entrada de texto con descripción opcional. El payload es validado en el cliente y servidor con un esquema de **Zod** antes de impactar Prisma.
   - **Leer:** Consultas optimizadas filtrando por el `guestId` de la sesión actual de Iron-Session.
   - **Actualizar:** Soporte para edición in-place del texto de la tarea y alternancia de estado (Pendiente / Completada).
   - **Eliminar:** Borrado físico o lógico (Soft Delete) administrado por hooks de PayloadCMS.

3. **Estrategia de Sincronización de UI con TanStack Query:**
   - Implementar **Optimistic Updates (Actualizaciones Optimistas)** para las acciones de Toggle (completar tarea) y Delete. La interfaz del frontend debe reflejar el cambio de inmediato en el cliente. Si la API de Next.js/Payload falla en SQLite, React Query debe hacer un rollback automático al estado anterior y disparar una notificación de error en la UI.
   - Configurar estrategias de invalidación de queries (`invalidateQueries`) eficientes para evitar sobrecargar las consultas a SQLite.

   4. **Flujo de Purgado y Caducidad de Sesiones Anónimas (Garbage Collection):**
   - El sistema debe definir una política de ciclo de vida para las cookies de **Iron-Session** (ej. 7 días de inactividad). 
   - Se debe estructurar un flujo automatizado (o un endpoint de mantenimiento local invocable) que use **Prisma** para identificar y eliminar de la base de datos **SQLite** todas las sesiones de invitados expiradas junto con sus tareas asociadas (Cascading Delete), evitando el crecimiento indefinido del archivo de base de datos local.

5. **Trazabilidad y Logs de Auditoría en Tiempo Real (PayloadCMS Hooks):**
   - Cada acción de mutación sobre la colección de tareas (creación, cambio de estado, edición) debe disparar un Hook de PayloadCMS (`afterChange`, `afterDelete`).
   - Este hook debe registrar de manera silenciosa una entrada en una colección secundaria de auditoría (`task-logs`), guardando el `guestId`, el tipo de operación, el timestamp exacto y un diff del estado anterior vs. el nuevo estado de la tarea.

6. **Flujo de Resiliencia ante Bloqueos de Concurrencia en SQLite (Write-Ahead Logging):**
   - Debido a la naturaleza de un solo escritor de SQLite, el spec debe detallar la estrategia de manejo de excepciones cuando el frontend ejecute múltiples Mutaciones Optimistas de **TanStack Query** simultáneamente (ej. clics rápidos en ráfaga para completar varias tareas).
   - El backend de Next.js debe implementar un mecanismo de reintentos automáticos (Retry Pattern) con jitter exponencial controlado si Prisma devuelve un código de error de base de datos bloqueada (`P2034` / `SQLITE_BUSY`).

7. **Exportación y Respaldo Portátil del Historial del Invitado (Sandboxed Data Portability):**
   - El usuario invitado debe tener la opción de exportar toda su información almacenada en la sesión actual con un solo clic.
   - El frontend consumirá un API Route seguro que, tras validar la sesión con Iron-Session, ejecutará una consulta con Prisma y compilará un archivo **JSON estructurado** descargable. Este archivo contendrá el perfil del invitado, su listado de tareas completo y los esquemas de **Zod** validados para garantizar que los datos sean portables.

8. **Flujo de Transición y Promoción de Estado (Guest to Persistent User Pipeline):**
   - Aunque el alcance inicial es local y anónimo, la arquitectura debe dejar abierta la interfaz para una futura conversión de cuenta.
   - El flujo crítico debe detallar cómo las tareas asociadas al `guestId` actual de Iron-Session pueden ser "re-vinculadas" o migradas masivamente hacia un identificador de usuario registrado permanente, garantizando que el usuario no pierda su historial local si decide iniciar sesión formalmente en el futuro.

### REQUISITOS TÉCNICOS & CRITERIOS DE ARQUITECTURA PARA EL SPEC:

- **Contrato de Datos (Modelos TypeScript & Prisma):**
  - Definir el archivo `schema.prisma` básico que incluya los modelos `GuestSession` y `Task` con sus respectivas relaciones e índices necesarios para SQLite.
  - Generar las interfaces compartidas combinando los tipos infatigables de Zod y las definiciones de PayloadCMS para evitar discrepancias de tipado (Type-Drift).

- **Validación Anti-Malformación (Zod Layer):**
  - Estructurar los esquemas de validación para la creación de tareas (ej. longitud mínima del título de 3 caracteres, sanitización de strings contra inyecciones básicas de scripts, no permitir espacios en blanco vacíos).

- **Restricciones de Borde y Resiliencia Local:**
  - Definición de comportamiento si el archivo de base de datos SQLite se bloquea por lecturas/escrituras concurrentes (SQLite locking management).
  - Comportamiento ante la expiración o corrupción de la cookie de Iron-Session: el sistema debe purgar el estado del cliente de forma segura y re-autenticar un nuevo invitado sin romper la UX.