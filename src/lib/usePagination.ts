import { useState } from 'react'

export const PAGE_SIZE = 10

/** Slices rows into pages; the current page is clamped when the list shrinks. */
export function usePagination<T>(rows: T[]) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  return {
    page: current,
    totalPages,
    setPage,
    rows: rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
  }
}
