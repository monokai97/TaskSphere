'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Task } from '@/payload-types'

const TASKS_KEY = 'tasks'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseTasksParams {
  listId?: number
  status?: 'pending' | 'completed'
}

interface CreateTaskInput {
  title: string
  description?: string
  list: string
  dueDate?: string
  important?: boolean
}

interface UpdateTaskInput {
  title?: string
  description?: string
  status?: 'pending' | 'completed'
  important?: boolean
  dueDate?: string | null
  sortOrder?: number
}

interface ToggleTaskParams {
  id: number
  status: 'pending' | 'completed'
}

interface TasksResponse {
  docs: Task[]
  totalDocs: number
}

// ─── Query ────────────────────────────────────────────────────────────────────

export function useTasks(params?: UseTasksParams) {
  return useQuery<TasksResponse>({
    queryKey: [TASKS_KEY, params?.listId, params?.status],
    queryFn: async ({ queryKey }) => {
      const [, listId, status] = queryKey
      const searchParams = new URLSearchParams()
      if (listId) searchParams.set('list', String(listId))
      if (status) searchParams.set('status', status as string)
      const url = `/api/tasks?${searchParams.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    },
    staleTime: 30_000,
    gcTime: 300_000,
    retry: 1,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (data) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.title?.[0] || 'Failed to create task')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] })
    },
  })
}

export function useToggleTask(listId?: number) {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, ToggleTaskParams>({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to toggle task')
      return res.json()
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_KEY, listId] })
      const previousData = queryClient.getQueryData<TasksResponse>([
        TASKS_KEY,
        listId,
      ])

      queryClient.setQueryData<TasksResponse>([TASKS_KEY, listId], (old) => {
        if (!old) return old
        return {
          ...old,
          docs: old.docs.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status,
                  completedAt:
                    status === 'completed' ? new Date().toISOString() : null,
                }
              : task,
          ),
        }
      })

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previousData?: TasksResponse } | undefined
      if (ctx?.previousData) {
        queryClient.setQueryData([TASKS_KEY, listId], ctx.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, listId] })
    },
  })
}

export function useDeleteTask(listId?: number) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete task')
      return res.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_KEY, listId] })
      const previousData = queryClient.getQueryData<TasksResponse>([
        TASKS_KEY,
        listId,
      ])

      queryClient.setQueryData<TasksResponse>([TASKS_KEY, listId], (old) => {
        if (!old) return old
        return { ...old, docs: old.docs.filter((task) => task.id !== id) }
      })

      return { previousData }
    },
    onError: (_err, _id, context) => {
      const ctx = context as { previousData?: TasksResponse } | undefined
      if (ctx?.previousData) {
        queryClient.setQueryData([TASKS_KEY, listId], ctx.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, listId] })
    },
  })
}

export function useUpdateTask(listId?: number) {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, { id: number } & UpdateTaskInput>({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, listId] })
    },
  })
}
