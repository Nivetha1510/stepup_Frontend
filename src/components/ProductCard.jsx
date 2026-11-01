import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { errorMessage } from '../services/api'
import { productService } from '../services'
import { rupees } from '../utils/format'
import { ColorRow, Stars } from './Common'
import { HeartIcon } from './Icons'

/** Listing card used on Womens / Mens / Kids / search pages (Figma "product card"). */
export default function ProductCard({ product }) {
  const [colorId, setColorId] = useState(product.colors?.[0]?.id)
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()
  const { ids, toggle } = useWishlist()
  const toast = useToast()
  const navigate = useNavigate()
  const url = `/product/${product.slug}`

  const quickAdd = async () => {
    setAdding(true)
    try {
      // Pick the first in-stock size in the chosen colour; size can be changed in the cart.
      const detail = await productService.detail(product.id)
      const variant = detail.variants.find((v) => v.color.id === colorId && v.stock > 0)
        || detail.variants.find((v) => v.stock > 0)
      if (!variant) {
        toast.show('Sorry, this product is out of stock.', 'error')
        return
      }
      await addItem(variant.id, 1, `Added size ${variant.size} (${variant.color.name}) — you can change the size in your cart`)
    } catch (e) {
      if (!e.response) toast.show(errorMessage(e), 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="product-card">
      <Link to={url} className="product-card__media" aria-label={product.name}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {!product.in_stock && <span className="product-card__tag">Out of stock</span>}
        {product.discount_price && <span className="product-card__tag product-card__tag--sale">Sale</span>}
      </Link>
      <button type="button" className={`product-card__wish${ids.has(product.id) ? ' is-on' : ''}`}
        aria-label={ids.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggle(product.id)}>
        <HeartIcon size={18} filled={ids.has(product.id)} />
      </button>
      <div className="product-card__body">
        <Link to={url} className="product-card__titles">
          {product.brand
            ? <><h3 className="product-card__brand">{product.brand}</h3><p className="product-card__name">{product.name}</p></>
            : <h3 className="product-card__brand product-card__brand--name">{product.name}</h3>}
        </Link>
        <Stars value={product.rating} size={22} />
        <p className="product-card__price">
          {product.discount_price
            ? <><span>MRP{rupees(product.discount_price).replace('₹ ', '₹ ')}</span> <s>{rupees(product.price)}</s></>
            : <>MRP{rupees(product.price).replace('₹ ', '₹ ')}</>}
        </p>
        <div className="product-card__colors">
          {!(product.colors?.length === 1 && !product.colors[0].hex_code) && <span>Color</span>}
          <ColorRow colors={product.colors} selectedId={colorId} onSelect={setColorId} />
        </div>
        <div className="product-card__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={() => navigate(url)}>Buy</button>
          <button type="button" className="btn btn--primary btn--sm" onClick={quickAdd}
            disabled={adding || !product.in_stock}>{adding ? 'Adding…' : 'Add to Cart'}</button>
        </div>
      </div>
    </article>
  )
}

/** Simpler card used in the home page "New & Trending" grid. */
export function TrendingCard({ product }) {
  return (
    <Link to={`/product/${product.slug}`} className="trend-card">
      <div className="trend-card__media"><img src={product.image} alt={product.name} loading="lazy" /></div>
      <p className="trend-card__name">{product.name}</p>
      <p className="trend-card__price">MRP : {rupees(product.selling_price)}</p>
    </Link>
  )
}
