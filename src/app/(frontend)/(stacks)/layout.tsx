import { Sidebar } from '@/components/layout/Sidebar'

export default async function StacksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 ml-sidebar-width">{children}</main>
    </>
  )
}
