import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ErrorState, Loader } from '../components/Common'
import { CartIcon, CheckIcon, ChevronLeft, ThumbIcon, TruckIcon } from '../components/Icons'
import { useToast } from '../context/ToastContext'
import { QRCodeSVG } from 'qrcode.react'
import { errorMessage, fieldErrors } from '../services/api'
import { orderService, paymentService } from '../services'
import { expectedDelivery, formatDateTime, rupees } from '../utils/format'
import { payForOrder } from '../utils/razorpay'

function useOrder(id, initial) {
  const [order, setOrder] = useState(initial || null)
  const [error, setError] = useState(null)
  const load = useCallback(() => {
    setError(null)
    orderService.detail(id).then(setOrder).catch((e) =>
      setError(e.response?.status === 404 ? 'Order not found.' : errorMessage(e)))
  }, [id])
  useEffect(() => { load() }, [load])
  return { order, setOrder, error, load }
}

function UpiPayment({ order, onSubmitted }) {
  const toast = useToast()
  const [info, setInfo] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    paymentService.upiDetails(order.id).then(setInfo).catch((e) => setLoadError(errorMessage(e)))
  }, [order.id])

  const copy = () => navigator.clipboard?.writeText(info.upi_id).then(() => toast.show('UPI ID copied'), () => {})

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    if (reference.trim() && !/^\d{12}$/.test(reference.trim())) return setError('The UPI reference number should be 12 digits.')
    setError('')
    setSaving(true)
    try {
      onSubmitted(await paymentService.upiReference(order.id, reference.trim()))
    } catch (err) {
      setError(fieldErrors(err).reference || errorMessage(err))
    }
    setSaving(false)
  }

  return (
    <div className="success-card upi-pay">
      <h1>Pay with UPI</h1>
      <p>Order #{order.order_number} is saved. Pay {rupees(order.total)} to complete it.</p>
      {loadError && <p className="field__error" role="alert">{loadError}</p>}
      {info && (
        <>
          <div className="upi-pay__qr"><QRCodeSVG value={info.link} size={200} marginSize={2} /></div>
          <p className="muted small">Scan with any UPI app, or on your phone tap the button below. Click “I have paid” once the payment is done.</p>
          <a className="btn-pill btn-pill--outline upi-pay__app" href={info.link}>Open UPI app</a>
          <p className="upi-pay__id">
            UPI ID: <b>{info.upi_id}</b> <button type="button" className="chip" onClick={copy}>Copy</button>
          </p>
          <form className="upi-pay__form" onSubmit={submit} noValidate>
            <label className="field">
              <span className="field__label">UPI reference number (optional)</span>
              <input value={reference} onChange={(e) => { setReference(e.target.value); setError('') }} inputMode="numeric"
                maxLength={12} placeholder="12-digit number from your payment app" aria-invalid={Boolean(error)} />
              {error && <span className="field__error">{error}</span>}
            </label>
            <button type="submit" className="btn-pill btn-pill--primary" disabled={saving}>{saving ? 'Submitting…' : 'I have paid'}</button>
          </form>
        </>
      )}
      <div className="success-card__actions">
        <Link to={`/account/orders/${order.id}`} className="btn-pill btn-pill--outline">View Order</Link>
      </div>
    </div>
  )
}

