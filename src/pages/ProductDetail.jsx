import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import mastercard from '../assets/payments/mastercard.png'
import rupay from '../assets/payments/rupay.png'
import visa from '../assets/payments/visa.png'
import { ErrorState, Field, Loader, Stars, Swatch } from '../components/Common'
import { CheckIcon, HeartIcon, UserIcon, WhatsAppIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { errorMessage, fieldErrors } from '../services/api'
import { productService } from '../services'
import { rupees } from '../utils/format'

const SCORE_FIELDS = [['fit', 'Fit'], ['comfort', 'Comfort'], ['value_for_money', 'Value for Money'], ['quality', 'Quality']]

function StarInput({ value, onChange, label }) {
  return (
    <span className="star-input" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= value ? 'on' : ''} onClick={() => onChange(n)}>★</button>
      ))}
    </span>
  )
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <h3 className="review-card__heading">Reviews:</h3>
      <div className="review-card__grid">
        <div>
          <div className="review-card__who">
            <span className="review-card__avatar" aria-hidden="true">{review.reviewer?.[0]?.toUpperCase() || <UserIcon />}</span>
            <span><b>Reviewed by {review.reviewer}</b>{review.location && <><br /><b>From: {review.location}</b></>}</span>
          </div>
          <dl className="review-card__scores">
            {SCORE_FIELDS.map(([k, label]) => (
              <div key={k}><dt>{label}</dt><dd><Stars value={review[k]} size={24} color="#FFE066" /></dd></div>
            ))}
          </dl>
        </div>
        <div>
          <p className="review-card__title"><b>{review.title}</b></p>
          <p className="review-card__overall">Overall rating <Stars value={review.rating} size={24} color="#FFE066" /></p>
          <p className="review-card__comment">{review.comment}</p>
          {review.recommend && (
            <p className="review-card__recommend">{review.reviewer} would recommend this product
              <span className="review-card__tick"><CheckIcon size={16} /></span></p>
          )}
        </div>
      </div>
    </article>
  )
}

