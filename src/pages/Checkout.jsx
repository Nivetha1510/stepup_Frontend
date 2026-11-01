import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import clearpay from '../assets/payments/clearpay.png'
import klarna from '../assets/payments/klarna.png'
import paypal from '../assets/payments/paypal.png'
import visa from '../assets/payments/visa.png'
import { Field, Loader } from '../components/Common'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { errorMessage, fieldErrors } from '../services/api'
import { addressService, orderService, paymentService } from '../services'
import { newIdempotencyKey, rupees } from '../utils/format'
import { payForOrder } from '../utils/razorpay'

const REQUIRED = ['first_name', 'last_name', 'email', 'phone', 'address_line1', 'city', 'state', 'pincode']

function validate(form) {
  const e = {}
  for (const k of REQUIRED) if (!String(form[k] || '').trim()) e[k] = 'This field is required.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
  if (form.phone && !/^\+?[0-9]{10,13}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit phone number.'
  if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode.'
  return e
}

export default function Checkout() {
  const { user } = useAuth()
  const { cart, loading, refresh, setCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const idempotencyKey = useRef(newIdempotencyKey())
  const [addresses, setAddresses] = useState([])
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [online, setOnline] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '',
    phone: user?.phone || '', address_line1: '', city: '', state: '', landmark: '', pincode: '',
    payment_method: location.state?.payment || 'cod', save_address: true,
  })

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    // Real online payment (Razorpay) when the server has keys; otherwise the no-money demo option.
    paymentService.config().then((c) => {
      setOnline(c.online_enabled)
      if (c.online_enabled) setForm((f) => (f.payment_method === 'demo_online' ? { ...f, payment_method: 'razorpay' } : f))
    }).catch(() => {})
  }, [])
  useEffect(() => {
    addressService.list().then((list) => {
      setAddresses(list)
      const def = list.find((a) => a.is_default) || list[0]
      if (def) fillAddress(def, false)
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    setErrors((errs) => (errs[k] ? { ...errs, [k]: undefined } : errs))
  }

  function fillAddress(a, notify = true) {
    setForm((f) => ({ ...f, address_line1: a.address_line1, city: a.city, state: a.state, landmark: a.landmark,
      pincode: a.pincode, phone: f.phone || a.phone, save_address: false }))
    if (notify) toast.show('Saved address filled in')
  }

  const itemCount = useMemo(() => cart.items.reduce((n, i) => n + i.quantity, 0), [cart.items])

  if (loading) return <Loader />
  if (!placing && cart.items.length === 0) return <Navigate to="/cart" replace />

  const submit = async (e) => {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) {
      toast.show('Please fix the highlighted fields.', 'error')
      document.querySelector('.field__error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setPlacing(true)
    try {
      let order = await orderService.create({ ...form, phone: form.phone.replace(/\s/g, '') }, idempotencyKey.current)
      setCart({ items: [], count: 0, subtotal: '0.00', shipping: '0.00', total: '0.00' })
      if (order.payment_method === 'razorpay' && order.payment_status !== 'paid') {
        try {
          const result = await payForOrder(order)
          if (result.status === 'paid') order = result.order
          else toast.show('Payment not completed. You can pay now from the next page.', 'error')
        } catch (payErr) {
          toast.show(errorMessage(payErr), 'error')
        }
      }
      navigate(`/order-success/${order.id}`, { replace: true, state: { order } })
    } catch (err) {
      setErrors(fieldErrors(err))
      toast.show(errorMessage(err), 'error')
      setPlacing(false)
      refresh()
    }
  }

  const err = (k) => errors[k]

  return (
    <div className="checkout">
      <h1 className="page-title">Checkout</h1>
      <form className="checkout__grid" onSubmit={submit} noValidate>
        <aside className="order-summary" aria-label="Order summary">
          <h2>Order Summary</h2>
          <ul>
            {cart.items.map((i) => (
              <li key={i.id} className="order-summary__item">
                <img src={i.image} alt={i.name} />
                <div>
                  {i.brand ? <><p className="order-summary__brand">{i.brand}</p><p>{i.name}</p></> : <p className="order-summary__brand">{i.name}</p>}
                  <dl>
                    <div><dt>Size</dt><dd>{i.size}</dd></div>
                    <div><dt>Quantity</dt><dd>{i.quantity}</dd></div>
                    <div><dt>MRP</dt><dd>{rupees(i.line_total)}</dd></div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
          <dl className="order-summary__totals">
            <div><dt>Amount ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt><dd>{rupees(cart.subtotal)}</dd></div>
            <div><dt>Delivery fees</dt><dd>{Number(cart.shipping) === 0 ? 'Free' : rupees(cart.shipping)}</dd></div>
          </dl>
          <dl className="order-summary__grand"><div><dt>Total</dt><dd>{rupees(cart.total)}</dd></div></dl>
          <p className="order-summary__note">Prices and stock are confirmed by our server when you place the order.</p>
        </aside>

        <section className="checkout__form">
          <h2>Complete Your Order</h2>

          <h3>Personal Details</h3>
          <div className="form-grid">
            <Field label="First Name" error={err('first_name')}>
              <input value={form.first_name} onChange={set('first_name')} placeholder="Enter your first name" autoComplete="given-name" />
            </Field>
            <Field label="Last Name" error={err('last_name')}>
              <input value={form.last_name} onChange={set('last_name')} placeholder="Enter your last name" autoComplete="family-name" />
            </Field>
            <Field label="Email id" error={err('email')}>
              <input type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" autoComplete="email" />
            </Field>
            <Field label="Phone Number" error={err('phone')}>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Enter your phone no" autoComplete="tel" />
            </Field>
          </div>

          <h3>Payment Details</h3>
          <div className="pay-logos" aria-hidden="true">
            <img src={visa} alt="" /><span className="gpay"><b style={{ color: '#4285F4' }}>G</b> Pay</span>
            <img src={paypal} alt="" /><img src={clearpay} alt="" /><img src={klarna} alt="" />
          </div>
          <div className="pay-options" role="radiogroup" aria-label="Payment method">
            {online ? (
              <label className={`pay-option${form.payment_method === 'razorpay' ? ' is-selected' : ''}`}>
                <input type="radio" name="payment" value="razorpay" checked={form.payment_method === 'razorpay'} onChange={set('payment_method')} />
                <span><b>Pay online</b><br />
                  <small>Cards, UPI, net banking and wallets through Razorpay's secure window. We never see or store your card details.</small></span>
              </label>
            ) : (
              <label className={`pay-option${form.payment_method === 'demo_online' ? ' is-selected' : ''}`}>
                <input type="radio" name="payment" value="demo_online" checked={form.payment_method === 'demo_online'} onChange={set('payment_method')} />
                <span><b>Online payment (demo)</b><br />
                  <small>Card / UPI / wallet checkout is in demo mode for this submission. No card details are asked for or stored, and no money is charged.</small></span>
              </label>
            )}
            <label className={`pay-option pay-option--cod${form.payment_method === 'cod' ? ' is-selected' : ''}`}>
              <input type="radio" name="payment" value="cod" checked={form.payment_method === 'cod'} onChange={set('payment_method')} />
              <span>Cash on Delivery</span>
            </label>
          </div>

          <h3>Shipping Address</h3>
          {addresses.length > 0 && (
            <div className="saved-addresses">
              <span>Saved addresses:</span>
              {addresses.map((a) => (
                <button type="button" key={a.id} className="chip" onClick={() => fillAddress(a)}>{a.address_line1}, {a.city}</button>
              ))}
            </div>
          )}
          <Field label="Address Line 1" error={err('address_line1')} className="field--wide">
            <input value={form.address_line1} onChange={set('address_line1')} placeholder="Enter your address" autoComplete="address-line1" />
          </Field>
          <div className="form-grid">
            <Field label="City" error={err('city')}>
              <input value={form.city} onChange={set('city')} placeholder="Your city" autoComplete="address-level2" />
            </Field>
            <Field label="State" error={err('state')}>
              <input value={form.state} onChange={set('state')} placeholder="Your state" autoComplete="address-level1" />
            </Field>
            <Field label="Landmark" error={err('landmark')}>
              <input value={form.landmark} onChange={set('landmark')} placeholder="Any landmark(famous place/mall)" />
            </Field>
            <Field label="Pincode" error={err('pincode')}>
              <input value={form.pincode} onChange={set('pincode')} placeholder="Code" inputMode="numeric" maxLength={6} autoComplete="postal-code" />
            </Field>
          </div>
          <label className="checkbox"><input type="checkbox" checked={form.save_address} onChange={set('save_address')} />
            Save this address to my account</label>

          <div className="checkout__buttons">
            <Link to="/cart" className="btn-pill btn-pill--grey">Cancel</Link>
            <button type="submit" className="btn-pill btn-pill--primary" disabled={placing}>
              {placing ? 'Placing…' : form.payment_method === 'razorpay' ? 'Pay & Order' : 'Order Now'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
