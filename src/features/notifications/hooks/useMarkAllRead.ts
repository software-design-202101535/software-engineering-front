import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAllAsRead } from '@/api/notifications'
import type { Notification } from '@/types'
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications'

interface RollbackContext {
  previous: Notification[] | undefined
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation<void, Error, void, RollbackContext>({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      const previous = qc.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY)
      qc.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        old?.map((n) => ({ ...n, read: true })) ?? [],
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(NOTIFICATIONS_QUERY_KEY, ctx.previous)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })
}
