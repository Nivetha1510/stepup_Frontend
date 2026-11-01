import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CategoryNav from './CategoryNav'
import { Loader } from './Common'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="page-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <CategoryNav showBack={pathname !== '/'} />
      <main id="main" className="page-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loader />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}