export function OrderSuccess() {
  const { id } = useParams()
  const location = useLocation()
  const toast = useToast()
  const { order, setOrder, error, load } = useOrder(id, location.state?.order)
  const [paying, setPaying] = useState(false)
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!order) return <Loader />

  const awaitingPayment = order.payment_method === 'razorpay' && order.payment_status === 'pending' && order.status !== 'cancelled'
  const payNow = async () => {
    setPaying(true)
    try {
      const result = await payForOrder(order)
      if (result.status === 'paid') setOrder(result.order)
    } catch (e) {
      toast.show(errorMessage(e), 'error')
    }
    setPaying(false)
  }

  if (order.payment_method === 'upi' && order.payment_status === 'pending' && order.status !== 'cancelled') {
    return <UpiPayment order={order} onSubmitted={setOrder} />
  }

  if (awaitingPayment) {
    return (
      <div className="success-card">
        <h1>Payment pending</h1>
        <p>Your order #{order.order_number} is saved, but the payment of {rupees(order.total)} has not been completed yet.<br />
          Complete it now to confirm your order.</p>
        <div className="success-card__actions">
          <Link to={`/account/orders/${order.id}`} className="btn-pill btn-pill--outline">View Order</Link>
          <button type="button" className="btn-pill btn-pill--primary" onClick={payNow} disabled={paying}>
            {paying ? 'Opening…' : 'Pay now'}
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="success-card">
      <div className="success-card__icon" aria-hidden="true">
        <svg viewBox="0 0 140 110" width="140" height="110">
          {[[18, 30, 5], [30, 14, 7], [52, 8, 4], [80, 12, 5], [100, 22, 3], [118, 34, 4], [124, 56, 3], [112, 78, 4],
            [96, 92, 2], [40, 96, 3], [20, 78, 4], [12, 54, 6], [64, 102, 2], [28, 62, 2], [108, 64, 2]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#2F4F4F" />
          ))}
        </svg>
        <span className="success-card__check"><CheckIcon size={34} /></span>
      </div>
      <h1>Thankyou for your ordering</h1>
      <p>We’ve received your order will ship in 5-7 business days.<br />Your order number is #{order.order_number}</p>
      {order.payment_method === 'demo_online' && <p className="muted small">Demo payment reference: {order.transaction_reference}</p>}
      {order.payment_method === 'upi' && <p className="muted small">Paid by UPI · Reference: {order.transaction_reference}</p>}
      {order.payment_method === 'razorpay' && <p className="muted small">Paid online · Payment id: {order.transaction_reference}</p>}
      <div className="success-card__actions">
        <Link to={`/account/orders/${order.id}`} className="btn-pill btn-pill--outline">View Order</Link>
        <Link to={`/track/${order.id}`} className="btn-pill btn-pill--primary">Track Order</Link>
      </div>
    </div>
  )
}

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: <CartIcon size={30} /> },
  { key: 'dispatched', label: 'OrderDispatched', icon: <span className="emoji">🏠</span> },
  { key: 'in_transit', label: 'Order in transit', icon: <TruckIcon size={30} /> },
  { key: 'delivered', label: 'Delivered successfully', icon: <ThumbIcon size={30} /> },
]
const RANK = { placed: 0, processing: 0, dispatched: 1, in_transit: 2, delivered: 3 }

