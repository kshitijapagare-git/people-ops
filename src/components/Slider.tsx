export interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  suffix?: string
  disabled?: boolean
}

export function Slider({ label, value, onChange, min, max, step, suffix, disabled }: SliderProps) {
  return (
    <label>
      {label}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>
        {value}
        {suffix ?? ''}
      </span>
    </label>
  )
}
