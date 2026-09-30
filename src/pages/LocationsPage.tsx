import { useState, type FormEvent } from 'react'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { Select } from '../components/Select'
import { Stepper } from '../components/Stepper'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { Location, LocationDraft, Timezone } from '../types'

const timezoneOptions: { label: string; value: Timezone }[] = [
  { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'Asia/Singapore', value: 'Asia/Singapore' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
]

const blank: LocationDraft = { name: '', city: '', timezone: 'Asia/Kolkata', headcountCap: 50 }

export function LocationsPage() {
  const { locations, createLocation, updateLocation, deleteLocation } = usePeopleOps()
  const [draft, setDraft] = useState<LocationDraft>(blank)
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
      if (editingId) updateLocation(editingId, draft)
      else createLocation(draft)
      reset()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  const columns: DataTableColumn<Location>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (location) => location.name },
    { key: 'city', header: 'City', render: (location) => location.city },
    { key: 'timezone', header: 'Timezone', render: (location) => location.timezone },
    { key: 'headcountCap', header: 'Headcount cap', render: (location) => location.headcountCap },
    {
      key: 'actions',
      header: 'Actions',
      render: (location) => (
        <>
          <button
            type="button"
            onClick={() => {
              const { id: _id, ...rest } = location
              setEditingId(location.id)
              setDraft(rest)
              setError(null)
            }}
          >
            Edit
          </button>
          <button type="button" onClick={() => deleteLocation(location.id)}>
            Delete
          </button>
        </>
      ),
    },
  ]

  return (
    <section>
      <h2>Locations</h2>
      <form aria-label="Location form" onSubmit={submit}>
        <label>
          Name
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
        </label>
        <label>
          City
          <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} required />
        </label>
        <Select
          label="Timezone"
          value={draft.timezone}
          onChange={(timezone) => setDraft({ ...draft, timezone })}
          options={timezoneOptions}
        />
        <Stepper
          label="Headcount cap"
          value={draft.headcountCap}
          onChange={(headcountCap) => setDraft({ ...draft, headcountCap })}
          min={1}
          max={5000}
          step={5}
        />
        <button type="submit">{editingId ? 'Save' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={reset}>
            Cancel
          </button>
        )}
      </form>
      {error && <p role="alert">{error}</p>}
      <DataTable columns={columns} rows={locations} rowKey={(location) => location.id} defaultSortKey="name" />
    </section>
  )
}
