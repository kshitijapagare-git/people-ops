import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { PeopleOpsProvider } from '../state/PeopleOpsContext'

function renderApp() {
  const user = userEvent.setup()
  render(
    <PeopleOpsProvider>
      <App />
    </PeopleOpsProvider>,
  )
  return user
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

async function addDepartment(user: ReturnType<typeof userEvent.setup>, name: string, code: string) {
  await user.click(screen.getByRole('button', { name: 'Departments' }))
  await user.click(screen.getByRole('button', { name: '+ Add department' }))
  const form = screen.getByRole('form', { name: 'Department form' })
  await user.type(within(form).getByLabelText('Name'), name)
  await user.type(within(form).getByLabelText('Code'), code)
  await user.click(within(form).getByRole('button', { name: 'Add' }))
}

async function addEmployee(
  user: ReturnType<typeof userEvent.setup>,
  firstName: string,
  lastName: string,
  email: string,
  departmentName: string,
) {
  await user.click(screen.getByRole('button', { name: 'Employees' }))
  await user.click(screen.getByRole('button', { name: '+ Add employee' }))
  await user.type(screen.getByLabelText('First name'), firstName)
  await user.type(screen.getByLabelText('Last name'), lastName)
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Phone'), '555-0100')
  await user.selectOptions(screen.getByLabelText('Department'), departmentName)
  await user.click(screen.getByRole('button', { name: 'Add' }))
}

async function addJobRole(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole('button', { name: 'Job Roles' }))
  const form = screen.getByRole('form', { name: 'Job role form' })
  await user.type(within(form).getByLabelText('Title'), title)
  const salary = within(form).getByLabelText('Base salary')
  await user.clear(salary)
  await user.type(salary, '5000.00')
  await user.click(within(form).getByRole('button', { name: 'Add' }))
}

async function addLocation(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  city: string,
  headcountCap: number,
) {
  await user.click(screen.getByRole('button', { name: 'Locations' }))
  const form = screen.getByRole('form', { name: 'Location form' })
  await user.type(within(form).getByLabelText('Name'), name)
  await user.type(within(form).getByLabelText('City'), city)
  fireEvent.change(within(form).getByLabelText('Headcount cap'), { target: { value: String(headcountCap) } })
  await user.click(within(form).getByRole('button', { name: 'Add' }))
}

async function openEmploymentForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Employments' }))
  await user.click(screen.getByRole('button', { name: '+ Add employment' }))
  return screen.getByRole('form', { name: 'Employment form' })
}

async function fillEmploymentBasics(
  user: ReturnType<typeof userEvent.setup>,
  form: HTMLElement,
  { employeeName, jobRoleTitle, locationName }: { employeeName: string; jobRoleTitle: string; locationName: string },
) {
  await user.selectOptions(within(form).getByLabelText('Employee'), employeeName)
  await user.selectOptions(within(form).getByLabelText('Job role'), jobRoleTitle)
  await user.selectOptions(within(form).getByLabelText('Location'), locationName)
}

