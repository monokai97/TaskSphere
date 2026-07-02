import type { CollectionConfig } from 'payload'

export const GuestSessions: CollectionConfig = {
  slug: 'guest-sessions',
  access: {
    read: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    create: () => true,
    update: ({ req }) => {
      const guestId = req.headers.get('x-guest-id')
      if (!guestId) return false
      return { guestId: { equals: guestId } }
    },
    delete: () => false,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.lastActiveAt && data.lastActiveAt !== originalDoc?.lastActiveAt) {
          const lastActive = new Date(data.lastActiveAt)
          data.expiresAt = new Date(lastActive.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'guestId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
    },
    {
      name: 'lastActiveAt',
      type: 'date',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
        { label: 'Français', value: 'fr' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Português', value: 'pt' },
        { label: 'Italiano', value: 'it' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' },
      ],
      defaultValue: 'system',
    },
    {
      name: 'accent',
      type: 'text',
      defaultValue: '#2563eb',
    },
    {
      name: 'density',
      type: 'text',
      defaultValue: 'Comfortable',
    },
    {
      name: 'notificationsEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'integrations',
      type: 'json',
    },
    {
      name: 'focusSettings',
      type: 'json',
    },
    {
      name: 'passwordHash',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'twoFactorSecret',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'backupCodes',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'desktopAlertPreferences',
      type: 'json',
    },
    {
      name: 'emailSummaryPreferences',
      type: 'json',
    },
    {
      name: 'pushNotificationPreferences',
      type: 'json',
    },
    {
      name: 'dateTimePreferences',
      type: 'json',
    },
    {
      name: 'backgroundPreferences',
      type: 'json',
    },
  ],
}
