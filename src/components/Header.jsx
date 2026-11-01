import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/images/stepup-logo.jpg'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons'

export default function Header() {
  const { isAuthenticated, user } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => { if (!location.pathname.startsWith('/shop')) setQuery('') }, [location.pathname])

  const submit = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/shop/all?q=${encodeURIComponent(q)}` : '/shop/all')
  }

  const linkClass = ({ isActive }) => `site-header__link${isActive ? ' is-active' : ''}`

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="StepUp home">
          <img src={logo} alt="StepUp logo" />
        </Link>

        <form className="site-header__search" role="search" onSubmit={submit}>
          <button type="submit" aria-label="Search"><SearchIcon size={24} /></button>
          <input
            type="search" placeholder="Search here" value={query} aria-label="Search products"
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <button className="site-header__menu-btn" aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav className={`site-header__nav${open ? ' is-open' : ''}`} aria-label="Main">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/about" className={linkClass}>About Us</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact Us</NavLink>
          {isAuthenticated
            ? <NavLink to="/account" className={linkClass} title={user?.email}>Account</NavLink>
            : <NavLink to="/login" className={linkClass}>Log in</NavLink>}
          <NavLink to="/cart" className={({ isActive }) => `site-header__link site-header__cart${isActive ? ' is-active' : ''}`}
            aria-label={`Cart, ${cart.count} items`}>
            Cart<span className="site-header__cart-icon"><CartIcon size={22} />
              {cart.count > 0 && <span className="site-header__badge">{cart.count > 99 ? '99+' : cart.count}</span>}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
