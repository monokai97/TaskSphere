import 'dotenv/config'
import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

const testDb = resolve(process.cwd(), 'test-task-sphere.db')
if (existsSync(testDb)) {
  unlinkSync(testDb)
}
process.env.DATABASE_URL = `file:${testDb}`
