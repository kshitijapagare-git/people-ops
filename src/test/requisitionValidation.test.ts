import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'
import type { EmploymentDraft, JobRoleDraft, RequisitionDraft } from '../types'

const peopleManagerJobRole: JobRoleDraft = {
  title: 'Engineering Manager',
  level: 'LEAD',
  baseSalary: 900000,
  isPeopleManager: true,
}

const nonPeopleManagerJobRole: JobRoleDraft = {
  title: 'Software Engineer',
  level: 'MID',
  baseSalary: 500000,
  isPeopleManager: false,
}

/** Builds a state with: a Division -> Department -> Team org chain, and an employee whose
 * active employment carries an isPeopleManager job role, plus another employee who is not. */
function buildBaseState() {
  let state = store.emptyState()
  const division = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DIVISION')!
  state = store.createOrgUnit(state, { name: 'Engineering', kind: 'DEPARTMENT', parentId: division.id })
  const department = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'DEPARTMENT')!
  state = store.createOrgUnit(state, { name: 'Payments Team', kind: 'TEAM', parentId: department.id })
  const team = store.listOrgUnits(state).find((orgUnit) => orgUnit.kind === 'TEAM')!

  state = store.createDepartment(state, { name: 'Engineering Dept', code: 'ENG' })
  const dept = store.listDepartments(state)[0]

  state = store.createJobRole(state, peopleManagerJobRole)
  const managerRole = store.listJobRoles(state).find((jobRole) => jobRole.isPeopleManager)!
  state = store.createJobRole(state, nonPeopleManagerJobRole)
  const regularRole = store.listJobRoles(state).find((jobRole) => !jobRole.isPeopleManager)!

  state = store.createEmployee(state, {
    firstName: 'Mia',
    lastName: 'Manager',
    email: 'mia@example.com',
    phone: '555-0001',
    departmentId: dept.id,
  })
  const managerEmployee = store.listEmployees(state).find((employee) => employee.firstName === 'Mia')!

  state = store.createEmployee(state, {
    firstName: 'Ian',
    lastName: 'IC',
    email: 'ian@example.com',
    phone: '555-0002',
    departmentId: dept.id,
  })
  const nonManagerEmployee = store.listEmployees(state).find((employee) => employee.firstName === 'Ian')!

  const locations = store.listLocations(state)
  let location
  if (locations.length === 0) {
    state = store.createLocation(state, {
      name: 'HQ',
      city: 'Bengaluru',
      timezone: 'Asia/Kolkata',
      headcountCap: 50,
    })
    location = store.listLocations(state)[0]
  } else {
    location = locations[0]
  }

  const managerEmploymentDraft: EmploymentDraft = {
    employeeId: managerEmployee.id,
    jobRoleId: managerRole.id,
    locationId: location.id,
    employmentType: 'FULL_TIME',
    noticePeriodDays: 30,
    weeklyHours: 40,
    fteAllocation: 100,
    probationRating: null,
    joinedOn: '2020-01-01',
    endedOn: null,
  }
  state = store.createEmployment(state, managerEmploymentDraft)

  const nonManagerEmploymentDraft: EmploymentDraft = {
    employeeId: nonManagerEmployee.id,
    jobRoleId: regularRole.id,
    locationId: location.id,
    employmentType: 'FULL_TIME',
    noticePeriodDays: 30,
    weeklyHours: 40,
    fteAllocation: 100,
    probationRating: null,
    joinedOn: '2020-01-01',
    endedOn: null,
  }
  state = store.createEmployment(state, nonManagerEmploymentDraft)

  return { state, team, department, division, managerEmployee, nonManagerEmployee }
}

const baseRequisitionDraft = (teamId: string, managerId: string): RequisitionDraft => ({
  orgUnitId: teamId,
  hiringManagerId: managerId,
  positionTitle: 'Senior Engineer',
  jobDescription: '',
  requiredSkills: [],
  openFrom: '2024-01-01',
  openUntil: '2024-06-01',
  salaryOffered: 1000000,
  status: 'DRAFT',
})

