'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { ZapierIntegration } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  integrations: Record<string, unknown> | null
}

const defaultZapier: z.infer<typeof ZapierIntegration> = {
  newTaskWebhook: true,
  taskCompletedWebhook: true,
}

export function useZapierSession() {
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

export function useZapierIntegration() {
  const { data: session, isLoading, isFetched } = useZapierSession()

  const zapier = session?.integrations?.zapier as z.infer<typeof ZapierIntegration> | undefined

  return {
    preferences: zapier ?? defaultZapier,
    isLoading,
    isFetched,
  }
}

export function useUpdateZapier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof ZapierIntegration>) => {
      const session = queryClient.getQueryData<SessionData>([SESSION_KEY])
      const integrations = { ...(session?.integrations ?? {}), zapier: input }
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update Zapier integration')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        const integrations = { ...(prev.integrations ?? {}), zapier: input }
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
