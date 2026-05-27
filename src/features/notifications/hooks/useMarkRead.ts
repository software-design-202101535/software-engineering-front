import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAsRead } from '@/api/notifications'
import type { Notification } from '@/types'
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications'

interface RollbackContext {
  previous: Notification[] | undefined
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation<void, Error, number, RollbackContext>({
    mutationFn: markAsRead,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      const previous = qc.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY)
      qc.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? [],
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(NOTIFICATIONS_QUERY_KEY, ctx.previous)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })
}
