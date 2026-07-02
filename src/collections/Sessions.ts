import type { CollectionConfig } from 'payload'

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: {
    useAsTitle: 'deviceName',
    defaultColumns: ['deviceName', 'browser', 'location', 'lastActiveAt'],
  },
  access: {
    read: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    create: ({ req }) => !!req.headers.get('x-guest-id'),
    update: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    delete: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
  },
  fields: [
    {
      name: 'guestId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'deviceName',
      type: 'text',
      required: true,
    },
    {
      name: 'deviceType',
      type: 'select',
      options: [
        { label: 'Smartphone', value: 'smartphone' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Laptop', value: 'laptop' },
        { label: 'Desktop', value: 'desktop' },
      ],
      required: true,
    },
    {
      name: 'browser',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'ip',
      type: 'text',
    },
    {
      name: 'lastActiveAt',
      type: 'date',
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
