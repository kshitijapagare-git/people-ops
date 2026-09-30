import { useState, type FormEvent } from 'react'
import { StoreError } from '../data/peopleOpsStore'
import { usePagination } from '../lib/usePagination'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { Employee, EmployeeDraft } from '../types'
import { Modal } from '../ui/Modal'
import { Pagination } from '../ui/Pagination'

const blank: EmployeeDraft = { firstName: '', lastName: '', email: '', phone: '', departmentId: '' }

const textFields = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
] as const

export function EmployeesPage() {
  const { employees, departments, getDepartment, createEmployee, updateEmployee, deleteEmployee } =
    usePeopleOps()
  const { page, totalPages, setPage, rows } = usePagination(employees)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<EmployeeDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setDraft(blank)
    setEditingId(null)
    setError(null)
    setOpen(true)
  }

  function openEdit(employee: Employee) {
    const { id, ...values } = employee
    setDraft(values)
    setEditingId(id)
    setError(null)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditingId(null)
    setDraft(blank)
    setError(null)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      if (editingId) updateEmployee(editingId, draft)
      else createEmployee(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Employees</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add employee
        </button>
      </div>
      <div className="card">
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  No employees yet.
                </td>
              </tr>
            ) : (
              rows.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.firstName}</td>
                  <td>{employee.lastName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td>{getDepartment(employee.departmentId)?.name ?? 'Unknown'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(employee)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => deleteEmployee(employee.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit employee' : 'New employee'}
          submitLabel={editingId ? 'Save employee' : 'Add employee'}
          onClose={close}
          onSubmit={submit}
        >
          {textFields.map(({ key, label }) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input id={key} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
            </div>
          ))}
          <div className="field">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              value={draft.departmentId}
              onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </Modal>
      )}
    </>
  )
}