export function TrackOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { order, error, load } = useOrder(id)
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!order) return <Loader />
  const first = order.items[0]
  const reached = RANK[order.status] ?? 0
  const cancelled = order.status === 'cancelled'
  const historyFor = (key) => [...order.history].reverse().find((h) => h.status === key)

  return (
    <div className="track-card">
      <div className="track-card__head">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Back"><ChevronLeft /></button>
        <h1>Your Order</h1>
      </div>
      <div className="track-card__meta">
        <span>Order no #{order.order_number}</span>
        <span>{order.payment_method_label} {rupees(order.total)}</span>
      </div>
      {order.items.map((it) => (
        <div className="track-card__item" key={it.id}>
          <img src={it.image_url} alt={it.product_name} />
          <div>
            {it.brand_name && <p className="track-card__brand">{it.brand_name}</p>}
            <p className="track-card__name">{it.product_name}</p>
            <p className="muted small">Size {it.size} · {it.color} · Qty {it.quantity}</p>
            {it === first && !cancelled && order.status !== 'delivered' && (
              <p className="track-card__exp">Exp : Delivery by {expectedDelivery(order.created_at)}</p>
            )}
          </div>
        </div>
      ))}

      <ol className={`timeline${cancelled ? ' is-cancelled' : ''}`}>
        {cancelled ? (
          <>
            <li className="timeline__step is-done"><span className="timeline__icon"><CartIcon size={30} /></span>
              <div><p className="timeline__label">Order Placed</p><p className="timeline__when">{formatDateTime(order.created_at)}</p></div></li>
            <li className="timeline__step is-cancelled"><span className="timeline__icon">✕</span>
              <div><p className="timeline__label">Order cancelled</p>
                <p className="timeline__when">{historyFor('cancelled') ? formatDateTime(historyFor('cancelled').created_at) : ''}</p></div></li>
          </>
        ) : STEPS.map((s, i) => {
          const h = historyFor(s.key) || (s.key === 'placed' ? order.history[0] : null)
          const done = i <= reached
          return (
            <li key={s.key} className={`timeline__step${done ? ' is-done' : ''}${i < reached ? ' line-done' : ''}`}>
              <span className="timeline__icon">{s.icon}</span>
              <div>
                <p className="timeline__label">{s.label}</p>
                <p className="timeline__when">
                  {done ? (h?.note || (h ? formatDateTime(h.created_at) : 'Completed')) : s.key === 'delivered' ? 'Not delivered yet' : 'Pending'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const { order, setOrder, error, load } = useOrder(id)
  const toast = useToast()
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!order) return <Loader />

  const cancel = async () => {
    setCancelling(true)
    try {
      setOrder(await orderService.cancel(order.id))
      toast.show('Your order has been cancelled')
    } catch (e) {
      toast.show(errorMessage(e), 'error')
    } finally {
      setCancelling(false)
      setConfirming(false)
    }
  }

  return (
    <div className="order-detail">
      <p><Link to="/account?tab=orders" className="link-btn">← All orders</Link></p>
      <div className="order-detail__head">
        <div>
          <h1>Order #{order.order_number}</h1>
          <p className="muted">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <span className={`status-pill status-pill--${order.status}`}>{order.status_label}</span>
      </div>
      <div className="order-detail__grid">
        <section>
          <h2>Items</h2>
          {order.items.map((it) => (
            <div className="order-line" key={it.id}>
              <img src={it.image_url} alt={it.product_name} />
              <div>
                {it.product_slug ? <Link to={`/product/${it.product_slug}`}><b>{it.product_name}</b></Link> : <b>{it.product_name}</b>}
                <p className="muted small">{it.brand_name} · Size {it.size} · {it.color}</p>
                <p className="small">{it.quantity} × {rupees(it.unit_price)}</p>
              </div>
              <b>{rupees(it.line_total)}</b>
            </div>
          ))}
        </section>
        <section className="order-detail__side">
          <h2>Delivery address</h2>
          <p>{order.first_name} {order.last_name}<br />{order.address_line1}{order.landmark && <>, {order.landmark}</>}<br />
            {order.city}, {order.state} - {order.pincode}<br />{order.phone}</p>
          <h2>Payment</h2>
          <p>{order.payment_method_label} — {order.payment_status_label}
            {order.transaction_reference && <><br /><span className="muted small">Ref: {order.transaction_reference}</span></>}</p>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{rupees(order.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{Number(order.shipping_cost) === 0 ? 'Free' : rupees(order.shipping_cost)}</dd></div>
            <div className="totals__grand"><dt>Total</dt><dd>{rupees(order.total)}</dd></div>
          </dl>
          <div className="order-detail__actions">
            <Link to={`/track/${order.id}`} className="btn btn--primary">Track Order</Link>
            {order.can_cancel && !confirming && (
              <button type="button" className="btn btn--outline" onClick={() => setConfirming(true)}>Cancel order</button>
            )}
          </div>
          {confirming && (
            <div className="confirm-box" role="alertdialog" aria-label="Confirm cancellation">
              <p>Cancel this order? Items go back to stock and this can’t be undone.</p>
              <button type="button" className="btn btn--danger" disabled={cancelling} onClick={cancel}>
                {cancelling ? 'Cancelling…' : 'Yes, cancel order'}</button>
              <button type="button" className="btn btn--outline" onClick={() => setConfirming(false)}>Keep order</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
