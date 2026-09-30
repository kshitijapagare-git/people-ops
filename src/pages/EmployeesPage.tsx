import { useState, type FormEvent } from 'react'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { EmployeeDraft } from '../types'

const blank: EmployeeDraft = { firstName: '', lastName: '', email: '', phone: '', departmentId: '' }

export function EmployeesPage() {
  const { employees, departments, getDepartment, createEmployee, updateEmployee, deleteEmployee } =
    usePeopleOps()
  const [draft, setDraft] = useState<EmployeeDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setDraft(blank)
    setEditingId(null)
    setError(null)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      if (editingId) updateEmployee(editingId, draft)
      else createEmployee(draft)
      reset()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  return (
    <section>
      <h2>Employees</h2>
      <form aria-label="Employee form" onSubmit={submit}>
        <label>
          First name
          <input value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
        </label>
        <label>
          Last name
          <input value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
        </label>
        <label>
          Email
          <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        </label>
        <label>
          Phone
          <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        </label>
        <label>
          Department
          <select value={draft.departmentId} onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}>
            <option value="">Select a department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">{editingId ? 'Save' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={reset}>
            Cancel
          </button>
        )}
      </form>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>First name</th>
            <th>Last name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.firstName}</td>
              <td>{employee.lastName}</td>
              <td>{employee.email}</td>
              <td>{employee.phone}</td>
              <td>{getDepartment(employee.departmentId)?.name ?? 'Unknown'}</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    const { id: _id, ...rest } = employee
                    setEditingId(employee.id)
                    setDraft(rest)
                    setError(null)
                  }}
                >
                  Edit
                </button>
                <button type="button" onClick={() => deleteEmployee(employee.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
