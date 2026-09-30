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
