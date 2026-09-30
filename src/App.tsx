import { useState } from 'react'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EmployeesPage } from './pages/EmployeesPage'

type View = 'departments' | 'employees'

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
      </nav>
      {view === 'departments' ? <DepartmentsPage /> : <EmployeesPage />}
    </main>
  )
}
