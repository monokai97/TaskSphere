'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@/payload-types'

const SESSIONS_KEY = 'sessions'

interface SessionsResponse {
  docs: Session[]
  totalDocs: number
}

export function useSessions() {
  return useQuery<SessionsResponse>({
    queryKey: [SESSIONS_KEY],
    queryFn: async () => {
      const res = await fetch('/api/sessions')
      if (!res.ok) throw new Error('Failed to fetch sessions')
      return res.json()
    },
    staleTime: 30_000,
    retry: 1,
  })
}

export function useSignOutSession() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to sign out session')
      return res.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [SESSIONS_KEY] })
      const previousData = queryClient.getQueryData<SessionsResponse>([SESSIONS_KEY])

      queryClient.setQueryData<SessionsResponse>([SESSIONS_KEY], (old) => {
        if (!old) return old
        return { ...old, docs: old.docs.filter((s) => s.id !== id) }
      })

      return { previousData }
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([SESSIONS_KEY], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS_KEY] })
    },
  })
}

export function useSignOutAllSessions() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/sessions', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to sign out sessions')
      return res.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [SESSIONS_KEY] })
      const previousData = queryClient.getQueryData<SessionsResponse>([SESSIONS_KEY])

      queryClient.setQueryData<SessionsResponse>([SESSIONS_KEY], (old) => {
        if (!old) return old
        return { ...old, docs: old.docs.filter((s) => s.isCurrent) }
      })

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([SESSIONS_KEY], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS_KEY] })
    },
  })
}
