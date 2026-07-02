'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { List } from '@/payload-types'

const LISTS_KEY = 'lists'

export function useLists() {
  return useQuery<{ docs: List[] }>({
    queryKey: [LISTS_KEY],
    queryFn: async () => {
      const res = await fetch('/api/lists')
      if (!res.ok) throw new Error('Failed to fetch lists')
      return res.json()
    },
    staleTime: 60_000,
  })
}

export function useList(id: string) {
  const { data, isLoading } = useLists()
  const list = data?.docs?.find((l) => String(l.id) === id)
  return { data: list, isLoading }
}

interface UpdateListInput {
  privacy?: 'private' | 'shared'
  name?: string
  icon?: string
  color?: string
}

export function useUpdateList() {
  const queryClient = useQueryClient()

  return useMutation<List, Error, { id: number } & UpdateListInput>({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update list')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] })
    },
  })
}
