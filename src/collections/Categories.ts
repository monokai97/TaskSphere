import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'color', 'guestId'],
  },
  access: {
    read: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    create: ({ req }) => {
      return !!req.headers.get('x-guest-id')
    },
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
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'color',
      type: 'text',
      defaultValue: '#004ac6',
    },
    {
      name: 'icon',
      type: 'text',
      defaultValue: 'label',
    },
    {
      name: 'guestId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
    },
  ],
}
