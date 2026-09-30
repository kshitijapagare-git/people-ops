export interface Department {
  id: string
  name: string
  code: string
}

export type DepartmentDraft = Omit<Department, 'id'>

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  /** FK -> Department.id */
  departmentId: string
}

export type EmployeeDraft = Omit<Employee, 'id'>

export type JobRoleLevel = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL'

export interface JobRole {
  id: string
  title: string
  level: JobRoleLevel
  /** Stored as integer minor units (e.g. cents); never a float. */
  baseSalary: number
  isPeopleManager: boolean
}

export type JobRoleDraft = Omit<JobRole, 'id'>

export type Timezone = 'Asia/Kolkata' | 'Europe/London' | 'America/New_York' | 'Asia/Singapore' | 'Australia/Sydney'

export interface Location {
  id: string
  name: string
  city: string
  timezone: Timezone
  headcountCap: number
}

export type LocationDraft = Omit<Location, 'id'>

export interface OrgUnit {
  id: string
  name: string
  /** null for a root org unit */
  parentId: string | null
}

export type OrgUnitDraft = Omit<OrgUnit, 'id'>

export type RequisitionStatus = 'DRAFT' | 'OPEN' | 'ON_HOLD' | 'CLOSED'

export interface Requisition {
  id: string
  positionTitle: string
  jobDescription: string
  /** Stored as integer minor units (e.g. cents); never a float. */
  salaryOffered: number
  /** Local YYYY-MM-DD string */
  openFrom: string
  /** Local YYYY-MM-DD string */
  openTo: string
  status: RequisitionStatus
  /** FK -> OrgUnit.id */
  orgUnitId: string
}

export type RequisitionDraft = Omit<Requisition, 'id'>

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE'

export interface Employment {
  id: string
  /** FK -> Employee.id */
  employeeId: string
  status: EmploymentStatus
}

export type EmploymentDraft = Omit<Employment, 'id'>
