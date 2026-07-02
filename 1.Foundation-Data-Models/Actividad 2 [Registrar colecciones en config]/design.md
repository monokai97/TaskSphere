# Design: Registrar colecciones en payload.config.ts

## Visual Mapping

No hay elementos HTML/Stitch involucrados. El cambio es puramente infraestructural:

| Archivo actual | Cambio |
|---|---|
| `src/payload.config.ts` | +5 imports, +1 modificación en array collections |

## Diagrama de Dependencias entre Colecciones

```mermaid
graph TD
    subgraph "Orden de registro en collections[]"
        A1[Users] --> A2[Media]
        A2 --> A3[GuestSessions]
        A3 --> A4[Lists]
        A4 --> A5[Tasks]
        A5 --> A6[TaskLogs]
        A6 --> A7[FocusSessions]
    end

    subgraph "Dependencias entre schemas"
        L[Lists] -.->|relationship| T[Tasks]
        T -.->|relationship| TL[TaskLogs]
        T -.->|hook usa| GS[GuestSessions]
    end
```

**Reglas del orden:**
1. `GuestSessions` antes que `Tasks` — el hook `afterChange` de Tasks referencia guestId (aunque no sea relationship directa, PayloadCMS procesa hooks que pueden referenciar otras colecciones)
2. `Lists` antes que `Tasks` — Tasks tiene `{ type: 'relationship', relationTo: 'lists' }`
3. `Tasks` antes que `TaskLogs` — TaskLogs tiene `{ type: 'relationship', relationTo: 'tasks' }`
4. `FocusSessions` al final — no tiene relaciones entrantes ni salientes

## Flujo de Inicialización

```mermaid
sequenceDiagram
    participant PM as pnpm dev
    participant PC as PayloadCMS
    participant DB as SQLite

    PM->>PC: buildConfig()
    PC->>PC: Procesa collections[] en orden
    PC->>DB: CREATE TABLE IF NOT EXISTS users
    PC->>DB: CREATE TABLE IF NOT EXISTS media
    PC->>DB: CREATE TABLE IF NOT EXISTS guest_sessions
    PC->>DB: CREATE TABLE IF NOT EXISTS lists
    PC->>DB: CREATE TABLE IF NOT EXISTS tasks
    PC->>DB: CREATE TABLE IF NOT EXISTS task_logs
    PC->>DB: CREATE TABLE IF NOT EXISTS focus_sessions
    PC-->>PM: Servidor listo en :3000
```

## Código Esperado (payload.config.ts modificado)

```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { GuestSessions } from './collections/GuestSessions'
import { Lists } from './collections/Lists'
import { Tasks } from './collections/Tasks'
import { TaskLogs } from './collections/TaskLogs'
import { FocusSessions } from './collections/FocusSessions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, GuestSessions, Lists, Tasks, TaskLogs, FocusSessions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
```