describe('requisition validation', () => {
  it('rejects creating a requisition against a non-TEAM org unit', () => {
    const { state, department, managerEmployee } = buildBaseState()
    const draft = baseRequisitionDraft(department.id, managerEmployee.id)
    expect(() => store.createRequisition(state, draft)).toThrow(StoreError)
  })

  it('rejects creating a requisition whose hiring manager is not a people manager', () => {
    const { state, team, nonManagerEmployee } = buildBaseState()
    const draft = baseRequisitionDraft(team.id, nonManagerEmployee.id)
    expect(() => store.createRequisition(state, draft)).toThrow(StoreError)
  })

  it('rejects when openUntil is not after openFrom', () => {
    const { state, team, managerEmployee } = buildBaseState()
    const draft = { ...baseRequisitionDraft(team.id, managerEmployee.id), openFrom: '2024-06-01', openUntil: '2024-06-01' }
    expect(() => store.createRequisition(state, draft)).toThrow(StoreError)
  })

  it('rejects a non-positive salaryOffered', () => {
    const { state, team, managerEmployee } = buildBaseState()
    const draft = { ...baseRequisitionDraft(team.id, managerEmployee.id), salaryOffered: 0 }
    expect(() => store.createRequisition(state, draft)).toThrow(StoreError)
  })

  it('rejects duplicate requiredSkills', () => {
    const { state, team, managerEmployee } = buildBaseState()
    const draft: RequisitionDraft = {
      ...baseRequisitionDraft(team.id, managerEmployee.id),
      requiredSkills: ['REACT', 'REACT'],
    }
    expect(() => store.createRequisition(state, draft)).toThrow(StoreError)
  })

  it('rejects moving to OPEN with a short job description or no skills', () => {
    const { state, team, managerEmployee } = buildBaseState()
    const shortDescriptionDraft: RequisitionDraft = {
      ...baseRequisitionDraft(team.id, managerEmployee.id),
      status: 'OPEN',
      jobDescription: '<p>too short</p>',
      requiredSkills: ['REACT'],
    }
    expect(() => store.createRequisition(state, shortDescriptionDraft)).toThrow(StoreError)

    const noSkillsDraft: RequisitionDraft = {
      ...baseRequisitionDraft(team.id, managerEmployee.id),
      status: 'OPEN',
      jobDescription: '<p>' + 'x'.repeat(45) + '</p>',
      requiredSkills: [],
    }
    expect(() => store.createRequisition(state, noSkillsDraft)).toThrow(StoreError)
  })

  it('allows a DRAFT requisition to be saved with an empty job description and no skills', () => {
    const { state, team, managerEmployee } = buildBaseState()
    const draft = baseRequisitionDraft(team.id, managerEmployee.id)
    const next = store.createRequisition(state, draft)
    expect(store.listRequisitions(next)).toHaveLength(1)
    expect(store.listRequisitions(next)[0]).toMatchObject({ status: 'DRAFT' })
  })

  it('allows an already-OPEN requisition to be saved again after its description drops below 40 characters', () => {
    const { state, team, managerEmployee } = buildBaseState()
    const openDraft: RequisitionDraft = {
      ...baseRequisitionDraft(team.id, managerEmployee.id),
      status: 'OPEN',
      jobDescription: '<p>' + 'x'.repeat(45) + '</p>',
      requiredSkills: ['REACT'],
    }
    const created = store.createRequisition(state, openDraft)
    const requisition = store.listRequisitions(created)[0]
    const updated = store.updateRequisition(created, requisition.id, { jobDescription: '<p>short</p>' })
    expect(store.getRequisition(updated, requisition.id)).toMatchObject({
      status: 'OPEN',
      jobDescription: '<p>short</p>',
    })
  })
})
