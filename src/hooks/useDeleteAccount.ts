'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useDeleteAccount() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/session', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      return res.json()
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/')
    },
  })
}
