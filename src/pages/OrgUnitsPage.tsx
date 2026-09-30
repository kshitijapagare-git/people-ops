import { useState, type FormEvent } from 'react'
import { Select } from '../components/Select'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { OrgUnitDraft, OrgUnitKind } from '../types'

const kindOptions: { label: string; value: OrgUnitKind }[] = [
  { label: 'Division', value: 'DIVISION' },
  { label: 'Department', value: 'DEPARTMENT' },
  { label: 'Team', value: 'TEAM' },
]

const blank: OrgUnitDraft = { name: '', kind: 'DIVISION', parentId: null }

export function OrgUnitsPage() {
  const { orgUnits, getOrgUnit, createOrgUnit, updateOrgUnit, deleteOrgUnit } = usePeopleOps()
  const [draft, setDraft] = useState<OrgUnitDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  function reset() {
    setDraft(blank)
    setEditingId(null)
    setError(null)
  }

  function close() {
    reset()
    setFormOpen(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      if (editingId) updateOrgUnit(editingId, draft)
      else createOrgUnit(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  function handleKindChange(kind: OrgUnitKind) {
    // A division has no parent; switching kinds clears a parent that may no longer be valid.
    setDraft((prev) => ({ ...prev, kind, parentId: kind === 'DIVISION' ? null : prev.parentId }))
  }

  // Valid parent candidates for the currently-selected kind: DIVISION for DEPARTMENT, DEPARTMENT for TEAM.
  const parentOptions = orgUnits.filter((orgUnit) =>
    draft.kind === 'DEPARTMENT' ? orgUnit.kind === 'DIVISION' : draft.kind === 'TEAM' ? orgUnit.kind === 'DEPARTMENT' : false,
  )

  function startEdit(id: string) {
    const orgUnit = getOrgUnit(id)
    if (!orgUnit) return
    setEditingId(orgUnit.id)
    setDraft({ name: orgUnit.name, kind: orgUnit.kind, parentId: orgUnit.parentId })
    setError(null)
    setFormOpen(true)
  }

  function handleDelete(id: string) {
    try {
      deleteOrgUnit(id)
      setError(null)
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  return (
    <section>
      <div className="page-header">
        <h2>Org Units</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add org unit
        </button>
      </div>
      {formOpen && (
        <form aria-label="Org unit form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Name
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
            </label>
            <Select label="Kind" value={draft.kind} onChange={handleKindChange} options={kindOptions} />
            {draft.kind !== 'DIVISION' && (
              <label>
                Parent
                <select
                  value={draft.parentId ?? ''}
                  onChange={(e) => setDraft({ ...draft, parentId: e.target.value || null })}
                  required
                >
                  <option value="">Select a parent</option>
                  {parentOptions.map((orgUnit) => (
                    <option key={orgUnit.id} value={orgUnit.id}>
                      {orgUnit.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save' : 'Add'}
            </button>
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      )}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Parent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgUnits.length === 0 && (
              <tr>
                <td className="empty" colSpan={4}>
                  No org units yet.
                </td>
              </tr>
            )}
            {orgUnits.map((orgUnit) => (
              <tr key={orgUnit.id}>
                <td>{orgUnit.name}</td>
                <td>{orgUnit.kind}</td>
                <td>{orgUnit.parentId ? getOrgUnit(orgUnit.parentId)?.name ?? 'Unknown' : '—'}</td>
                <td>
                  <button type="button" className="btn-link" onClick={() => startEdit(orgUnit.id)}>
                    Edit
                  </button>
                  <button type="button" className="btn-link danger" onClick={() => handleDelete(orgUnit.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!formOpen && error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  )
}
