import { useState, type FormEvent } from 'react'
import { usePagination } from '../lib/usePagination'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { Department, DepartmentDraft } from '../types'
import { Modal } from '../ui/Modal'
import { Pagination } from '../ui/Pagination'

const blank: DepartmentDraft = { name: '', code: '' }

export function DepartmentsPage() {
  const { departments, createDepartment, updateDepartment, deleteDepartment } = usePeopleOps()
  const { page, totalPages, setPage, rows } = usePagination(departments)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DepartmentDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)

  function openCreate() {
    setDraft(blank)
    setEditingId(null)
    setOpen(true)
  }

  function openEdit(department: Department) {
    const { id, ...values } = department
    setDraft(values)
    setEditingId(id)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditingId(null)
    setDraft(blank)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (editingId) updateDepartment(editingId, draft)
    else createDepartment(draft)
    close()
  }

  return (
    <>
      <div className="page-header">
        <h1>Departments</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add department
        </button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">
                  No departments yet.
                </td>
              </tr>
            ) : (
              rows.map((department) => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.code}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(department)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => deleteDepartment(department.id)}>
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
          title={editingId ? 'Edit department' : 'New department'}
          submitLabel={editingId ? 'Save department' : 'Add department'}
          onClose={close}
          onSubmit={submit}
        >
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="code">Code</label>
            <input id="code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </div>
        </Modal>
      )}
    </>
  )
}
