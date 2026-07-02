import type { CollectionConfig } from 'payload'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'list', 'dueDate'],
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
  hooks: {
    afterChange: [
      async ({ operation, previousDoc, doc, req }) => {
        if (req.payload) {
          await req.payload.create({
            collection: 'task-logs',
            data: {
              task: doc.id,
              guestId: doc.guestId,
              operation: operation.toUpperCase() as 'CREATE' | 'UPDATE' | 'DELETE',
              previousState: JSON.stringify(previousDoc),
              newState: JSON.stringify(doc),
              timestamp: new Date().toISOString(),
            },
          })
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (req.payload) {
          await req.payload.create({
            collection: 'task-logs',
            data: {
              task: doc.id,
              guestId: doc.guestId,
              operation: 'DELETE',
              previousState: JSON.stringify(doc),
              newState: null,
              timestamp: new Date().toISOString(),
            },
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 500,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 5000,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'important',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'list',
      type: 'relationship',
      relationTo: 'lists',
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
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'reminderMinutesBefore',
      type: 'number',
      label: 'Reminder (minutes before due)',
      admin: {
        placeholder: 'e.g. 15',
      },
    },
    {
      name: 'repeatType',
      type: 'select',
      options: [
        { label: 'No repeat', value: 'none' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekdays', value: 'weekdays' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Biweekly', value: 'biweekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
      ],
      defaultValue: 'none',
    },
    {
      name: 'repeatInterval',
      type: 'number',
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'repeatEndDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'repeatCount',
      type: 'number',
      min: 1,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'subtasks',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'completed',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
