import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, Field, Loader } from '../components/Common'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { errorMessage, fieldErrors, tokenStore } from '../services/api'
import { addressService, authService, orderService } from '../services'
import { formatDateTime, rupees } from '../utils/format'

const TABS = [['profile', 'Profile'], ['orders', 'Orders'], ['addresses', 'Addresses'], ['wishlist', 'Wishlist']]

function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' })
  const [pw, setPw] = useState({ current_password: '', new_password: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      setUser(await authService.updateMe(form))
      toast.show('Profile saved')
    } catch (err) { setErrors(fieldErrors(err)); toast.show(errorMessage(err), 'error') } finally { setSaving(false) }
  }
  const changePw = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      const res = await authService.changePassword(pw)
      tokenStore.set(res.token)
      setPw({ current_password: '', new_password: '' })
      toast.show('Password updated')
    } catch (err) { setErrors(fieldErrors(err)); toast.show(errorMessage(err), 'error') }
  }

  return (
    <div className="account-panels">
      <form className="panel" onSubmit={save}>
        <h2>Profile details</h2>
        <p className="muted">{user.email}</p>
        <div className="form-grid">
          <Field label="First Name" error={errors.first_name}><input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
          <Field label="Last Name" error={errors.last_name}><input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
          <Field label="Phone Number" error={errors.phone}><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        </div>
        <button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
      <form className="panel" onSubmit={changePw}>
        <h2>Change password</h2>
        <Field label="Current password" error={errors.current_password}>
          <input type="password" autoComplete="current-password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
        </Field>
        <Field label="New password" error={errors.new_password}>
          <input type="password" autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} required />
        </Field>
        <button className="btn btn--primary">Update password</button>
      </form>
    </div>
  )
}

function Orders() {
  const [state, setState] = useState({ loading: true, error: null, orders: [] })
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }))
    orderService.list().then((r) => setState({ loading: false, error: null, orders: r.results }))
      .catch((e) => setState({ loading: false, error: errorMessage(e), orders: [] }))
  }, [])
  useEffect(() => { load() }, [load])
  if (state.loading) return <Loader />
  if (state.error) return <ErrorState message={state.error} onRetry={load} />
  if (!state.orders.length) return <EmptyState title="No orders yet" action="Start shopping" to="/shop/all" />
  return (
    <ul className="order-list">
      {state.orders.map((o) => (
        <li key={o.id} className="order-row">
          <div className="order-row__thumbs">
            {o.items.slice(0, 3).map((i) => <img key={i.id} src={i.image_url} alt={i.product_name} />)}
          </div>
          <div className="order-row__info">
            <b>#{o.order_number}</b>
            <span className="muted small">{formatDateTime(o.created_at)} · {o.item_count} item{o.item_count > 1 ? 's' : ''}</span>
            <span className="small">{o.payment_method_label} · {rupees(o.total)}</span>
          </div>
          <span className={`status-pill status-pill--${o.status}`}>{o.status_label}</span>
          <div className="order-row__actions">
            <Link to={`/account/orders/${o.id}`} className="btn btn--outline btn--sm">Details</Link>
            <Link to={`/track/${o.id}`} className="btn btn--primary btn--sm">Track</Link>
          </div>
        </li>
      ))}
    </ul>
  )
}

const BLANK_ADDRESS = { full_name: '', phone: '', address_line1: '', city: '', state: '', landmark: '', pincode: '', is_default: false }

function Addresses() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const load = useCallback(() => addressService.list().then(setList).catch(() => setList([])), [])
  useEffect(() => { load() }, [load])

  const save = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      if (form.id) await addressService.update(form.id, form)
      else await addressService.create(form)
      toast.show('Address saved')
      setForm(null)
      load()
    } catch (err) { setErrors(fieldErrors(err)); toast.show(errorMessage(err), 'error') }
  }
  const remove = async (id) => {
    try { await addressService.remove(id); toast.show('Address removed'); load() } catch (err) { toast.show(errorMessage(err), 'error') }
  }

  if (!list) return <Loader />
  const f = (k, label, props = {}) => (
    <Field label={label} error={errors[k]}><input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...props} /></Field>
  )
  return (
    <div>
      <div className="address-grid">
        {list.map((a) => (
          <div key={a.id} className="panel address-card">
            {a.is_default && <span className="status-pill status-pill--placed">Default</span>}
            <p><b>{a.full_name}</b><br />{a.address_line1}{a.landmark && `, ${a.landmark}`}<br />{a.city}, {a.state} - {a.pincode}<br />{a.phone}</p>
            <div className="address-card__actions">
              <button type="button" className="link-btn" onClick={() => setForm(a)}>Edit</button>
              <button type="button" className="link-btn" onClick={() => remove(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {!form && <button type="button" className="btn btn--primary" onClick={() => setForm(BLANK_ADDRESS)}>Add new address</button>}
      {form && (
        <form className="panel" onSubmit={save}>
          <h2>{form.id ? 'Edit address' : 'New address'}</h2>
          <div className="form-grid">
            {f('full_name', 'Full name', { required: true })}
            {f('phone', 'Phone Number', { required: true, type: 'tel' })}
          </div>
          {f('address_line1', 'Address Line 1', { required: true })}
          <div className="form-grid">
            {f('city', 'City', { required: true })}{f('state', 'State', { required: true })}
            {f('landmark', 'Landmark')}{f('pincode', 'Pincode', { required: true, maxLength: 6, inputMode: 'numeric' })}
          </div>
          <label className="checkbox"><input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} /> Make this my default address</label>
          <div className="row-gap">
            <button className="btn btn--primary">Save address</button>
            <button type="button" className="btn btn--outline" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function Wishlist() {
  const { items } = useWishlist()
  if (!items.length) return <EmptyState title="Your wishlist is empty" action="Browse shoes" to="/shop/all">Tap the heart on any product to save it here.</EmptyState>
  return <div className="product-grid">{items.map((i) => <ProductCard key={i.id} product={i.product} />)}</div>
}

export default function Account() {
  const { user, logout } = useAuth()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = params.get('tab') || 'profile'

  return (
    <div className="account">
      <div className="account__head">
        <div>
          <h1 className="page-title page-title--left">My Account</h1>
          <p className="muted">Hello{user.first_name ? `, ${user.first_name}` : ''}! Manage your orders, addresses and wishlist.</p>
        </div>
        <div className="row-gap">
          {user.is_staff && <a className="btn btn--outline" href={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'}/admin/`}>Admin panel</a>}
          <button type="button" className="btn btn--outline" onClick={async () => { await logout(); navigate('/') }}>Log out</button>
        </div>
      </div>
      <div className="account__tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''}
            onClick={() => setParams({ tab: key })}>{label}</button>
        ))}
      </div>
      {tab === 'profile' && <Profile />}
      {tab === 'orders' && <Orders />}
      {tab === 'addresses' && <Addresses />}
      {tab === 'wishlist' && <Wishlist />}
    </div>
  )
}
