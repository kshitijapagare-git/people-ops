export interface SelectOption<T extends string> {
  label: string
  value: T
}

export interface SelectProps<T extends string> {
  label: string
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
}

export function Select<T extends string>({ label, value, onChange, options }: SelectProps<T>) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
