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
import { Categories } from './collections/Categories'
import { Tasks } from './collections/Tasks'
import { TaskLogs } from './collections/TaskLogs'
import { FocusSessions } from './collections/FocusSessions'
import { Profiles } from './collections/Profiles'
import { Sessions } from './collections/Sessions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, GuestSessions, Lists, Categories, Tasks, TaskLogs, FocusSessions, Profiles, Sessions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    wal: true,
  }),
  sharp,
  plugins: [],
})
