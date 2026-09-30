export interface RatingProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  max?: number
  disabled?: boolean
}

export function Rating({ label, value, onChange, max = 5, disabled }: RatingProps) {
  const stars = Array.from({ length: max }, (_, index) => index + 1)

  return (
    <div role="group" aria-label={label}>
      <span>{label}</span>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-pressed={value !== null && star <= value}
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            onChange(star)
          }}
        >
          {value !== null && star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
