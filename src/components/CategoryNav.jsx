import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { productService } from '../services'
import { ArrowLeft } from './Icons'

// Sub-links shown under each style column of the mega-menu (from the Figma design).
const STYLE_LINKS = {
  sandals: ['Flip Flop', 'Mule', 'Slider', 'Sport'],
  trainers: ['Easy Fasten'],
  canvas: ['Lace Up', 'Slip On'],
  shoes: ['Brogue', 'Casual', 'Easy Fasten', 'Lace up', 'Leather', 'Loafer', 'Oxford'],
  'safety-footwear': ['Boots', 'Shoes', 'Steel toe cap', 'Trainers'],
  boots: ['Ankle', 'Chelsea', 'Desert', 'Lace up', 'Leather', 'Pull on'],
  slippers: ['Full', 'Moccasin', 'Mule'],
  heels: ['Block', 'Kitten', 'Stiletto'],
}

const OFFERS = [
  { label: 'SAVE', to: '/offers' },
  { label: 'Two pairs for thousand', to: '/offers?sort=price_asc' },
  { label: 'Clearance Outlet', to: '/offers?sort=price_asc' },
  { label: 'Boots Sale', to: '/offers?style=boots' },
  { label: 'View all offers', to: '/offers' },
]

const CATEGORIES = [
  { slug: 'womens', label: 'Womens' },
  { slug: 'mens', label: 'Mens' },
  { slug: 'kids', label: 'Kids' },
]

let menuCache = null

export default function CategoryNav({ showBack = true }) {
  const [menu, setMenu] = useState(menuCache || { styles: [], brands: [] })
  const [openMenu, setOpenMenu] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const closeTimer = useRef()

  useEffect(() => {
    if (menuCache) return
    productService.menu().then((m) => { menuCache = m; setMenu(m) }).catch(() => {})
  }, [])

  useEffect(() => { setOpenMenu(null) }, [location.pathname, location.search])

  const brandGroups = useMemo(() => {
    const groups = {}
    for (const b of menu.brands) {
      const letter = b.name[0].toUpperCase()
      ;(groups[letter] ||= []).push(b)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [menu.brands])

  const activeCategory = location.pathname.startsWith('/shop/') ? location.pathname.split('/')[2] : null
  const isOffers = location.pathname.startsWith('/offers')

  const open = (name) => { clearTimeout(closeTimer.current); setOpenMenu(name) }
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpenMenu(null), 150) }
  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name))

  return (
    <div className="brand-bar">
      {showBack && (
        <button type="button" className="brand-bar__back" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
          <ArrowLeft /> Back
        </button>
      )}
      <Link to="/" className="brand-bar__title">StepUp.in</Link>

      <nav className="category-nav" aria-label="Shop categories" onMouseLeave={scheduleClose}>
        <ul className="category-nav__list">
          {CATEGORIES.map((c) => (
            <li key={c.slug} onMouseEnter={() => open(c.slug)}>
              <Link to={`/shop/${c.slug}`} className={`category-nav__link${activeCategory === c.slug ? ' is-active' : ''}`}
                aria-haspopup="true" aria-expanded={openMenu === c.slug}
                onFocus={() => open(c.slug)}>{c.label}</Link>
            </li>
          ))}
          <li onMouseEnter={() => open('brands')}>
            <button type="button" className="category-nav__link" aria-haspopup="true" aria-expanded={openMenu === 'brands'}
              onClick={() => toggle('brands')}>Brands</button>
          </li>
          <li className="category-nav__offers" onMouseEnter={() => open('offers')}>
            <Link to="/offers" className={`category-nav__link${isOffers ? ' is-active' : ''}`} aria-haspopup="true"
              aria-expanded={openMenu === 'offers'} onFocus={() => open('offers')}>Offers</Link>
            {openMenu === 'offers' && (
              <div className="offers-menu" onMouseEnter={() => open('offers')}>
                {OFFERS.map((o) => <Link key={o.label} to={o.to}>{o.label}</Link>)}
              </div>
            )}
          </li>
        </ul>

        {CATEGORIES.some((c) => c.slug === openMenu) && (
          <div className="mega-menu" onMouseEnter={() => open(openMenu)}>
            <div className="mega-menu__col">
              <h4>New Arrivals</h4>
              <Link to={`/shop/${openMenu}?sort=new`}>View all</Link>
            </div>
            {menu.styles.map((s) => (
              <div className="mega-menu__col" key={s.slug}>
                <h4>{s.name}</h4>
                <Link to={`/shop/${openMenu}?style=${s.slug}`}>View all</Link>
                {(STYLE_LINKS[s.slug] || []).map((sub) => (
                  <Link key={sub} to={`/shop/${openMenu}?style=${s.slug}&q=${encodeURIComponent(sub)}`}>{sub}</Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {openMenu === 'brands' && (
          <div className="mega-menu mega-menu--brands" onMouseEnter={() => open('brands')}>
            {brandGroups.map(([letter, brands]) => (
              <div className="mega-menu__brand-group" key={letter}>
                <h4>{letter}</h4>
                {brands.map((b) => <Link key={b.slug} to={`/shop/all?brand=${b.slug}`}>{b.name}</Link>)}
              </div>
            ))}
          </div>
        )}
      </nav>
    </div>
  )
}
