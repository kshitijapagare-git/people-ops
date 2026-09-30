import { useState, type FormEvent } from 'react'
import { DatePicker } from '../components/DatePicker'
import { Rating } from '../components/Rating'
import { Slider } from '../components/Slider'
import { Stepper } from '../components/Stepper'
import { ToggleGroup } from '../components/ToggleGroup'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { Employment, EmploymentDraft, EmploymentType } from '../types'

const employmentTypeOptions: { label: string; value: EmploymentType }[] = [
  { label: 'Full time', value: 'FULL_TIME' },
  { label: 'Part time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Intern', value: 'INTERN' },
]

const blank: EmploymentDraft = {
  employeeId: '',
  jobRoleId: '',
  locationId: '',
  employmentType: 'FULL_TIME',
  noticePeriodDays: 0,
  weeklyHours: 40,
  fteAllocation: 100,
  probationRating: null,
  joinedOn: '',
  endedOn: null,
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Whole days elapsed since joinedOn, computed at render — never persisted. */
function daysSinceJoined(joinedOn: string): number {
  if (!joinedOn) return 0
  const joined = new Date(joinedOn)
  if (Number.isNaN(joined.getTime())) return 0
  return Math.floor((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24))
}

export function EmploymentsPage() {
  const {
    employments,
    employees,
    jobRoles,
    locations,
    getEmployee,
    getJobRole,
    getLocation,
    createEmployment,
    updateEmployment,
    deleteEmployment,
  } = usePeopleOps()
  const [draft, setDraft] = useState<EmploymentDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const probationEligible = daysSinceJoined(draft.joinedOn) > 90
  const effectiveProbationRating = probationEligible ? draft.probationRating : null

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
    // Never save a probation rating for an employment that isn't past its 90-day probation window.
    const payload: EmploymentDraft = { ...draft, probationRating: effectiveProbationRating }
    try {
      if (editingId) updateEmployment(editingId, payload)
      else createEmployment(payload)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  function startEdit(employment: Employment) {
    const { id: _id, ...rest } = employment
    setEditingId(employment.id)
    setDraft(rest)
    setError(null)
    setFormOpen(true)
  }

  function handleJoinedOnChange(value: string) {
    const eligible = daysSinceJoined(value) > 90
    setDraft((prev) => ({ ...prev, joinedOn: value, probationRating: eligible ? prev.probationRating : null }))
  }

  function handleEmploymentTypeChange(employmentType: EmploymentType) {
    setDraft((prev) => ({
      ...prev,
      employmentType,
      fteAllocation: employmentType === 'FULL_TIME' ? 100 : prev.fteAllocation,
    }))
  }

  // "Has no active employment" is computed here at render, never stored.
  const employeeIdsWithActiveEmployment = new Set(
    employments
      .filter((employment) => employment.endedOn == null && employment.id !== editingId)
      .map((employment) => employment.employeeId),
  )
  const employeeOptions = employees.filter(
    (employee) => !employeeIdsWithActiveEmployment.has(employee.id) || employee.id === draft.employeeId,
  )

  return (
    <section>
      <div className="page-header">
        <h2>Employments</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add employment
        </button>
      </div>
      {formOpen && (
        <form aria-label="Employment form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Employee
              <select
                value={draft.employeeId}
                onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })}
                required
              >
                <option value="">Select an employee</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Job role
              <select
                value={draft.jobRoleId}
                onChange={(e) => setDraft({ ...draft, jobRoleId: e.target.value })}
                required
              >
                <option value="">Select a job role</option>
                {jobRoles.map((jobRole) => (
                  <option key={jobRole.id} value={jobRole.id}>
                    {jobRole.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <select
                value={draft.locationId}
                onChange={(e) => setDraft({ ...draft, locationId: e.target.value })}
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ToggleGroup
            label="Employment type"
            value={draft.employmentType}
            onChange={handleEmploymentTypeChange}
            options={employmentTypeOptions}
          />
          <Stepper
            label="Notice period (days)"
            value={draft.noticePeriodDays}
            onChange={(noticePeriodDays) => setDraft({ ...draft, noticePeriodDays })}
            min={0}
            max={180}
            step={15}
          />
          <Stepper
            label="Weekly hours"
            value={draft.weeklyHours}
            onChange={(weeklyHours) => setDraft({ ...draft, weeklyHours })}
            min={1}
            max={60}
            step={1}
          />
          <Slider
            label="FTE allocation"
            value={draft.fteAllocation}
            onChange={(fteAllocation) => setDraft({ ...draft, fteAllocation })}
            min={10}
            max={100}
            step={5}
            suffix="%"
            disabled={draft.employmentType === 'FULL_TIME'}
          />
          <DatePicker label="Joined on" value={draft.joinedOn} onChange={handleJoinedOnChange} max={todayIso()} required />
          <Rating
            label="Probation rating"
            value={effectiveProbationRating}
            onChange={(probationRating) => setDraft({ ...draft, probationRating })}
            disabled={!probationEligible}
          />
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
              <th>Employee</th>
              <th>Job role</th>
              <th>Location</th>
              <th>Employment type</th>
              <th>FTE</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employments.length === 0 && (
              <tr>
                <td className="empty" colSpan={6}>
                  No employments yet.
                </td>
              </tr>
            )}
            {employments.map((employment) => {
              const employee = getEmployee(employment.employeeId)
              const jobRole = getJobRole(employment.jobRoleId)
              const location = getLocation(employment.locationId)
              return (
                <tr key={employment.id}>
                  <td>{employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}</td>
                  <td>{jobRole?.title ?? 'Unknown'}</td>
                  <td>{location?.name ?? 'Unknown'}</td>
                  <td>{employment.employmentType}</td>
                  <td>{employment.fteAllocation}%</td>
                  <td>
                    <button type="button" className="btn-link" onClick={() => startEdit(employment)}>
                      Edit
                    </button>
                    <button type="button" className="btn-link danger" onClick={() => deleteEmployment(employment.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
