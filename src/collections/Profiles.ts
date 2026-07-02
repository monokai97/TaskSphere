import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'guestId'],
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
      name: 'fullName',
      type: 'text',
      maxLength: 200,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 160,
    },
    {
      name: 'avatar',
      type: 'text',
    },
    {
      name: 'defaultListVisibility',
      type: 'select',
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Shared', value: 'shared' },
      ],
      defaultValue: 'private',
    },
    {
      name: 'allowAccessRequests',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showActivityInSharedLists',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Product Designer', value: 'designer' },
        { label: 'Workspace Admin', value: 'admin' },
        { label: 'Project Manager', value: 'manager' },
        { label: 'Guest Contributor', value: 'viewer' },
      ],
      defaultValue: 'designer',
    },
  ],
}
