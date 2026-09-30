import { useState, type FormEvent } from 'react'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { DepartmentDraft } from '../types'

const blank: DepartmentDraft = { name: '', code: '' }

export function DepartmentsPage() {
  const { departments, createDepartment, updateDepartment, deleteDepartment } = usePeopleOps()
  const [draft, setDraft] = useState<DepartmentDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (editingId) updateDepartment(editingId, draft)
    else createDepartment(draft)
    setDraft(blank)
    setEditingId(null)
  }

  return (
    <section>
      <h2>Departments</h2>
      <form aria-label="Department form" onSubmit={submit}>
        <label>
          Name
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label>
          Code
          <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
        </label>
        <button type="submit">{editingId ? 'Save' : 'Add'}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setDraft(blank)
              setEditingId(null)
            }}
          >
            Cancel
          </button>
        )}
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id}>
              <td>{department.name}</td>
              <td>{department.code}</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(department.id)
                    setDraft({ name: department.name, code: department.code })
                  }}
                >
                  Edit
                </button>
                <button type="button" onClick={() => deleteDepartment(department.id)}>
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
