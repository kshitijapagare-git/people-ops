import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'

const engineering = { name: 'Engineering', code: 'ENG' }
const jane = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '555-0100' }

function withDepartment() {
  return store.createDepartment(store.emptyState(), engineering)
}

describe('departments', () => {
  it('creates, gets and lists', () => {
    const state = withDepartment()
    expect(store.listDepartments(state)).toEqual([{ id: 'dep_1', ...engineering }])
    expect(store.getDepartment(state, 'dep_1')).toEqual({ id: 'dep_1', ...engineering })
  })

  it('updates', () => {
    const state = store.updateDepartment(withDepartment(), 'dep_1', { name: 'Platform' })
    expect(store.getDepartment(state, 'dep_1')).toEqual({ id: 'dep_1', name: 'Platform', code: 'ENG' })
  })

  it('deletes', () => {
    const state = store.deleteDepartment(withDepartment(), 'dep_1')
    expect(store.listDepartments(state)).toEqual([])
  })

  it('rejects update and delete of a missing department', () => {
    const state = store.emptyState()
    expect(() => store.updateDepartment(state, 'dep_9', { name: 'X' })).toThrow(StoreError)
    expect(() => store.deleteDepartment(state, 'dep_9')).toThrow(StoreError)
  })
})

describe('employees', () => {
  it('creates with a valid departmentId', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'dep_1' })
    expect(store.listEmployees(state)).toEqual([{ id: 'emp_1', ...jane, departmentId: 'dep_1' }])
  })

  it('rejects create when the department does not exist', () => {
    expect(() => store.createEmployee(store.emptyState(), { ...jane, departmentId: 'dep_9' })).toThrow(
      'No department with id dep_9',
    )
  })

  it('updates fields and reassigns department', () => {
    let state = store.createDepartment(withDepartment(), { name: 'Sales', code: 'SAL' })
    state = store.createEmployee(state, { ...jane, departmentId: 'dep_1' })
    state = store.updateEmployee(state, 'emp_1', { phone: '555-0199', departmentId: 'dep_2' })
    expect(store.getEmployee(state, 'emp_1')).toMatchObject({ phone: '555-0199', departmentId: 'dep_2' })
  })

  it('rejects reassignment to a missing department', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'dep_1' })
    expect(() => store.updateEmployee(state, 'emp_1', { departmentId: 'dep_9' })).toThrow(StoreError)
  })

  it('deletes', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'dep_1' })
    expect(store.listEmployees(store.deleteEmployee(state, 'emp_1'))).toEqual([])
  })

  it('rejects update and delete of a missing employee', () => {
    const state = withDepartment()
    expect(() => store.updateEmployee(state, 'emp_9', { firstName: 'X' })).toThrow(StoreError)
    expect(() => store.deleteEmployee(state, 'emp_9')).toThrow(StoreError)
  })
})

const engineeringOrgUnit = { name: 'Engineering Org', parentId: null }

function withOrgUnit() {
  return store.createOrgUnit(store.emptyState(), engineeringOrgUnit)
}

describe('orgUnits', () => {
  it('creates, gets and lists', () => {
    const state = withOrgUnit()
    expect(store.listOrgUnits(state)).toEqual([{ id: 'orgUnit_1', ...engineeringOrgUnit }])
    expect(store.getOrgUnit(state, 'orgUnit_1')).toEqual({ id: 'orgUnit_1', ...engineeringOrgUnit })
  })

  it('updates', () => {
    const state = store.updateOrgUnit(withOrgUnit(), 'orgUnit_1', { name: 'Platform Org' })
    expect(store.getOrgUnit(state, 'orgUnit_1')).toMatchObject({ name: 'Platform Org' })
  })

  it('deletes', () => {
    const state = store.deleteOrgUnit(withOrgUnit(), 'orgUnit_1')
    expect(store.listOrgUnits(state)).toEqual([])
  })

  it('rejects update and delete of a missing org unit', () => {
    const state = store.emptyState()
    expect(() => store.updateOrgUnit(state, 'orgUnit_9', { name: 'X' })).toThrow(StoreError)
    expect(() => store.deleteOrgUnit(state, 'orgUnit_9')).toThrow(StoreError)
  })
})

