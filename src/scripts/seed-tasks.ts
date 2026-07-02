import { getPayload } from 'payload'
import config from '@payload-config'
import { DEFAULT_LISTS } from '@/lib/payload-client'
import { eq } from '@payloadcms/db-sqlite/drizzle'
import { guest_sessions, lists, tasks } from '@/payload-generated-schema'

const SEED_GUEST = 'seed-demo-guest'

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const drizzle = payload.db.drizzle

  // Ensure guest session
  const existingSession = await drizzle
    .select()
    .from(guest_sessions)
    .where(eq(guest_sessions.guestId, SEED_GUEST))
    .limit(1)

  if (existingSession.length === 0) {
    await drizzle
      .insert(guest_sessions)
      .values({
        guestId: SEED_GUEST,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    console.log('Created guest session:', SEED_GUEST)
  } else {
    console.log('Using existing session:', SEED_GUEST)
  }

  // Ensure default lists
  const existingLists = await drizzle
    .select()
    .from(lists)
    .where(eq(lists.guestId, SEED_GUEST))

  const listMap = new Map<string, number>()
  for (const listDef of DEFAULT_LISTS) {
    const found = existingLists.find((l) => l.name === listDef.name)
    if (found) {
      listMap.set(found.name, found.id)
    } else {
      const [l] = await drizzle
        .insert(lists)
        .values({
          name: listDef.name,
          icon: listDef.icon,
          color: listDef.color,
          isDefault: listDef.isDefault,
          sortOrder: listDef.sortOrder,
          guestId: SEED_GUEST,
        })
        .returning({ id: lists.id, name: lists.name })
      listMap.set(l.name, l.id)
      console.log('Created list:', l.name)
    }
  }

  // Seed 2 tasks for TODAY
  const today = new Date().toISOString()
  const taskData = [
    {
      title: 'Comprar víveres para la cena',
      list: listMap.get('My Day')!,
      important: true,
      dueDate: today,
      guestId: SEED_GUEST,
      status: 'pending' as const,
      sortOrder: 0,
    },
    {
      title: 'Preparar presentación del proyecto',
      list: listMap.get('Tasks')!,
      dueDate: today,
      guestId: SEED_GUEST,
      status: 'pending' as const,
      sortOrder: 1,
    },
  ]

  for (const t of taskData) {
    await drizzle
      .insert(tasks)
      .values({
        title: t.title,
        status: t.status,
        important: t.important ?? false,
        dueDate: t.dueDate,
        list: t.list,
        guestId: t.guestId,
        sortOrder: t.sortOrder,
      })
    console.log(`  ✓ Task seeded: "${t.title}"`)
  }

  console.log('\nDone — 2 tasks seeded for today.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
