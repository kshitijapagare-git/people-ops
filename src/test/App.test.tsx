import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { PeopleOpsProvider } from '../state/PeopleOpsContext'

type User = ReturnType<typeof userEvent.setup>

function renderApp() {
  const user = userEvent.setup()
  render(
    <PeopleOpsProvider>
      <App />
    </PeopleOpsProvider>,
  )
  return user
}

async function addDepartment(user: User, name: string, code: string) {
  await user.click(screen.getByRole('button', { name: '+ Add department' }))
  const dialog = screen.getByRole('dialog', { name: 'New department' })
  await user.type(within(dialog).getByLabelText('Name'), name)
  await user.type(within(dialog).getByLabelText('Code'), code)
  await user.click(within(dialog).getByRole('button', { name: 'Add department' }))
}

describe('App', () => {
  it('shows empty states and a sidebar with both entities', async () => {
    const user = renderApp()
    expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument()
    expect(screen.getByText('No departments yet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Departments/ })).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('link', { name: /Employees/ }))
    expect(await screen.findByText('No employees yet.')).toBeInTheDocument()
  })

  it('adds, edits and deletes a department', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const row = screen.getByRole('row', { name: /Engineering/ })
    expect(within(row).getByText('ENG')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: 'Edit' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit department' })
    const name = within(dialog).getByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Platform')
    await user.click(within(dialog).getByRole('button', { name: 'Save department' }))
    expect(screen.getByRole('row', { name: /Platform/ })).toBeInTheDocument()

    await user.click(within(screen.getByRole('row', { name: /Platform/ })).getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('No departments yet.')).toBeInTheDocument()
  })

  it('closes the dialog on cancel without saving', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: '+ Add department' }))
    await user.type(screen.getByLabelText('Name'), 'Engineering')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('No departments yet.')).toBeInTheDocument()
  })

  it('adds an employee linked to a department and shows the department name', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await user.click(screen.getByRole('link', { name: /Employees/ }))

    await user.click(await screen.findByRole('button', { name: '+ Add employee' }))
    const dialog = screen.getByRole('dialog', { name: 'New employee' })
    await user.type(within(dialog).getByLabelText('First name'), 'Jane')
    await user.type(within(dialog).getByLabelText('Last name'), 'Doe')
    await user.type(within(dialog).getByLabelText('Email'), 'jane@example.com')
    await user.type(within(dialog).getByLabelText('Phone'), '555-0100')
    await user.selectOptions(within(dialog).getByLabelText('Department'), 'Engineering')
    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }))

    const row = screen.getByRole('row', { name: /Jane/ })
    expect(within(row).getByText('Engineering')).toBeInTheDocument()
    expect(within(row).getByText('jane@example.com')).toBeInTheDocument()
  })

  it('keeps the dialog open with an error when an employee has no department', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('link', { name: /Employees/ }))
    await user.click(await screen.findByRole('button', { name: '+ Add employee' }))
    const dialog = screen.getByRole('dialog', { name: 'New employee' })
    await user.type(within(dialog).getByLabelText('First name'), 'Jane')
    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('No department with id')
    expect(screen.getByText('No employees yet.')).toBeInTheDocument()
  })

  it('pages departments 10 at a time', async () => {
    const user = renderApp()
    for (let i = 1; i <= 11; i++) await addDepartment(user, `Dept ${i}`, `D${i}`)
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Dept 11/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Dept 11/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })
})
