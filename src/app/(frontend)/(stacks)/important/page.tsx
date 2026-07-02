import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function ImportantPage() {
  return (
    <>
      <TopBar title="Important" />
      <StackShell
        listName="Important"
        additionalGuestId="seed-demo-guest"
        emptyState={{
          icon: 'star',
          title: 'No important tasks',
          description: 'Flag tasks as important to see them here.',
        }}
      />
    </>
  )
}
