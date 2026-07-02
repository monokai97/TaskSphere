import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function MyDayPage() {
  return (
    <>
      <TopBar title="My Day" />
      <StackShell
        listName="My Day"
        additionalGuestId="seed-demo-guest"
        emptyState={{
          icon: 'sunny',
          title: 'This is your My Day',
          description: 'Tasks added here appear when you need them most.',
        }}
      />
    </>
  )
}
