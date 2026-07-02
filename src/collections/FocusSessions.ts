import type { CollectionConfig } from 'payload'

export const FocusSessions: CollectionConfig = {
  slug: 'focus-sessions',
  access: {
    read: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    create: ({ req }) => {
      return !!req.headers.get('x-guest-id')
    },
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'guestId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      min: 1,
      max: 120,
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString().split('T')[0],
    },
  ],
}
