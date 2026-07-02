'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { OutlookCalendarIntegration } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  integrations: Record<string, unknown> | null
}

const defaultOutlookCalendar: z.infer<typeof OutlookCalendarIntegration> = {
  importEvents: true,
  syncCompleted: true,
  primaryCalendar: 'Work',
  syncFrequency: 'Real-time (Push)',
}

export function useOutlookCalendarSession() {
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

export function useOutlookCalendarIntegration() {
  const { data: session, isLoading, isFetched } = useOutlookCalendarSession()

  const outlookCalendar = session?.integrations?.outlookCalendar as z.infer<typeof OutlookCalendarIntegration> | undefined

  return {
    preferences: outlookCalendar ?? defaultOutlookCalendar,
    isLoading,
    isFetched,
  }
}

export function useUpdateOutlookCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof OutlookCalendarIntegration>) => {
      const session = queryClient.getQueryData<SessionData>([SESSION_KEY])
      const integrations = { ...(session?.integrations ?? {}), outlookCalendar: input }
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update Outlook Calendar integration')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        const integrations = { ...(prev.integrations ?? {}), outlookCalendar: input }
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
