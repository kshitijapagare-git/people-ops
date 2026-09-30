import type { ChangeEvent } from 'react'

export interface CurrencyInputProps {
  label: string
  minorUnits: number
  onChange: (minorUnits: number) => void
  required?: boolean
}

/** Converts a major-unit display string (e.g. "12.34") into integer minor units (1234) without floating-point math. */
function toMinorUnits(display: string): number {
  const trimmed = display.trim()
  if (trimmed === '') return 0
  const negative = trimmed.startsWith('-')
  const unsigned = negative ? trimmed.slice(1) : trimmed
  const [wholePart, fracPart = ''] = unsigned.split('.')
  const whole = wholePart === '' ? 0 : parseInt(wholePart, 10)
  const fracDigits = (fracPart + '00').slice(0, 2)
  const frac = parseInt(fracDigits, 10)
  const wholeSafe = Number.isNaN(whole) ? 0 : whole
  const fracSafe = Number.isNaN(frac) ? 0 : frac
  const total = wholeSafe * 100 + fracSafe
  return negative ? -total : total
}

function toDisplay(minorUnits: number): string {
  const negative = minorUnits < 0
  const abs = Math.abs(Math.trunc(minorUnits))
  const whole = Math.floor(abs / 100)
  const frac = abs % 100
  const display = `${whole}.${frac.toString().padStart(2, '0')}`
  return negative ? `-${display}` : display
}

export function CurrencyInput({ label, minorUnits, onChange, required }: CurrencyInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(toMinorUnits(event.target.value))
  }

  return (
    <label>
      {label}
      <input type="text" inputMode="decimal" value={toDisplay(minorUnits)} onChange={handleChange} required={required} />
    </label>
  )
}
