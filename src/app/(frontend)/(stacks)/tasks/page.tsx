import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function TasksPage() {
  return (
    <>
      <TopBar title="Tasks" />
      <StackShell
        listName="Tasks"
        additionalGuestId="seed-demo-guest"
        emptyState={{
          icon: 'task_alt',
          title: 'No tasks yet',
          description: 'All your tasks live here.',
        }}
      />
    </>
  )
}
