import { NavLink, Outlet } from 'react-router'
import Header from '../components/Header'

function AppLayout() {
  return (
    <>
      <Header userName="Admin" />

      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        {' | '}
        <NavLink to="/products">
          Products
        </NavLink>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default AppLayout
