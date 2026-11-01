import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, Loader } from '../components/Common'
import { ArrowLeft, ArrowRight, CaretDown, CheckIcon } from '../components/Icons'
import ProductCard from '../components/ProductCard'
import { errorMessage } from '../services/api'
import { productService } from '../services'
import { CATEGORY_LABELS } from '../utils/format'

const SORTS = [
  ['featured', 'Featured'],
  ['new', 'New Arrivals'],
  ['price_asc', 'Price:Low-High'],
  ['price_desc', 'Price:High-Low'],
  ['rating', 'Overall Rating'],
  ['name_asc', 'Name: A-Z'],
  ['name_desc', 'Name: Z-A'],
]

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

function FilterDropdown({ label, options, selected, onChange, render }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useClickOutside(ref, useCallback(() => setOpen(false), []))
  const count = selected.length
  return (
    <div className="filter-dd" ref={ref}>
      <button type="button" className={`filter-dd__btn${count ? ' has-value' : ''}`} aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        <span>{label}{count ? ` (${count})` : ''}</span><CaretDown size={16} />
      </button>
      {open && (
        <div className="filter-dd__panel" role="listbox" aria-multiselectable="true">
          {options.length === 0 && <p className="filter-dd__empty">No options</p>}
          {options.map((o) => {
            const on = selected.includes(o.value)
            return (
              <label key={o.value} className="filter-dd__option">
                <input type="checkbox" checked={on} onChange={() =>
                  onChange(on ? selected.filter((v) => v !== o.value) : [...selected, o.value])} />
                {render ? render(o) : o.label}
              </label>
            )
          })}
          {count > 0 && <button type="button" className="filter-dd__clear" onClick={() => onChange([])}>Clear</button>}
        </div>
      )}
    </div>
  )
}

function SortMenu({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useClickOutside(ref, useCallback(() => setOpen(false), []))
  return (
    <div className="sort-menu" ref={ref}>
      <button type="button" className="sort-menu__btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Sort by</button>
      {open && (
        <ul className="sort-menu__list" role="listbox">
          {SORTS.map(([key, label]) => (
            <li key={key}>
              <button type="button" role="option" aria-selected={value === key}
                onClick={() => { onChange(key); setOpen(false) }}>
                {label}{value === key && <CheckIcon size={18} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Shop({ offers = false }) {
  const { category = 'all' } = useParams()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [options, setOptions] = useState({ styles: [], sizes: [], brands: [], colors: [] })
  const [state, setState] = useState({ items: [], count: 0, page: 1, hasMore: false, loading: true, more: false, error: null })

  const list = (key) => (params.get(key) || '').split(',').filter(Boolean)
  const q = params.get('q') || ''
  const sort = params.get('sort') || 'featured'
  const queryKey = params.toString()

  useEffect(() => {
    productService.filters(category).then(setOptions).catch(() => {})
  }, [category])

  useEffect(() => {
    if (['style', 'size', 'brand', 'color'].some((k) => params.get(k))) setFiltersOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const fetchPage = useCallback(async (page, append) => {
    setState((s) => ({ ...s, loading: !append, more: append, error: null }))
    try {
      const query = Object.fromEntries(new URLSearchParams(queryKey))
      if (category !== 'all') query.category = category
      if (offers) query.offers = 1
      query.page = page
      const res = await productService.list(query)
      setState((s) => ({
        items: append ? [...s.items, ...res.results] : res.results,
        count: res.count, page, hasMore: Boolean(res.next), loading: false, more: false, error: null,
      }))
    } catch (e) {
      setState((s) => ({ ...s, loading: false, more: false, error: errorMessage(e) }))
    }
  }, [category, offers, queryKey])

  useEffect(() => { fetchPage(1, false) }, [fetchPage])

  const update = (key, values) => {
    const next = new URLSearchParams(params)
    const v = Array.isArray(values) ? values.join(',') : values
    if (v) next.set(key, v)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  const activeFilters = ['style', 'size', 'brand', 'color'].reduce((n, k) => n + list(k).length, 0)
  const heading = offers ? 'Offers' : q ? `Results for “${q}”` : CATEGORY_LABELS[category] || 'Shop'

  return (
    <div className="shop">
      <h1 className="visually-hidden">{heading}</h1>
      <div className="shop__toolbar">
        <div className={`filters-bar${filtersOpen ? ' is-open' : ''}`}>
          <button type="button" className="filters-bar__toggle" aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((o) => !o)}>
            Filters{filtersOpen ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            {!filtersOpen && activeFilters > 0 && <span className="filters-bar__count">{activeFilters}</span>}
          </button>
          {filtersOpen && (
            <div className="filters-bar__dropdowns">
              <FilterDropdown label="Style" selected={list('style')} onChange={(v) => update('style', v)}
                options={options.styles.map((s) => ({ value: s.slug, label: s.name }))} />
              <FilterDropdown label="Size" selected={list('size')} onChange={(v) => update('size', v)}
                options={options.sizes.map((s) => ({ value: s, label: `EU ${s}` }))} />
              <FilterDropdown label="Brands" selected={list('brand')} onChange={(v) => update('brand', v)}
                options={options.brands.map((b) => ({ value: b.slug, label: b.name }))} />
              <FilterDropdown label="Color" selected={list('color')} onChange={(v) => update('color', v)}
                options={options.colors.map((c) => ({ value: c.name, label: c.name, hex: c.hex_code }))}
                render={(o) => (<><span className="filter-dd__swatch" style={{ background: o.hex || 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }} />{o.label}</>)} />
            </div>
          )}
        </div>
        <SortMenu value={sort} onChange={(v) => update('sort', v === 'featured' ? '' : v)} />
      </div>

      {(q || activeFilters > 0) && !state.loading && (
        <p className="shop__summary">
          {state.count} {state.count === 1 ? 'product' : 'products'}{q && <> for “{q}”</>}
          <button type="button" className="link-btn" onClick={() => setParams(new URLSearchParams(sort !== 'featured' ? { sort } : {}))}>
            Clear all
          </button>
        </p>
      )}

      {state.loading && <Loader label="Loading products…" />}
      {state.error && <ErrorState message={state.error} onRetry={() => fetchPage(1, false)} />}
      {!state.loading && !state.error && state.items.length === 0 && (
        <EmptyState title="No shoes match your selection" action="View all shoes" to={category === 'all' ? '/shop/all' : `/shop/${category}`}>
          Try removing a filter or searching for something else.
        </EmptyState>
      )}

      <div className="product-grid">
        {state.items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {state.hasMore && (
        <div className="view-all-row">
          <button type="button" className="btn btn--primary btn--view-all" disabled={state.more}
            onClick={() => fetchPage(state.page + 1, true)}>
            {state.more ? 'Loading…' : 'View all'}
          </button>
        </div>
      )}
    </div>
  )
}
