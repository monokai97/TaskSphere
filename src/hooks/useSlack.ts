'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { SlackIntegration } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  integrations: Record<string, unknown> | null
}

const defaultSlack: z.infer<typeof SlackIntegration> = {
  syncStatus: true,
  taskNotifications: false,
  channel: '#daily-updates',
}

export function useSlackSession() {
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

export function useSlackIntegration() {
  const { data: session, isLoading, isFetched } = useSlackSession()

  const slack = session?.integrations?.slack as z.infer<typeof SlackIntegration> | undefined

  return {
    preferences: slack ?? defaultSlack,
    isLoading,
    isFetched,
  }
}

export function useUpdateSlack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof SlackIntegration>) => {
      const session = queryClient.getQueryData<SessionData>([SESSION_KEY])
      const integrations = { ...(session?.integrations ?? {}), slack: input }
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update Slack integration')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        const integrations = { ...(prev.integrations ?? {}), slack: input }
        queryClient.setQueryData<SessionData>([SESSION_KEY], { ...prev, integrations })
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
