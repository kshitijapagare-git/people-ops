import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Stepper } from '../components/Stepper'

function ControlledStepper({ initial }: { initial: number }) {
  const [value, setValue] = useState(initial)
  return <Stepper label="Headcount cap" value={value} onChange={setValue} min={1} max={5000} step={5} />
}

describe('Stepper bounds', () => {
  it('does not decrement below the minimum', async () => {
    const user = userEvent.setup()
    render(<ControlledStepper initial={1} />)
    await user.click(screen.getByRole('button', { name: /decrement|decrease|-/i }))
    expect(screen.getByLabelText('Headcount cap')).toHaveValue(1)
  })

  it('does not increment above the maximum', async () => {
    const user = userEvent.setup()
    render(<ControlledStepper initial={5000} />)
    await user.click(screen.getByRole('button', { name: /increment|increase|\+/i }))
    expect(screen.getByLabelText('Headcount cap')).toHaveValue(5000)
  })

  it('moves by exactly one step per click', async () => {
    const user = userEvent.setup()
    render(<ControlledStepper initial={50} />)
    await user.click(screen.getByRole('button', { name: /increment|increase|\+/i }))
    expect(screen.getByLabelText('Headcount cap')).toHaveValue(55)
    await user.click(screen.getByRole('button', { name: /decrement|decrease|-/i }))
    await user.click(screen.getByRole('button', { name: /decrement|decrease|-/i }))
    expect(screen.getByLabelText('Headcount cap')).toHaveValue(45)
  })
})
