'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Profile } from '@/payload-types'

const PROFILE_KEY = 'profile'

interface UpdateProfileInput {
  fullName?: string
  email?: string
  bio?: string
  avatar?: string
  role?: 'designer' | 'admin' | 'manager' | 'viewer'
  defaultListVisibility?: 'private' | 'shared'
  allowAccessRequests?: boolean
  showActivityInSharedLists?: boolean
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: [PROFILE_KEY],
    queryFn: async () => {
      const res = await fetch('/api/profiles')
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    staleTime: 60_000,
    retry: 1,
  })
}

export function useUpsertProfile() {
  const queryClient = useQueryClient()

  return useMutation<Profile, Error, UpdateProfileInput>({
    mutationFn: async (data) => {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.fullName?.[0] || 'Failed to save profile')
      }
      return res.json()
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [PROFILE_KEY] })
      const previousData = queryClient.getQueryData<Profile | null>([PROFILE_KEY])

      queryClient.setQueryData<Profile | null>([PROFILE_KEY], (old) => {
        if (!old) return old
        return { ...old, ...data }
      })

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previousData?: Profile | null } | undefined
      if (ctx?.previousData) {
        queryClient.setQueryData([PROFILE_KEY], ctx.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] })
    },
  })
}
