'use client'

import { z } from 'zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { DateTimePreferences } from '@/lib/schemas'

const SESSION_KEY = 'session'

interface SessionData {
  guestId: string
  createdAt: string
  locale: string | null
  dateTimePreferences: z.infer<typeof DateTimePreferences> | null
}

const defaultLocale = 'en'
const defaultDateTimePreferences: z.infer<typeof DateTimePreferences> = {
  autoDetect: true,
  dateFormat: 'ddmmyyyy',
  timeFormat: '24h',
  firstDayOfWeek: 'monday',
  timezone: 'madrid',
  timezoneAutoDetect: true,
}

export function useLanguagePreferences() {
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

export function useLanguagePrefs() {
  const { data: session, isLoading, isFetched } = useLanguagePreferences()

  return {
    locale: session?.locale ?? defaultLocale,
    dateTimePreferences: session?.dateTimePreferences ?? defaultDateTimePreferences,
    isLoading,
    isFetched,
  }
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      locale: string
      dateTimePreferences: z.infer<typeof DateTimePreferences>
    }) => {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: input.locale,
          dateTimePreferences: input.dateTimePreferences,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to update language preferences')
      }
      return res.json()
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: [SESSION_KEY] })
      const prev = queryClient.getQueryData<SessionData>([SESSION_KEY])
      if (prev) {
        queryClient.setQueryData<SessionData>([SESSION_KEY], {
          ...prev,
          locale: input.locale,
          dateTimePreferences: input.dateTimePreferences,
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
