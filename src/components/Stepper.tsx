export interface StepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function Stepper({ label, value, onChange, min, max, step }: StepperProps) {
  function commit(next: number) {
    onChange(clamp(next, min, max))
  }

  function handleInputChange(rawValue: string) {
    const parsed = Number(rawValue)
    if (Number.isNaN(parsed)) return
    commit(parsed)
  }

  return (
    <label>
      {label}
      <button type="button" onClick={() => commit(value - step)} aria-label={`Decrease ${label}`}>
        -
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <button type="button" onClick={() => commit(value + step)} aria-label={`Increase ${label}`}>
        +
      </button>
    </label>
  )
}
