'use client'

import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BackgroundPreferences } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  backgroundPreferences: Record<string, unknown> | null
}

const defaultBackground: z.infer<typeof BackgroundPreferences> = {
  mode: 'solid',
  blur: 12,
  opacity: 85,
}

export function useBackgroundSession() {
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

export function useBackgroundPreferences() {
  const { data: session, isLoading, isFetched } = useBackgroundSession()

  const bg = session?.backgroundPreferences as z.infer<typeof BackgroundPreferences> | undefined

  return {
    preferences: bg ?? defaultBackground,
    isLoading,
    isFetched,
  }
}

export function useUpdateBackground() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof BackgroundPreferences>) => {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundPreferences: input }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update background preferences')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        queryClient.setQueryData<SessionData>([SESSION_KEY], {
          ...prev,
          backgroundPreferences: input,
        })
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