function ReviewForm({ productId, onSaved }) {
  const blank = { title: '', location: '', rating: 5, fit: 5, comfort: 5, value_for_money: 5, quality: 5, comment: '', recommend: true }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await productService.addReview(productId, form)
      toast.show('Thanks for your review!')
      setForm(blank)
      onSaved()
    } catch (err) {
      setErrors(fieldErrors(err))
      toast.show(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <h3>Write a review</h3>
      <div className="form-grid">
        <Field label="Title" error={errors.title}>
          <input value={form.title} onChange={(e) => set('title')(e.target.value)} required maxLength={100} placeholder="e.g. Super Looking" />
        </Field>
        <Field label="From (city)" error={errors.location}>
          <input value={form.location} onChange={(e) => set('location')(e.target.value)} maxLength={80} placeholder="Your city" />
        </Field>
      </div>
      <div className="review-form__scores">
        <span>Overall rating</span><StarInput label="Overall rating" value={form.rating} onChange={set('rating')} />
        {SCORE_FIELDS.map(([k, label]) => (
          <span key={k} className="review-form__score"><span>{label}</span><StarInput label={label} value={form[k]} onChange={set(k)} /></span>
        ))}
      </div>
      <Field label="Your review" error={errors.comment}>
        <textarea rows={4} value={form.comment} onChange={(e) => set('comment')(e.target.value)} required maxLength={2000} />
      </Field>
      <label className="checkbox"><input type="checkbox" checked={form.recommend} onChange={(e) => set('recommend')(e.target.checked)} />
        I would recommend this product</label>
      <button className="btn btn--primary" disabled={saving}>{saving ? 'Posting…' : 'Post review'}</button>
    </form>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, busy } = useCart()
  const { isAuthenticated } = useAuth()
  const { ids, toggle } = useWishlist()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState(null)
  const [colorId, setColorId] = useState(null)
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)

  const load = useCallback(async () => {
    setError(null)
    setProduct(null)
    try {
      const p = await productService.detail(slug)
      setProduct(p)
      const firstInStock = p.variants.find((v) => v.stock > 0) || p.variants[0]
      setColorId(firstInStock?.color.id ?? null)
      setSize(firstInStock?.stock > 0 ? firstInStock.size : null)
      setQty(1)
      productService.reviews(p.id).then((r) => setReviews(r.results || r)).catch(() => setReviews([]))
    } catch (e) {
      setError(e.response?.status === 404 ? 'We couldn’t find that product.' : errorMessage(e))
    }
  }, [slug])

  useEffect(() => { load() }, [load])

  const colors = useMemo(() => {
    if (!product) return []
    const seen = new Map()
    product.variants.forEach((v) => { if (!seen.has(v.color.id)) seen.set(v.color.id, v.color) })
    return [...seen.values()]
  }, [product])

  const variant = product?.variants.find((v) => v.color.id === colorId && v.size === size)
  const stockFor = (s) => product?.variants.find((v) => v.color.id === colorId && v.size === s)?.stock ?? 0
  const maxQty = Math.min(variant?.stock ?? 0, 10)

  useEffect(() => { if (qty > maxQty && maxQty > 0) setQty(maxQty) }, [maxQty, qty])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!product) return <Loader label="Loading product…" />

  const selectedColor = colors.find((c) => c.id === colorId)
  const gallery = [{ id: 'main', image: product.image, alt_text: product.name }, ...product.images]

  const add = async (thenCheckout) => {
    if (!variant) { toast.show('Please choose a size', 'error'); return }
    try {
      await addItem(variant.id, qty, thenCheckout ? null : 'Added to cart')
      if (thenCheckout) navigate(isAuthenticated ? '/checkout' : '/login', { state: { from: '/checkout' } })
    } catch { /* toast already shown */ }
  }

  const stockText = !variant ? 'Select a size' : variant.stock === 0 ? 'Out of stock'
    : variant.stock <= 5 ? `Only ${variant.stock} left in stock` : 'In stock'

  return (
    <div className="pdp">
      <div className="pdp__top">
        <div className={`pdp__gallery${gallery.length === 1 ? ' pdp__gallery--single' : ''}`}>
          {gallery.map((img, i) => (
            <div key={img.id} className="pdp__gallery-item">
              <img src={img.image} alt={img.alt_text || `${product.name} view ${i + 1}`} loading={i > 1 ? 'lazy' : 'eager'} />
            </div>
          ))}
        </div>

        <div className="pdp__info">
          <div className="pdp__head">
            <div>
              {product.brand && <h1 className="pdp__brand">{product.brand}</h1>}
              <p className={product.brand ? 'pdp__name' : 'pdp__brand'}>{product.name}</p>
            </div>
            <button type="button" className={`pdp__wish${ids.has(product.id) ? ' is-on' : ''}`} onClick={() => toggle(product.id)}
              aria-label={ids.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
              <HeartIcon size={24} filled={ids.has(product.id)} />
            </button>
          </div>
          <p className="pdp__price">
            {product.discount_price
              ? <>MRP{rupees(product.discount_price)} <s>{rupees(product.price)}</s></>
              : <>MRP{rupees(product.price)}</>}
          </p>
          <p className="pdp__rating"><Stars value={product.rating} size={22} />
            <span>{Number(product.rating).toFixed(0)}/5({product.rating_count} reviews)</span></p>

          <p className="pdp__label">Color : {selectedColor?.name}</p>
          <div className="pdp__colors">
            {colors.map((c) => (
              <Swatch key={c.id} color={c} size="lg" selected={c.id === colorId} onClick={() => {
                setColorId(c.id)
                const inStock = product.variants.find((v) => v.color.id === c.id && v.size === size && v.stock > 0)
                if (!inStock) setSize(product.variants.find((v) => v.color.id === c.id && v.stock > 0)?.size ?? null)
              }} />
            ))}
          </div>

          <div className="pdp__section">
            <p className="pdp__label">Shoe Size <span className="pdp__muted">(EU)</span></p>
            <div className="pdp__sizes">
              {product.sizes.map((s) => {
                const out = stockFor(s) === 0
                return (
                  <button key={s} type="button" disabled={out} aria-pressed={s === size}
                    className={`size-btn${s === size ? ' is-selected' : ''}`} onClick={() => setSize(s)}
                    title={out ? 'Out of stock' : `Size ${s}`}>{s}</button>
                )
              })}
            </div>
            <p className={`pdp__stock${variant && variant.stock <= 5 ? ' is-low' : ''}`}>{stockText}</p>
          </div>

          <div className="pdp__section">
            <p className="pdp__label">Quantity</p>
            <div className="qty">
              <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" disabled={qty >= maxQty} onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          <div className="pdp__ctas">
            <button type="button" className="pdp__add" disabled={busy || !variant || variant.stock === 0} onClick={() => add(false)}>Add to Cart</button>
            <button type="button" className="pdp__buy" disabled={busy || !variant || variant.stock === 0} onClick={() => add(true)}>
              Buy Now <span className="pdp__upi" aria-hidden="true"><i>₹</i><i>G</i><i>P</i></span>
            </button>
            <div className="pdp__secure">
              <p>Secure Checkout With</p>
              <div><span className="upi-badge">UPI</span><img src={mastercard} alt="Mastercard" /><img src={rupay} alt="RuPay" /><img src={visa} alt="Visa" /></div>
            </div>
            <Link to="/contact" className="pdp__size-help">Unsure about your size? Let’s connect <WhatsAppIcon size={22} /></Link>
            <div className="pdp__perks">
              <p><b>COD</b> Available</p>
              <p><b>24</b> Hour Dispatch</p>
              <p>7 Days <b>easy return &amp; exchange</b></p>
            </div>
          </div>

          <div className="pdp__details">
            <h2>Product Details</h2>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      <section className="pdp__reviews" aria-label="Customer reviews">
        {reviews.length === 0 && <p className="pdp__no-reviews">No written reviews yet — be the first to review this product.</p>}
        {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        {isAuthenticated
          ? <ReviewForm productId={product.id} onSaved={load} />
          : <p className="pdp__no-reviews"><Link to="/login" state={{ from: `/product/${slug}` }}>Log in</Link> to write a review.</p>}
      </section>
    </div>
  )
}
