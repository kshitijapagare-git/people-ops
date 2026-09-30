import { nextId } from '../lib/id'
import type { Department, DepartmentDraft, Employee, EmployeeDraft } from '../types'
import * as repo from './repository'

export interface PeopleOpsState {
  departments: repo.Table<Department>
  employees: repo.Table<Employee>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): PeopleOpsState {
  return { departments: [], employees: [] }
}

/* ---------- Departments ---------- */

export function listDepartments(state: PeopleOpsState): Department[] {
  return repo.list(state.departments)
}

export function getDepartment(state: PeopleOpsState, id: string): Department | undefined {
  return repo.get(state.departments, id)
}

export function createDepartment(state: PeopleOpsState, draft: DepartmentDraft): PeopleOpsState {
  const department: Department = { id: nextId('dep'), ...draft }
  return { ...state, departments: repo.insert(state.departments, department) }
}

export function updateDepartment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<DepartmentDraft>,
): PeopleOpsState {
  requireDepartment(state, id)
  return { ...state, departments: repo.replace(state.departments, id, patch) }
}

export function deleteDepartment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireDepartment(state, id)
  return { ...state, departments: repo.remove(state.departments, id) }
}

/* ---------- Employees ---------- */

export function listEmployees(state: PeopleOpsState): Employee[] {
  return repo.list(state.employees)
}

export function getEmployee(state: PeopleOpsState, id: string): Employee | undefined {
  return repo.get(state.employees, id)
}

export function createEmployee(state: PeopleOpsState, draft: EmployeeDraft): PeopleOpsState {
  requireDepartment(state, draft.departmentId)
  const employee: Employee = { id: nextId('emp'), ...draft }
  return { ...state, employees: repo.insert(state.employees, employee) }
}

export function updateEmployee(
  state: PeopleOpsState,
  id: string,
  patch: Partial<EmployeeDraft>,
): PeopleOpsState {
  requireEmployee(state, id)
  if (patch.departmentId !== undefined) requireDepartment(state, patch.departmentId)
  return { ...state, employees: repo.replace(state.employees, id, patch) }
}

export function deleteEmployee(state: PeopleOpsState, id: string): PeopleOpsState {
  requireEmployee(state, id)
  return { ...state, employees: repo.remove(state.employees, id) }
}

/* ---------- FK guards ---------- */

function requireDepartment(state: PeopleOpsState, id: string): Department {
  const department = repo.get(state.departments, id)
  if (!department) throw new StoreError(`No department with id ${id}`)
  return department
}

function requireEmployee(state: PeopleOpsState, id: string): Employee {
  const employee = repo.get(state.employees, id)
  if (!employee) throw new StoreError(`No employee with id ${id}`)
  return employee
}
