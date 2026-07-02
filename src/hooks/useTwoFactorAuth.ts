'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const TWO_FACTOR_KEY = 'two-factor'

export function useTwoFactorStatus() {
  return useQuery<{ enabled: boolean }>({
    queryKey: [TWO_FACTOR_KEY],
    queryFn: async () => {
      const res = await fetch('/api/session')
      if (!res.ok) throw new Error('Failed to fetch 2FA status')
      const data = await res.json()
      return { enabled: data.twoFactorEnabled ?? false }
    },
    staleTime: 60_000,
  })
}

interface SetupResponse {
  secret: string
  uri: string
  backupCodes: string[]
}

export function useSetupTwoFactor() {
  return useMutation<SetupResponse, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to setup 2FA')
      }
      return res.json()
    },
  })
}

export function useVerifyTwoFactor() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, { token: string }>({
    mutationFn: async ({ token }) => {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const err = await res.json()
        const message = err.error?.token?.[0] || err.error || 'Failed to verify code'
        throw new Error(message)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to disable 2FA')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
