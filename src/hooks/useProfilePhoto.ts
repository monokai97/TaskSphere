'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/payload-types'

const PROFILE_KEY = 'profile'

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient()

  return useMutation<
    { media: { url: string }; profile: Profile },
    Error,
    File
  >({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/profiles/photo', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to upload photo')
      }
      return res.json()
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: [PROFILE_KEY] })
      const previousData = queryClient.getQueryData<Profile | null>([PROFILE_KEY])
      const avatarUrl = URL.createObjectURL(file)

      queryClient.setQueryData<Profile | null>([PROFILE_KEY], (old) => {
        if (!old) return old
        return { ...old, avatar: avatarUrl }
      })

      return { previousData, objectUrl: avatarUrl }
    },
    onError: (_err, _file, context) => {
      const ctx = context as { previousData?: Profile | null; objectUrl?: string } | undefined
      if (ctx?.previousData) {
        queryClient.setQueryData([PROFILE_KEY], ctx.previousData)
      }
      if (ctx?.objectUrl) {
        URL.revokeObjectURL(ctx.objectUrl)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] })
    },
  })
}

export function useRemoveProfilePhoto() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/profiles/photo', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove photo')
      return res.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [PROFILE_KEY] })
      const previousData = queryClient.getQueryData<Profile | null>([PROFILE_KEY])

      queryClient.setQueryData<Profile | null>([PROFILE_KEY], (old) => {
        if (!old) return old
        return { ...old, avatar: null }
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
