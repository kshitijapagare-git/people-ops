import { nextId } from '../lib/id'
import type {
  Department,
  DepartmentDraft,
  Employee,
  EmployeeDraft,
  Employment,
  EmploymentDraft,
  JobRole,
  JobRoleDraft,
  Location,
  LocationDraft,
  OrgUnit,
  OrgUnitDraft,
  OrgUnitKind,
  Requisition,
  RequisitionDraft,
} from '../types'
import * as repo from './repository'

export interface PeopleOpsState {
  departments: repo.Table<Department>
  employees: repo.Table<Employee>
  jobRoles: repo.Table<JobRole>
  locations: repo.Table<Location>
  employments: repo.Table<Employment>
  orgUnits: repo.Table<OrgUnit>
  requisitions: repo.Table<Requisition>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): PeopleOpsState {
  const rootDivision: OrgUnit = { id: nextId('orgUnit'), name: 'Head Office', kind: 'DIVISION', parentId: null }
  return {
    departments: [],
    employees: [],
    jobRoles: [],
    locations: [],
    employments: [],
    orgUnits: [rootDivision],
    requisitions: [],
  }
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
  const mirroredOrgUnit: OrgUnit = {
    id: mirroredDepartmentOrgUnitId(department.id),
    name: department.name,
    kind: 'DEPARTMENT',
    parentId: seededDivisionId(state),
  }
  return {
    ...state,
    departments: repo.insert(state.departments, department),
    orgUnits: repo.insert(state.orgUnits, mirroredOrgUnit),
  }
}

export function updateDepartment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<DepartmentDraft>,
): PeopleOpsState {
  requireDepartment(state, id)
  const orgUnits =
    patch.name !== undefined
      ? repo.replace(state.orgUnits, mirroredDepartmentOrgUnitId(id), { name: patch.name })
      : state.orgUnits
  return { ...state, departments: repo.replace(state.departments, id, patch), orgUnits }
}

export function deleteDepartment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireDepartment(state, id)
  const mirroredOrgUnitId = mirroredDepartmentOrgUnitId(id)
  const hasChildren = state.orgUnits.some((orgUnit) => orgUnit.parentId === mirroredOrgUnitId)
  if (hasChildren) {
    throw new StoreError('Cannot delete a department that still has org units under it')
  }
  return {
    ...state,
    departments: repo.remove(state.departments, id),
    orgUnits: repo.remove(state.orgUnits, mirroredOrgUnitId),
  }
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

/* ---------- JobRoles ---------- */

export function listJobRoles(state: PeopleOpsState): JobRole[] {
  return repo.list(state.jobRoles)
}

export function getJobRole(state: PeopleOpsState, id: string): JobRole | undefined {
  return repo.get(state.jobRoles, id)
}

export function createJobRole(state: PeopleOpsState, draft: JobRoleDraft): PeopleOpsState {
  requireBaseSalary(draft.baseSalary)
  requireUniqueJobRoleTitle(state, draft.title, draft.level)
  const jobRole: JobRole = { id: nextId('jobRole'), ...draft }
  return { ...state, jobRoles: repo.insert(state.jobRoles, jobRole) }
}

export function updateJobRole(
  state: PeopleOpsState,
  id: string,
  patch: Partial<JobRoleDraft>,
): PeopleOpsState {
  const existing = requireJobRole(state, id)
  if (patch.baseSalary !== undefined) requireBaseSalary(patch.baseSalary)
  const title = patch.title ?? existing.title
  const level = patch.level ?? existing.level
  requireUniqueJobRoleTitle(state, title, level, id)
  return { ...state, jobRoles: repo.replace(state.jobRoles, id, patch) }
}

export function deleteJobRole(state: PeopleOpsState, id: string): PeopleOpsState {
  requireJobRole(state, id)
  return { ...state, jobRoles: repo.remove(state.jobRoles, id) }
}

/* ---------- Locations ---------- */

