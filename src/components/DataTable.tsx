import { useMemo, useState, type ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  render: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  defaultSortKey?: string
}

type SortDirection = 'asc' | 'desc'

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === undefined || a === null) return -1
  if (b === undefined || b === null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export function DataTable<T>({ columns, rows, rowKey, defaultSortKey }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    const column = columns.find((c) => c.key === sortKey)
    if (!column) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const result = compareValues(
        (a as unknown as Record<string, unknown>)[sortKey],
        (b as unknown as Record<string, unknown>)[sortKey],
      )
      return sortDirection === 'asc' ? result : -result
    })
    return copy
  }, [rows, sortKey, sortDirection, columns])

  function handleHeaderClick(column: DataTableColumn<T>) {
    if (!column.sortable) return
    if (sortKey === column.key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column.key)
      setSortDirection('asc')
    }
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>
              {column.sortable ? (
                <button type="button" onClick={() => handleHeaderClick(column)}>
                  {column.header}
                  {sortKey === column.key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              ) : (
                column.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
