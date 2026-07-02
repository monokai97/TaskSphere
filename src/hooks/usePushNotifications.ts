'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { PushNotificationPreferences } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  guestId: string
  createdAt: string
  locale: string | null
  theme: string | null
  notificationsEnabled: boolean | null
  twoFactorEnabled: boolean | null
  desktopAlertPreferences: Record<string, unknown> | null
  emailSummaryPreferences: Record<string, unknown> | null
  pushNotificationPreferences: z.infer<typeof PushNotificationPreferences> | null
}

const defaultPushNotificationPreferences: z.infer<typeof PushNotificationPreferences> = {
  deviceEnabled: {
    iphone: true,
    macbook: true,
  },
  alertTypes: {
    taskReminders: true,
    dueDateAlerts: true,
    sharedListActivity: false,
    focusSession: true,
  },
  dndFrom: '22:00',
  dndTo: '07:00',
  quietDays: [5, 6],
}

export function usePushNotifications() {
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

export function usePushNotificationPreferences() {
  const { data: session, isLoading, isFetched } = usePushNotifications()

  return {
    preferences: session?.pushNotificationPreferences ?? defaultPushNotificationPreferences,
    isLoading,
    isFetched,
  }
}

export function useUpdatePushNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof PushNotificationPreferences>) => {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushNotificationPreferences: input }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update push notifications')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        queryClient.setQueryData<SessionData>([SESSION_KEY], {
          ...prev,
          pushNotificationPreferences: input,
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