export function listLocations(state: PeopleOpsState): Location[] {
  return repo.list(state.locations)
}

export function getLocation(state: PeopleOpsState, id: string): Location | undefined {
  return repo.get(state.locations, id)
}

export function createLocation(state: PeopleOpsState, draft: LocationDraft): PeopleOpsState {
  const location: Location = { id: nextId('loc'), ...draft }
  return { ...state, locations: repo.insert(state.locations, location) }
}

export function updateLocation(
  state: PeopleOpsState,
  id: string,
  patch: Partial<LocationDraft>,
): PeopleOpsState {
  requireLocation(state, id)
  return { ...state, locations: repo.replace(state.locations, id, patch) }
}

export function deleteLocation(state: PeopleOpsState, id: string): PeopleOpsState {
  requireLocation(state, id)
  return { ...state, locations: repo.remove(state.locations, id) }
}

/* ---------- Employments ---------- */

export function listEmployments(state: PeopleOpsState): Employment[] {
  return repo.list(state.employments)
}

export function getEmployment(state: PeopleOpsState, id: string): Employment | undefined {
  return repo.get(state.employments, id)
}

export function createEmployment(state: PeopleOpsState, draft: EmploymentDraft): PeopleOpsState {
  requireEmployee(state, draft.employeeId)
  requireJobRole(state, draft.jobRoleId)
  requireLocation(state, draft.locationId)
  if (draft.endedOn == null) requireHeadcountCap(state, draft.locationId)
  const employment: Employment = { id: nextId('employment'), ...draft }
  return { ...state, employments: repo.insert(state.employments, employment) }
}

export function updateEmployment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<EmploymentDraft>,
): PeopleOpsState {
  const existing = requireEmployment(state, id)
  if (patch.employeeId !== undefined) requireEmployee(state, patch.employeeId)
  if (patch.jobRoleId !== undefined) requireJobRole(state, patch.jobRoleId)
  if (patch.locationId !== undefined) requireLocation(state, patch.locationId)
  const locationId = patch.locationId ?? existing.locationId
  const endedOn = patch.endedOn !== undefined ? patch.endedOn : existing.endedOn
  if (endedOn == null) requireHeadcountCap(state, locationId, id)
  return { ...state, employments: repo.replace(state.employments, id, patch) }
}

export function deleteEmployment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireEmployment(state, id)
  return { ...state, employments: repo.remove(state.employments, id) }
}

/* ---------- OrgUnits ---------- */

export function listOrgUnits(state: PeopleOpsState): OrgUnit[] {
  return repo.list(state.orgUnits)
}

export function getOrgUnit(state: PeopleOpsState, id: string): OrgUnit | undefined {
  return repo.get(state.orgUnits, id)
}

export function createOrgUnit(state: PeopleOpsState, draft: OrgUnitDraft): PeopleOpsState {
  requireValidOrgUnitParent(state, draft.kind, draft.parentId)
  const orgUnit: OrgUnit = { id: nextId('orgUnit'), ...draft }
  return { ...state, orgUnits: repo.insert(state.orgUnits, orgUnit) }
}

export function updateOrgUnit(
  state: PeopleOpsState,
  id: string,
  patch: Partial<OrgUnitDraft>,
): PeopleOpsState {
  const existing = requireOrgUnit(state, id)
  const kind = patch.kind ?? existing.kind
  const parentId = patch.parentId !== undefined ? patch.parentId : existing.parentId
  if (patch.kind !== undefined || patch.parentId !== undefined) {
    requireValidOrgUnitParent(state, kind, parentId)
  }
  return { ...state, orgUnits: repo.replace(state.orgUnits, id, patch) }
}