describe('EmploymentsPage', () => {
  it('creates an employment and lists employee, role, location, type and FTE', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await addEmployee(user, 'Jane', 'Doe', 'jane@example.com', 'Engineering')
    await addJobRole(user, 'Software Engineer')
    await addLocation(user, 'Bengaluru HQ', 'Bengaluru', 10)

    const form = await openEmploymentForm(user)
    await fillEmploymentBasics(user, form, {
      employeeName: 'Jane Doe',
      jobRoleTitle: 'Software Engineer',
      locationName: 'Bengaluru HQ',
    })
    fireEvent.change(within(form).getByLabelText('Joined on'), { target: { value: daysAgo(10) } })
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    const row = screen.getByRole('row', { name: /Jane Doe/ })
    expect(within(row).getByText('Software Engineer')).toBeInTheDocument()
    expect(within(row).getByText('Bengaluru HQ')).toBeInTheDocument()
    expect(within(row).getByText('FULL_TIME')).toBeInTheDocument()
    expect(within(row).getByText('100%')).toBeInTheDocument()
  })

  it('forces FTE allocation to 100 and disables the slider when FULL_TIME is selected', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await addEmployee(user, 'Jane', 'Doe', 'jane@example.com', 'Engineering')
    await addJobRole(user, 'Software Engineer')
    await addLocation(user, 'Bengaluru HQ', 'Bengaluru', 10)

    const form = await openEmploymentForm(user)
    const typeGroup = within(form).getByRole('group', { name: 'Employment type' })

    await user.click(within(typeGroup).getByRole('button', { name: 'Part time' }))
    const slider = within(form).getByLabelText(/FTE allocation/)
    fireEvent.change(slider, { target: { value: '50' } })
    expect(slider).toHaveValue('50')
    expect(slider).not.toBeDisabled()

    await user.click(within(typeGroup).getByRole('button', { name: 'Full time' }))
    expect(slider).toHaveValue('100')
    expect(slider).toBeDisabled()
  })

  it('disables and clears the probation rating until joinedOn is more than 90 days ago', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await addEmployee(user, 'Jane', 'Doe', 'jane@example.com', 'Engineering')
    await addJobRole(user, 'Software Engineer')
    await addLocation(user, 'Bengaluru HQ', 'Bengaluru', 10)

    const form = await openEmploymentForm(user)
    fireEvent.change(within(form).getByLabelText('Joined on'), { target: { value: daysAgo(10) } })

    const ratingGroup = within(form).getByRole('group', { name: 'Probation rating' })
    const threeStars = within(ratingGroup).getByRole('button', { name: '3 stars' })
    expect(threeStars).toBeDisabled()

    fireEvent.change(within(form).getByLabelText('Joined on'), { target: { value: daysAgo(100) } })
    expect(threeStars).not.toBeDisabled()
    await user.click(threeStars)
    expect(threeStars).toHaveAttribute('aria-pressed', 'true')
  })

  it('rejects an employment that would exceed the headcount cap and names the location', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await addEmployee(user, 'Jane', 'Doe', 'jane@example.com', 'Engineering')
    await addEmployee(user, 'Grace', 'Hopper', 'grace@example.com', 'Engineering')
    await addJobRole(user, 'Software Engineer')
    await addLocation(user, 'Bengaluru HQ', 'Bengaluru', 1)

    let form = await openEmploymentForm(user)
    await fillEmploymentBasics(user, form, {
      employeeName: 'Jane Doe',
      jobRoleTitle: 'Software Engineer',
      locationName: 'Bengaluru HQ',
    })
    fireEvent.change(within(form).getByLabelText('Joined on'), { target: { value: daysAgo(10) } })
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    form = await openEmploymentForm(user)
    await fillEmploymentBasics(user, form, {
      employeeName: 'Grace Hopper',
      jobRoleTitle: 'Software Engineer',
      locationName: 'Bengaluru HQ',
    })
    fireEvent.change(within(form).getByLabelText('Joined on'), { target: { value: daysAgo(10) } })
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Bengaluru HQ')
    expect(screen.queryByRole('row', { name: /Grace Hopper/ })).not.toBeInTheDocument()
  })

  it('only lists employees without an active employment in the Employee select', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await addEmployee(user, 'Jane', 'Doe', 'jane@example.com', 'Engineering')
    await addEmployee(user, 'Grace', 'Hopper', 'grace@example.com', 'Engineering')
    await addJobRole(user, 'Software Engineer')
    await addLocation(user, 'Bengaluru HQ', 'Bengaluru', 10)

    let form = await openEmploymentForm(user)
    await fillEmploymentBasics(user, form, {
      employeeName: 'Jane Doe',
      jobRoleTitle: 'Software Engineer',
      locationName: 'Bengaluru HQ',
    })
    fireEvent.change(within(form).getByLabelText('Joined on'), { target: { value: daysAgo(10) } })
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    form = await openEmploymentForm(user)
    const employeeSelect = within(form).getByLabelText('Employee') as HTMLSelectElement
    const optionLabels = Array.from(employeeSelect.options).map((option) => option.textContent)
    expect(optionLabels).not.toContain('Jane Doe')
    expect(optionLabels).toContain('Grace Hopper')
  })
})
