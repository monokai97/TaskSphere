import type { CollectionConfig } from 'payload'

export const Lists: CollectionConfig = {
  slug: 'lists',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'guestId', 'isDefault'],
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
      name: 'icon',
      type: 'text',
      defaultValue: 'list',
    },
    {
      name: 'color',
      type: 'text',
    },
    {
      name: 'guestId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'privacy',
      type: 'select',
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Shared', value: 'shared' },
      ],
      defaultValue: 'private',
    },
    {
      name: 'sortOrder',
      type: 'number',
    },
  ],
}