export function deleteOrgUnit(state: PeopleOpsState, id: string): PeopleOpsState {
  requireOrgUnit(state, id)
  const hasChildren = state.orgUnits.some((orgUnit) => orgUnit.parentId === id)
  if (hasChildren) {
    throw new StoreError('Cannot delete an org unit that still has child org units')
  }
  const hasRequisitions = state.requisitions.some((requisition) => requisition.orgUnitId === id)
  if (hasRequisitions) {
    throw new StoreError('Cannot delete an org unit that still has requisitions against it')
  }
  return { ...state, orgUnits: repo.remove(state.orgUnits, id) }
}

/* ---------- Requisitions ---------- */

export function listRequisitions(state: PeopleOpsState): Requisition[] {
  return repo.list(state.requisitions)
}

export function getRequisition(state: PeopleOpsState, id: string): Requisition | undefined {
  return repo.get(state.requisitions, id)
}

export function createRequisition(state: PeopleOpsState, draft: RequisitionDraft): PeopleOpsState {
  requireValidRequisitionFields(state, draft)
  if (draft.status === 'OPEN') requireOpenReadiness(draft)
  const requisition: Requisition = { id: nextId('requisition'), ...draft }
  return { ...state, requisitions: repo.insert(state.requisitions, requisition) }
}

export function updateRequisition(
  state: PeopleOpsState,
  id: string,
  patch: Partial<RequisitionDraft>,
): PeopleOpsState {
  const existing = requireRequisition(state, id)
  const merged: RequisitionDraft = { ...existing, ...patch }
  requireValidRequisitionFields(state, merged)
  if (merged.status === 'OPEN' && existing.status !== 'OPEN') requireOpenReadiness(merged)
  return { ...state, requisitions: repo.replace(state.requisitions, id, patch) }
}

