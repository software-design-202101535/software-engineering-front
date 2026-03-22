import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export function Table<T>({ columns, data, isLoading, emptyMessage = '데이터가 없습니다.', onRowClick }: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-on-surface-variant">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-on-surface">
        <thead>
          <tr className="bg-surface-container">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-on-surface-variant">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-t border-surface-container
                  ${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface'}
                  ${onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : ''}
                  transition-colors duration-100
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
