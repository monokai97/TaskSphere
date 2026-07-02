import { Sidebar } from '@/components/layout/Sidebar'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar />
      <div className="ml-sidebar-width flex flex-1 min-w-0">
        <SettingsSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </>
  )
}