export function deleteRequisition(state: PeopleOpsState, id: string): PeopleOpsState {
  requireRequisition(state, id)
  return { ...state, requisitions: repo.remove(state.requisitions, id) }
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

function requireJobRole(state: PeopleOpsState, id: string): JobRole {
  const jobRole = repo.get(state.jobRoles, id)
  if (!jobRole) throw new StoreError(`No job role with id ${id}`)
  return jobRole
}

function requireLocation(state: PeopleOpsState, id: string): Location {
  const location = repo.get(state.locations, id)
  if (!location) throw new StoreError(`No location with id ${id}`)
  return location
}

function requireEmployment(state: PeopleOpsState, id: string): Employment {
  const employment = repo.get(state.employments, id)
  if (!employment) throw new StoreError(`No employment with id ${id}`)
  return employment
}

function requireOrgUnit(state: PeopleOpsState, id: string): OrgUnit {
  const orgUnit = repo.get(state.orgUnits, id)
  if (!orgUnit) throw new StoreError(`No org unit with id ${id}`)
  return orgUnit
}

function requireRequisition(state: PeopleOpsState, id: string): Requisition {
  const requisition = repo.get(state.requisitions, id)
  if (!requisition) throw new StoreError(`No requisition with id ${id}`)
  return requisition
}

/** Strips HTML tags down to plain text, mirroring RichTextEditor's own stripHtml helper. */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

function requireValidRequisitionFields(state: PeopleOpsState, draft: RequisitionDraft): void {
  const orgUnit = repo.get(state.orgUnits, draft.orgUnitId)
  if (!orgUnit) throw new StoreError(`No org unit with id ${draft.orgUnitId}`)
  if (orgUnit.kind !== 'TEAM') {
    throw new StoreError('A requisition must be raised against a TEAM org unit')
  }
  const hiringManager = requireEmployee(state, draft.hiringManagerId)
  const isPeopleManager = state.employments.some(
    (employment) =>
      employment.employeeId === hiringManager.id &&
      employment.endedOn == null &&
      state.jobRoles.find((jobRole) => jobRole.id === employment.jobRoleId)?.isPeopleManager === true,
  )
  if (!isPeopleManager) {
    throw new StoreError('The hiring manager must have an active employment as a people manager')
  }
  const normalizedSkills = draft.requiredSkills.map((skill) => skill.trim())
  const uniqueSkills = new Set(normalizedSkills)
  if (uniqueSkills.size !== normalizedSkills.length) {
    throw new StoreError('Required skills cannot contain duplicate entries')
  }
  if (!draft.openFrom || !draft.openUntil) {
    throw new StoreError('Both openFrom and openUntil are required')
  }
  if (!(draft.openUntil > draft.openFrom)) {
    throw new StoreError('openUntil must be after openFrom')
  }
  if (draft.salaryOffered <= 0) {
    throw new StoreError('Salary offered must be greater than zero')
  }
}

/** Only enforced when the resulting status is OPEN (create with OPEN, or a transition into OPEN). */
function requireOpenReadiness(draft: RequisitionDraft): void {
  const plainTextLength = stripHtml(draft.jobDescription).length
  if (plainTextLength < 40) {
    throw new StoreError('An open requisition needs a job description of at least 40 characters')
  }
  if (draft.requiredSkills.length === 0) {
    throw new StoreError('An open requisition needs at least one required skill')
  }
}

/** DIVISION has no parent; DEPARTMENT's parent must be a DIVISION; TEAM's parent must be a DEPARTMENT. */
function requireValidOrgUnitParent(
  state: PeopleOpsState,
  kind: OrgUnitKind,
  parentId: string | null,
): void {
  if (kind === 'DIVISION') {
    if (parentId !== null) throw new StoreError('A division cannot have a parent org unit')
    return
  }
  if (parentId === null) {
    throw new StoreError(`A ${kind.toLowerCase()} must have a parent org unit`)
  }
  const parent = repo.get(state.orgUnits, parentId)
  if (!parent) throw new StoreError(`No org unit with id ${parentId}`)
  if (kind === 'DEPARTMENT' && parent.kind !== 'DIVISION') {
    throw new StoreError('A department must have a division parent')
  }
  if (kind === 'TEAM' && parent.kind !== 'DEPARTMENT') {
    throw new StoreError('A team must have a department parent')
  }
}

/** Deterministic id so the mirrored OrgUnit needs no extra field to link back to its Department. */
function mirroredDepartmentOrgUnitId(departmentId: string): string {
  return `orgUnit_for_${departmentId}`
}

/** The single division seeded by emptyState(), under which every mirrored department sits. */
function seededDivisionId(state: PeopleOpsState): string {
  const division = state.orgUnits.find((orgUnit) => orgUnit.kind === 'DIVISION' && orgUnit.parentId === null)
  if (!division) throw new StoreError('No seeded division org unit found')
  return division.id
}

function countActiveEmploymentsAtLocation(
  state: PeopleOpsState,
  locationId: string,
  excludeId?: string,
): number {
  return state.employments.filter(
    (employment) =>
      employment.id !== excludeId &&
      employment.locationId === locationId &&
      employment.endedOn == null,
  ).length
}

function requireHeadcountCap(state: PeopleOpsState, locationId: string, excludeId?: string): void {
  const location = requireLocation(state, locationId)
  const activeCount = countActiveEmploymentsAtLocation(state, locationId, excludeId)
  if (activeCount + 1 > location.headcountCap) {
    throw new StoreError(`Location "${location.name}" is at its headcount cap of ${location.headcountCap}`)
  }
}

function requireBaseSalary(baseSalary: number): void {
  if (baseSalary <= 0) throw new StoreError('Base salary must be greater than zero')
}

function requireUniqueJobRoleTitle(
  state: PeopleOpsState,
  title: string,
  level: JobRole['level'],
  excludeId?: string,
): void {
  const normalized = title.trim().toLowerCase()
  const duplicate = state.jobRoles.find(
    (jobRole) =>
      jobRole.id !== excludeId &&
      jobRole.level === level &&
      jobRole.title.trim().toLowerCase() === normalized,
  )
  if (duplicate) throw new StoreError(`A job role titled "${title.trim()}" already exists for level ${level}`)
}
