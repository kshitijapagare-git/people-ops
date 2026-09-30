export interface DateRangePickerProps {
  label: string
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
  required?: boolean
}

/** One control writing two bound YYYY-MM-DD values together; build once, reuse for every date window. */
export function DateRangePicker({ label, from, to, onChange, required }: DateRangePickerProps) {
  return (
    <div role="group" aria-label={label}>
      <span>{label}</span>
      <label>
        From
        <input
          type="date"
          value={from}
          required={required}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />
      </label>
      <label>
        To
        <input
          type="date"
          value={to}
          min={from}
          required={required}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </label>
    </div>
  )
}
