import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clearpay from '../assets/payments/clearpay.png'
import klarna from '../assets/payments/klarna.png'
import paypal from '../assets/payments/paypal.png'
import { EmptyState, Loader } from '../components/Common'
import { CaretDown, LockIcon, TrashIcon, TruckIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { rupees } from '../utils/format'

function useCountdown() {
  const calc = () => {
    const now = new Date()
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    const diff = Math.max(0, end - now)
    return { h: Math.floor(diff / 3.6e6), m: Math.floor((diff % 3.6e6) / 6e4), s: Math.floor((diff % 6e4) / 1000) }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [])
  return t
}

function arrivalDay() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

function SelectBox({ label, value, onChange, children, disabled }) {
  return (
    <label className="select-box">
      <span className="visually-hidden">{label}</span>
      <select value={value} onChange={onChange} disabled={disabled}>{children}</select>
      <CaretDown size={14} />
    </label>
  )
}

export default function Cart() {
  const { cart, loading, busy, updateItem, removeItem } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const t = useCountdown()

  const goCheckout = (payment) => {
    const state = { from: '/checkout', payment }
    navigate(isAuthenticated ? '/checkout' : '/login', { state })
  }

  if (loading) return <Loader label="Loading your cart…" />

  return (
    <div className="cart-page">
      <h1 className="page-title">Your Cart</h1>
      {cart.items.length === 0 ? (
        <EmptyState title="Your cart is empty" action="Start shopping" to="/shop/all">
          Find your next favourite pair in our Womens, Mens and Kids collections.
        </EmptyState>
      ) : (
        <>
          <p className="cart-page__notice">
            <b>{Number(cart.shipping) === 0 ? 'Free & Fast arriving by' : 'Fast delivery arriving by'} {arrivalDay()}</b>
            {' '}Order within {t.h} hours,{t.m} minutes,{t.s} seconds
          </p>

          <ul className="cart-list">
            {cart.items.map((item) => (
              <li key={item.id} className={`cart-item${item.is_available ? '' : ' is-unavailable'}`}>
                <Link to={`/product/${item.product_slug}`} className="cart-item__img"><img src={item.image} alt={item.name} /></Link>
                <div className="cart-item__info">
                  {item.brand ? <><p className="cart-item__brand">{item.brand}</p><p>{item.name}</p></>
                    : <p className="cart-item__brand">{item.name}</p>}
                  <p className="cart-item__meta">Color: {item.color}</p>
                  <p>MRP{rupees(item.unit_price)}{Number(item.unit_price) < Number(item.price) && <s className="muted"> {rupees(item.price)}</s>}</p>
                  {!item.is_available && <p className="field__error">Only {item.stock} left — please reduce the quantity.</p>}
                </div>
                <div className="cart-item__controls">
                  <SelectBox label="Size" value={item.variant} disabled={busy}
                    onChange={(e) => updateItem(item.id, { variant: Number(e.target.value) })}>
                    {item.available_sizes.map((s) => (
                      <option key={s.variant} value={s.variant} disabled={s.stock === 0 && s.variant !== item.variant}>
                        Size ({s.size}){s.stock === 0 ? ' – sold out' : ''}
                      </option>
                    ))}
                  </SelectBox>
                  <SelectBox label="Quantity" value={item.quantity} disabled={busy}
                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}>
                    {Array.from({ length: Math.max(1, Math.min(10, Math.max(item.stock, item.quantity))) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>Quantity ({n})</option>
                    ))}
                  </SelectBox>
                </div>
                <button type="button" className="cart-item__remove" onClick={() => removeItem(item.id)} disabled={busy}>
                  Remove <TrashIcon />
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <p className="cart-summary__title">Summary</p>
            <dl>
              <div><dt>Subtotal</dt><dd>{rupees(cart.subtotal)}</dd></div>
              <div><dt>Delivery</dt><dd>{Number(cart.shipping) === 0 ? 'Free' : rupees(cart.shipping)}</dd></div>
              <div className="cart-summary__total"><dt>Total</dt><dd>{rupees(cart.total)}</dd></div>
            </dl>
            <Link to="/info/shipping" className="cart-summary__info">Delivery &amp; return information <TruckIcon size={20} /></Link>
          </div>
          {Number(cart.shipping) > 0 && (
            <p className="cart-page__hint">Add {rupees(cart.free_shipping_threshold - Number(cart.subtotal))} more for free delivery.</p>
          )}

          <div className="checkout-actions">
            <button type="button" className="btn-checkout" onClick={() => goCheckout('cod')}
              disabled={cart.items.some((i) => !i.is_available)}>
              <LockIcon /> Checkout Securely
            </button>
            <p className="checkout-actions__label">Express Checkout</p>
            <p className="checkout-actions__note">Express options take you to checkout. Without payment keys configured they run in demo mode — no real payment is taken.</p>
            <button type="button" className="express-btn" onClick={() => goCheckout('demo_online')} aria-label="Google Pay (demo)">
              <span className="gpay"><b style={{ color: '#4285F4' }}>G</b> Pay</span>
            </button>
            <button type="button" className="express-btn" onClick={() => goCheckout('demo_online')}><img src={paypal} alt="PayPal (demo)" /></button>
            <button type="button" className="express-btn" onClick={() => goCheckout('demo_online')}><img src={clearpay} alt="Clearpay (demo)" /></button>
            <button type="button" className="express-btn" onClick={() => goCheckout('demo_online')}><img src={klarna} alt="Klarna (demo)" /></button>
          </div>
        </>
      )}
    </div>
  )
}
