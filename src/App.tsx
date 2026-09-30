import { useState } from 'react'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { JobRolesPage } from './pages/JobRolesPage'
import { LocationsPage } from './pages/LocationsPage'

type View = 'departments' | 'employees' | 'jobRoles' | 'locations'

export function App() {
  const [view, setView] = useState<View>('departments')

  return (
    <main>
      <h1>People Ops</h1>
      <nav>
        <button type="button" aria-pressed={view === 'departments'} onClick={() => setView('departments')}>
          Departments
        </button>
        <button type="button" aria-pressed={view === 'employees'} onClick={() => setView('employees')}>
          Employees
        </button>
        <button type="button" aria-pressed={view === 'jobRoles'} onClick={() => setView('jobRoles')}>
          Job Roles
        </button>
        <button type="button" aria-pressed={view === 'locations'} onClick={() => setView('locations')}>
          Locations
        </button>
      </nav>
      {view === 'departments' && <DepartmentsPage />}
      {view === 'employees' && <EmployeesPage />}
      {view === 'jobRoles' && <JobRolesPage />}
      {view === 'locations' && <LocationsPage />}
    </main>
  )
}
