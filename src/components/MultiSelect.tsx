export interface MultiSelectOption<T extends string> {
  label: string
  value: T
}

export interface MultiSelectProps<T extends string> {
  label: string
  value: T[]
  onChange: (value: T[]) => void
  options: MultiSelectOption<T>[]
}

export function MultiSelect<T extends string>({ label, value, onChange, options }: MultiSelectProps<T>) {
  function toggle(option: T) {
    const isSelected = value.includes(option)
    const next = isSelected ? value.filter((v) => v !== option) : [...value, option]
    onChange(next)
  }

  return (
    <div role="group" aria-label={label}>
      <span>{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value.includes(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
