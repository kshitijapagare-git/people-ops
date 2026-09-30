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

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'

export interface Employment {
  id: string
  /** FK -> Employee.id */
  employeeId: string
  /** FK -> JobRole.id */
  jobRoleId: string
  /** FK -> Location.id */
  locationId: string
  employmentType: EmploymentType
  noticePeriodDays: number
  weeklyHours: number
  fteAllocation: number
  /** Integer 1-5; null means not set. */
  probationRating: number | null
  /** Date string. */
  joinedOn: string
  /** Date string; null/undefined means the employment is active. */
  endedOn: string | null
}

export type EmploymentDraft = Omit<Employment, 'id'>

export type OrgUnitKind = 'DIVISION' | 'DEPARTMENT' | 'TEAM'

/**
 * DIVISION.parentId must be null.
 * DEPARTMENT.parentId must reference an OrgUnit with kind DIVISION.
 * TEAM.parentId must reference an OrgUnit with kind DEPARTMENT.
 */
export interface OrgUnit {
  id: string
  name: string
  kind: OrgUnitKind
  parentId: string | null
}

export type OrgUnitDraft = Omit<OrgUnit, 'id'>

export type RequisitionStatus = 'DRAFT' | 'OPEN' | 'ON_HOLD' | 'FILLED' | 'CANCELLED'

export type RequiredSkill = 'REACT' | 'TYPESCRIPT' | 'PYTHON' | 'SQL' | 'DEVOPS' | 'DESIGN' | 'QA'

export interface Requisition {
  id: string
  /** FK -> OrgUnit.id; must resolve to an OrgUnit of kind TEAM. */
  orgUnitId: string
  /** FK -> Employee.id; must have an active Employment whose JobRole.isPeopleManager is true. */
  hiringManagerId: string
  positionTitle: string
  /** Stores HTML. */
  jobDescription: string
  requiredSkills: RequiredSkill[]
  /** Local YYYY-MM-DD string; never null, even in DRAFT. */
  openFrom: string
  /** Local YYYY-MM-DD string; must be strictly after openFrom. */
  openUntil: string
  /** Stored as integer minor units (e.g. cents); never a float. */
  salaryOffered: number
  status: RequisitionStatus
}

export type RequisitionDraft = Omit<Requisition, 'id'>
