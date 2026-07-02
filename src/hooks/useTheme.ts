'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SESSION_KEY = 'session'

interface SessionData {
  theme: string | null
  accent: string | null
  density: string | null
}

export function useTheme() {
  return useQuery<SessionData | null>({
    queryKey: [SESSION_KEY],
    queryFn: async () => {
      const res = await fetch('/api/session')
      if (!res.ok) throw new Error('Failed to fetch session')
      return res.json()
    },
    staleTime: 60_000,
    retry: 1,
    select: (data) => data,
  })
}

export function useThemePreferences() {
  const { data: session, isLoading, isFetched } = useTheme()

  return {
    theme: (session?.theme ?? 'system') as 'light' | 'dark' | 'system',
    accent: session?.accent ?? '#2563eb',
    density: session?.density ?? 'Comfortable',
    isLoading,
    isFetched,
  }
}

export function useUpdateTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      theme?: 'light' | 'dark' | 'system'
      accent?: string
      density?: string
    }) => {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update theme')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        queryClient.setQueryData<SessionData>([SESSION_KEY], { ...prev, ...input })
      }
      return { prev }
    },
    onError: (_err, _input, context) => {
      if (context?.prev) {
        queryClient.setQueryData([SESSION_KEY], context.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SESSION_KEY] })
    },
  })
}
