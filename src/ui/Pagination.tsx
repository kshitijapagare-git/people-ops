interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="pagination">
      <span>Page {page}</span>
      <div>
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ‹
        </button>
        <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          ›
        </button>
      </div>
    </div>
  )
}
