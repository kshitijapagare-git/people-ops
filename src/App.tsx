import { useEffect, useState } from 'react'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EmployeesPage } from './pages/EmployeesPage'

const routes = [
  { path: '#/departments', label: 'Departments', icon: '🏢' },
  { path: '#/employees', label: 'Employees', icon: '👤' },
]

const currentRoute = () => window.location.hash || '#/departments'

export function App() {
  const [route, setRoute] = useState(currentRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">👥 People Ops</div>
        <nav>
          {routes.map((r) => (
            <a
              key={r.path}
              href={r.path}
              className={`nav-link ${route === r.path ? 'active' : ''}`}
              aria-current={route === r.path ? 'page' : undefined}
            >
              <span aria-hidden="true">{r.icon}</span>
              {r.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="main">{route === '#/employees' ? <EmployeesPage /> : <DepartmentsPage />}</main>
    </div>
  )
}
