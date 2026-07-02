import type { CollectionConfig } from 'payload'

export const TaskLogs: CollectionConfig = {
  slug: 'task-logs',
  access: {
    read: () => false,
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'task',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'guestId',
      type: 'text',
      required: true,
    },
    {
      name: 'operation',
      type: 'select',
      options: [
        { label: 'Create', value: 'CREATE' },
        { label: 'Update', value: 'UPDATE' },
        { label: 'Delete', value: 'DELETE' },
      ],
      required: true,
    },
    {
      name: 'previousState',
      type: 'json',
    },
    {
      name: 'newState',
      type: 'json',
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
