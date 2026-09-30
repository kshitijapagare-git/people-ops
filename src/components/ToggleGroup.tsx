export interface ToggleGroupOption<T extends string> {
  label: string
  value: T
}

export interface ToggleGroupProps<T extends string> {
  label: string
  value: T
  onChange: (value: T) => void
  options: ToggleGroupOption<T>[]
}

export function ToggleGroup<T extends string>({ label, value, onChange, options }: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={label}>
      <span>{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
