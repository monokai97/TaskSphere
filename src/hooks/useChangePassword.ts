'use client'

import { useMutation } from '@tanstack/react-query'

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useChangePassword() {
  return useMutation<{ success: boolean }, Error, ChangePasswordInput>({
    mutationFn: async (data) => {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        const message =
          err.error?.currentPassword?.[0] ||
          err.error?.newPassword?.[0] ||
          err.error?.confirmPassword?.[0] ||
          err.error ||
          'Failed to change password'
        throw new Error(message)
      }
      return res.json()
    },
  })
}
