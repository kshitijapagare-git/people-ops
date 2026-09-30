export interface DatePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  max?: string
  required?: boolean
}

export function DatePicker({ label, value, onChange, max, required }: DatePickerProps) {
  return (
    <label>
      {label}
      <input
        type="date"
        value={value}
        max={max}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
