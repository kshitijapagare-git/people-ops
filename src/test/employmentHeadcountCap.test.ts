import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'
import type { EmployeeDraft, EmploymentDraft, LocationDraft } from '../types'

const baseLocation: LocationDraft = {
  name: 'Bengaluru HQ',
  city: 'Bengaluru',
  timezone: 'Asia/Kolkata',
  headcountCap: 1,
}

const baseEmployee: EmployeeDraft = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '1234567890',
  departmentId: '',
}

function seedState() {
  let state = store.emptyState()
  state = store.createDepartment(state, { name: 'Engineering', code: 'ENG' })
  const department = store.listDepartments(state)[0]
  state = store.createEmployee(state, { ...baseEmployee, departmentId: department.id })
  state = store.createEmployee(state, { ...baseEmployee, email: 'grace@example.com', departmentId: department.id })
  state = store.createJobRole(state, {
    title: 'Software Engineer',
    level: 'MID',
    baseSalary: 500000,
    isPeopleManager: false,
  })
  state = store.createLocation(state, baseLocation)
  return state
}

function baseEmploymentDraft(state: store.PeopleOpsState, employeeId: string): EmploymentDraft {
  const jobRole = store.listJobRoles(state)[0]
  const location = store.listLocations(state)[0]
  return {
    employeeId,
    jobRoleId: jobRole.id,
    locationId: location.id,
    employmentType: 'FULL_TIME',
    noticePeriodDays: 30,
    weeklyHours: 40,
    fteAllocation: 100,
    probationRating: null,
    joinedOn: '2024-01-01',
    endedOn: null,
  }
}

describe('employment headcount cap', () => {
  it('rejects creating an active employment that would push a location past its headcount cap', () => {
    let state = seedState()
    const [employeeA, employeeB] = store.listEmployees(state)
    state = store.createEmployment(state, baseEmploymentDraft(state, employeeA.id))
    expect(() => store.createEmployment(state, baseEmploymentDraft(state, employeeB.id))).toThrow(StoreError)
  })

  it('excludes the employment being updated from the count', () => {
    let state = seedState()
    const [employeeA] = store.listEmployees(state)
    state = store.createEmployment(state, baseEmploymentDraft(state, employeeA.id))
    const employment = store.listEmployments(state)[0]
    expect(() =>
      store.updateEmployment(state, employment.id, { noticePeriodDays: 45 }),
    ).not.toThrow()
  })

  it('allows a new active employment once the existing one has ended', () => {
    let state = seedState()
    const [employeeA, employeeB] = store.listEmployees(state)
    state = store.createEmployment(state, baseEmploymentDraft(state, employeeA.id))
    const employment = store.listEmployments(state)[0]
    state = store.updateEmployment(state, employment.id, { endedOn: '2024-06-01' })
    expect(() => store.createEmployment(state, baseEmploymentDraft(state, employeeB.id))).not.toThrow()
  })

  it('names the location in the error message', () => {
    let state = seedState()
    const [employeeA, employeeB] = store.listEmployees(state)
    state = store.createEmployment(state, baseEmploymentDraft(state, employeeA.id))
    try {
      store.createEmployment(state, baseEmploymentDraft(state, employeeB.id))
      throw new Error('expected createEmployment to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(StoreError)
      expect((err as StoreError).message).toContain('Bengaluru HQ')
    }
  })
})
