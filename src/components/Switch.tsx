export interface SwitchProps {
  label: string
  checked?: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, checked = false, onChange }: SwitchProps) {
  return (
    <label>
      {label}
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}
