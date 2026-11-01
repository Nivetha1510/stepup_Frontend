export function rupees(value) {
  const n = Number(value || 0)
  return `₹ ${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function formatDateTime(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(', ', ',')
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()
  return `${date} | ${time}`
}

export function expectedDelivery(iso, days = 7) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase()
    .replace(/^(\w)/, (m) => m)
}

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const CATEGORY_LABELS = { womens: 'Womens', mens: 'Mens', kids: 'Kids', all: 'All Shoes' }
