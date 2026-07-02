'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { EmailSummaryPreferences } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  guestId: string
  createdAt: string
  locale: string | null
  theme: string | null
  notificationsEnabled: boolean | null
  twoFactorEnabled: boolean | null
  desktopAlertPreferences: Record<string, unknown> | null
  emailSummaryPreferences: z.infer<typeof EmailSummaryPreferences> | null
}

const defaultEmailSummary: z.infer<typeof EmailSummaryPreferences> = {
  dailyBrief: true,
  weeklyReport: false,
  frequency: 'Daily',
  contentTypes: {
    completedTasks: true,
    overdueReminders: true,
    upcomingDeadlines: false,
    focusStatistics: true,
  },
}

export function useEmailSummary() {
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

export function useEmailSummaryPreferences() {
  const { data: session, isLoading, isFetched } = useEmailSummary()

  return {
    preferences: session?.emailSummaryPreferences ?? defaultEmailSummary,
    profileEmail: null,
    isLoading,
    isFetched,
  }
}

export function useUpdateEmailSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof EmailSummaryPreferences>) => {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailSummaryPreferences: input }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update email summary')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        queryClient.setQueryData<SessionData>([SESSION_KEY], {
          ...prev,
          emailSummaryPreferences: input,
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
