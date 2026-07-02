import React from 'react'
import './styles.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { MobileNav } from '@/components/layout/MobileNav'

export const metadata = {
  title: 'Task Sphere',
  description: 'Task Sphere — Gestión de tareas simple y elegante',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="flex min-h-screen">
              {children}
            </div>
            <MobileNav />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
