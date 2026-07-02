'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { UpdateSessionInput, DesktopAlertPreferences } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  guestId: string
  createdAt: string
  locale: string | null
  theme: string | null
  notificationsEnabled: boolean | null
  twoFactorEnabled: boolean | null
  desktopAlertPreferences: z.infer<typeof DesktopAlertPreferences> | null
}

const defaultDesktopAlerts: z.infer<typeof DesktopAlertPreferences> = {
  masterOn: true,
  triggers: {
    taskReminders: true,
    sharedList: true,
    dueDate: true,
    systemUpdates: false,
  },
  sound: 'Zen Bell (Default)',
  alertStyle: 'banner',
}

export function useSession() {
  return useQuery<SessionData | null>({
    queryKey: [SESSION_KEY],
    queryFn: async () => {
      const res = await fetch('/api/session')
      if (!res.ok) throw new Error('Failed to fetch session')
      return res.json()
    },
    staleTime: 60_000,
    retry: 1,
  })
}

export function useDesktopAlerts() {
  const { data: session, isLoading, isFetched } = useSession()

  return {
    preferences: session?.desktopAlertPreferences ?? defaultDesktopAlerts,
    isLoading,
    isFetched,
  }
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: z.infer<typeof UpdateSessionInput>) => {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update session')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        queryClient.setQueryData<SessionData>([SESSION_KEY], {
          ...prev,
          ...input,
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