function withEmployee() {
  let state = withDepartment()
  state = store.createEmployee(state, { ...jane, departmentId: 'dep_1' })
  return state
}

describe('employments', () => {
  it('creates with a valid employeeId', () => {
    const state = store.createEmployment(withEmployee(), { employeeId: 'emp_1', status: 'ACTIVE' })
    expect(store.listEmployments(state)).toEqual([{ id: 'employment_1', employeeId: 'emp_1', status: 'ACTIVE' }])
  })

  it('rejects create when the employee does not exist', () => {
    expect(() => store.createEmployment(store.emptyState(), { employeeId: 'emp_9', status: 'ACTIVE' })).toThrow(
      StoreError,
    )
  })

  it('updates', () => {
    let state = store.createEmployment(withEmployee(), { employeeId: 'emp_1', status: 'ACTIVE' })
    state = store.updateEmployment(state, 'employment_1', { status: 'INACTIVE' })
    expect(store.getEmployment(state, 'employment_1')).toMatchObject({ status: 'INACTIVE' })
  })

  it('deletes', () => {
    let state = store.createEmployment(withEmployee(), { employeeId: 'emp_1', status: 'ACTIVE' })
    state = store.deleteEmployment(state, 'employment_1')
    expect(store.listEmployments(state)).toEqual([])
  })

  it('rejects update and delete of a missing employment', () => {
    const state = withEmployee()
    expect(() => store.updateEmployment(state, 'employment_9', { status: 'INACTIVE' })).toThrow(StoreError)
    expect(() => store.deleteEmployment(state, 'employment_9')).toThrow(StoreError)
  })
})

const baseRequisition = {
  positionTitle: 'Software Engineer',
  jobDescription: 'Build things.',
  salaryOffered: 500000,
  openFrom: '2024-01-01',
  openTo: '2024-02-01',
  status: 'OPEN' as const,
  orgUnitId: 'orgUnit_1',
}

describe('requisitions', () => {
  it('creates with a valid orgUnitId', () => {
    const state = store.createRequisition(withOrgUnit(), baseRequisition)
    expect(store.listRequisitions(state)).toEqual([{ id: 'requisition_1', ...baseRequisition }])
  })

  it('rejects create when the org unit does not exist', () => {
    expect(() => store.createRequisition(store.emptyState(), baseRequisition)).toThrow(
      'No org unit with id orgUnit_1',
    )
  })

  it('updates fields and reassigns org unit', () => {
    let state = store.createOrgUnit(withOrgUnit(), { name: 'Sales Org', parentId: null })
    state = store.createRequisition(state, baseRequisition)
    state = store.updateRequisition(state, 'requisition_1', { orgUnitId: 'orgUnit_2', positionTitle: 'Staff Engineer' })
    expect(store.getRequisition(state, 'requisition_1')).toMatchObject({
      orgUnitId: 'orgUnit_2',
      positionTitle: 'Staff Engineer',
    })
  })

  it('rejects reassignment to a missing org unit', () => {
    const state = store.createRequisition(withOrgUnit(), baseRequisition)
    expect(() => store.updateRequisition(state, 'requisition_1', { orgUnitId: 'orgUnit_9' })).toThrow(StoreError)
  })

  it('deletes', () => {
    const state = store.createRequisition(withOrgUnit(), baseRequisition)
    expect(store.listRequisitions(store.deleteRequisition(state, 'requisition_1'))).toEqual([])
  })

  it('rejects update and delete of a missing requisition', () => {
    const state = withOrgUnit()
    expect(() => store.updateRequisition(state, 'requisition_9', { positionTitle: 'X' })).toThrow(StoreError)
    expect(() => store.deleteRequisition(state, 'requisition_9')).toThrow(StoreError)
  })
})
