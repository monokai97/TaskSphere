'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) return stored
  }
  return 'system'
}

function resolveTheme(theme: Theme): boolean {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return theme === 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const isDark = resolveTheme(theme)
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
