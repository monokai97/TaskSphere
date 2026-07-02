import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

import { QueryProvider } from '../../src/providers/QueryProvider.js'
import { ThemeProvider, useTheme } from '../../src/providers/ThemeProvider.js'

let localStorageStore: Record<string, string> = {}
const matchMediaListeners: Map<string, Set<EventListener>> = new Map()

beforeEach(() => {
  localStorageStore = {}
  matchMediaListeners.clear()

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key]
      }),
      clear: vi.fn(() => {
        localStorageStore = {}
      }),
    },
    writable: true,
    configurable: true,
  })

  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn((query: string) => {
      if (!matchMediaListeners.has(query)) {
        matchMediaListeners.set(query, new Set())
      }
      return {
        matches: false,
        media: query,
        addEventListener: (_type: string, listener: EventListener) => {
          matchMediaListeners.get(query)!.add(listener)
        },
        removeEventListener: (_type: string, listener: EventListener) => {
          matchMediaListeners.get(query)!.delete(listener)
        },
      }
    }),
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('dark')
})

describe('QueryProvider', () => {
  it('renders children', () => {
    render(
      <QueryProvider>
        <div data-testid="child">Hello</div>
      </QueryProvider>,
    )

    expect(screen.getByTestId('child')).toBeDefined()
    expect(screen.getByText('Hello')).toBeDefined()
  })
})

describe('ThemeProvider', () => {
  it('reads theme from localStorage on mount', async () => {
    localStorageStore.theme = 'dark'

    function TestConsumer() {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    })
  })

  it('defaults to system theme when localStorage is empty', async () => {
    function TestConsumer() {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system')
    })
  })

  it('applies dark class to html when setTheme("dark")', async () => {
    function TestConsumer() {
      const { setTheme } = useTheme()
      return <button onClick={() => setTheme('dark')}>Dark</button>
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    )

    await act(async () => {
      screen.getByText('Dark').click()
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from html when setTheme("light")', async () => {
    document.documentElement.classList.add('dark')

    function TestConsumer() {
      const { setTheme } = useTheme()
      return <button onClick={() => setTheme('light')}>Light</button>
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    )

    await act(async () => {
      screen.getByText('Light').click()
    })

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme to localStorage on change', async () => {
    function TestConsumer() {
      const { setTheme } = useTheme()
      return <button onClick={() => setTheme('dark')}>Dark</button>
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    )

    await act(async () => {
      screen.getByText('Dark').click()
    })

    expect(localStorageStore.theme).toBe('dark')
  })

  it('updates context value after setTheme', async () => {
    localStorageStore.theme = 'light'

    function TestConsumer() {
      const { theme, setTheme } = useTheme()
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <button onClick={() => setTheme('dark')}>Dark</button>
        </div>
      )
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light')
    })

    await act(async () => {
      screen.getByText('Dark').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    })
  })

  it('registers matchMedia listener for dark mode when theme is system', async () => {
    localStorageStore.theme = 'system'

    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    )

    await waitFor(() => {
      const darkQuery = '(prefers-color-scheme: dark)'
      const listeners = matchMediaListeners.get(darkQuery)
      expect(listeners).toBeDefined()
      expect(listeners!.size).toBeGreaterThan(0)
    })
  })
})
