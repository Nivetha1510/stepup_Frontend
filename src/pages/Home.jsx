import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, Loader } from '../components/Common'
import { TrendingCard } from '../components/ProductCard'
import { errorMessage } from '../services/api'
import { productService } from '../services'

// Per-slide layout from the Figma design (1347x400 banner), matched on the banner image filename.
// Positions apply on desktop only (>=1024px). tiled: image tiled at 422px across the banner;
// pos/zoom: image crop; side: caption/button side; capTop/ctaTop: px from top; capX/ctaX: px from that side.
const HERO_LAYOUTS = [
  { match: 'colourful-sneakers', tiled: true, side: 'left', capTop: 47, capX: 63, ctaTop: 273, ctaX: 43,
    capBg: 'rgba(58, 50, 28, 0.78)' },
  { match: 'silver-heels', pos: 'center 57%', zoom: 1.1, side: 'right', capTop: 49, capX: 53, capW: '316px', ctaTop: 258, ctaX: 129,
    capBg: '#282C2E', captionClass: 'hero__caption--left' },
  { match: 'leather-loafers', pos: 'center 79%', side: 'right', capTop: 97, capX: 44, capW: '300px', ctaTop: 284, ctaX: 56,
    captionClass: 'hero__caption--plain' },
  { match: 'red-high-heels', pos: 'center 94%', side: 'left', capTop: 122, capX: 49, ctaTop: 283, ctaX: 49, capBg: '#353738' },
]
const DEFAULT_LAYOUT = { side: 'left', capTop: 120, ctaTop: 290, capX: 48, ctaX: 48 }

function HeroCarousel({ banners }) {
  const [index, setIndex] = useState(0)
  const count = banners.length

  useEffect(() => {
    if (count < 2) return undefined
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(t)
  }, [count])

  if (!count) return <div className="hero hero--empty" />
  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured offers">
      {banners.map((b, i) => {
        const lines = b.title.split(' — ')
        const l = HERO_LAYOUTS.find((x) => b.image.includes(x.match)) || DEFAULT_LAYOUT
        const slideClass = ['hero__slide', l.side === 'right' ? 'hero__slide--right' : '', i === index ? 'is-active' : '']
          .filter(Boolean).join(' ')
        const vars = { '--pos': l.pos, '--zoom': l.zoom, '--cap-top': `${l.capTop}px`, '--cta-top': `${l.ctaTop}px`,
          '--cap-x': `${l.capX}px`, '--cta-x': `${l.ctaX}px`, '--cap-bg': l.capBg, '--cap-w': l.capW }
        return (
          <div key={b.id} className={slideClass} style={vars} aria-hidden={i !== index}>
            {l.tiled
              ? <div className="hero__tiles" style={{ backgroundImage: `url("${b.image}")` }} aria-hidden="true" />
              : <img className="hero__img" src={b.image} alt="" />}
            <div className="hero__content">
              <p className={`hero__caption ${l.captionClass || ''}`}>{lines.map((t, n) => <span key={n}>{n > 0 && <br />}{t}</span>)}</p>
              <Link to={b.link || '/shop/all'} className="hero__cta" tabIndex={i === index ? 0 : -1}>Shop Now</Link>
            </div>
          </div>
        )
      })}
      <div className="hero__dots">
        {banners.map((b, i) => (
          <button key={b.id} type="button" className={i === index ? 'is-active' : ''} aria-label={`Show slide ${i + 1}`}
            onClick={() => setIndex(i)} />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [state, setState] = useState({ loading: true, error: null, banners: [], categories: [], trending: [] })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [banners, categories, trending] = await Promise.all([
        productService.banners(),
        productService.categories(),
        productService.list({ trending: 1, sort: 'new' }),
      ])
      setState({ loading: false, error: null, banners, categories, trending: trending.results.slice(0, 8) })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: errorMessage(e) }))
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Category order in the design: Mens, Womens, Kids
  const order = ['mens', 'womens', 'kids']
  const categories = [...state.categories].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))

  return (
    <div className="home">
      {state.loading ? <div className="hero hero--empty"><Loader /></div> : <HeroCarousel banners={state.banners} />}

      <section className="home__overview container-narrow">
        <h2 className="section-title">Overview</h2>
        <p>"Explore our curated selection of high-quality shoes for every occasion. From durable athletic shoes designed
          for peak performance to stylish casual sneakers and elegant dress shoes, we offer a diverse range of footwear to
          suit your needs. Our user-friendly interface makes it easy to browse our collection and find the perfect pair,
          while detailed product descriptions and high-quality images ensure you make an informed decision. Join our
          community of style and discover your next favorite shoe!"</p>
      </section>

      {state.error && <ErrorState message={state.error} onRetry={load} />}

      <section className="home__categories">
        <h2 className="section-title">What are you looking for?</h2>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c.slug} to={`/shop/${c.slug}`} className="category-tile">
              <div className="category-tile__img"><img src={c.image} alt={`${c.name} shoes`} loading="lazy" /></div>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home__trending">
        <h2 className="section-title">New &amp; Trending</h2>
        <div className="trend-grid">
          {state.trending.map((p) => <TrendingCard key={p.id} product={p} />)}
        </div>
        <div className="view-all-row"><Link to="/shop/all?sort=new" className="btn btn--primary btn--view-all">View all</Link></div>
      </section>

      <section className="promo-banner" aria-label="First order offer">
        <span className="promo-banner__gift" aria-hidden="true">🎁</span>
        <span className="promo-banner__text">Get your first order with free gift</span>
        <span className="promo-banner__gift" aria-hidden="true">🎁</span>
        <span className="promo-banner__text">&amp; 50 % offer</span>
        <span className="promo-banner__badge" aria-hidden="true">%</span>
      </section>
    </div>
  )
}
