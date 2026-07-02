import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => !!req.headers.get('x-guest-id'),
    update: ({ req }) => !!req.headers.get('x-guest-id'),
    delete: ({ req }) => !!req.headers.get('x-guest-id'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'guestId',
      type: 'text',
      required: true,
      index: true,
    },
  ],
  upload: true,
}
