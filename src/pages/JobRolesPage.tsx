import { useState, type FormEvent } from 'react'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { CurrencyInput } from '../components/CurrencyInput'
import { Select } from '../components/Select'
import { Switch } from '../components/Switch'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { JobRole, JobRoleDraft, JobRoleLevel } from '../types'

const levelOptions: { label: string; value: JobRoleLevel }[] = [
  { label: 'Intern', value: 'INTERN' },
  { label: 'Junior', value: 'JUNIOR' },
  { label: 'Mid', value: 'MID' },
  { label: 'Senior', value: 'SENIOR' },
  { label: 'Lead', value: 'LEAD' },
  { label: 'Principal', value: 'PRINCIPAL' },
]

const blank: JobRoleDraft = { title: '', level: 'MID', baseSalary: 0, isPeopleManager: false }

export function JobRolesPage() {
  const { jobRoles, createJobRole, updateJobRole, deleteJobRole } = usePeopleOps()
  const [draft, setDraft] = useState<JobRoleDraft>(blank)
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
      if (editingId) updateJobRole(editingId, draft)
      else createJobRole(draft)
      reset()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  const columns: DataTableColumn<JobRole>[] = [
    { key: 'title', header: 'Title', sortable: true, render: (jobRole) => jobRole.title },
    { key: 'level', header: 'Level', render: (jobRole) => jobRole.level },
    {
      key: 'baseSalary',
      header: 'Base salary',
      render: (jobRole) => (jobRole.baseSalary / 100).toFixed(2),
    },
    {
      key: 'isPeopleManager',
      header: 'People manager',
      render: (jobRole) => (jobRole.isPeopleManager ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (jobRole) => (
        <>
          <button
            type="button"
            onClick={() => {
              const { id: _id, ...rest } = jobRole
              setEditingId(jobRole.id)
              setDraft(rest)
              setError(null)
            }}
          >
            Edit
          </button>
          <button type="button" onClick={() => deleteJobRole(jobRole.id)}>
            Delete
          </button>
        </>
      ),
    },
  ]

  return (
    <section>
      <h2>Job Roles</h2>
      <form aria-label="Job role form" onSubmit={submit}>
        <label>
          Title
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
        </label>
        <Select
          label="Level"
          value={draft.level}
          onChange={(level) => setDraft({ ...draft, level })}
          options={levelOptions}
        />
        <CurrencyInput
          label="Base salary"
          minorUnits={draft.baseSalary}
          onChange={(baseSalary) => setDraft({ ...draft, baseSalary })}
          required
        />
        <Switch
          label="People manager"
          checked={draft.isPeopleManager}
          onChange={(isPeopleManager) => setDraft({ ...draft, isPeopleManager })}
        />
        <button type="submit">{editingId ? 'Save' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={reset}>
            Cancel
          </button>
        )}
      </form>
      {error && <p role="alert">{error}</p>}
      <DataTable columns={columns} rows={jobRoles} rowKey={(jobRole) => jobRole.id} defaultSortKey="title" />
    </section>
  )
}
