import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function PlannedPage() {
  return (
    <>
      <TopBar title="Planned" />
      <StackShell
        listName="Planned"
        additionalGuestId="seed-demo-guest"
        emptyState={{
          icon: 'calendar_month',
          title: 'No planned tasks',
          description: 'Tasks with a due date will show up here.',
        }}
      />
    </>
  )
}
