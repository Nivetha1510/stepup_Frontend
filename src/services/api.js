import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')

const TOKEN_KEY = 'stepup_token'
const CART_TOKEN_KEY = 'stepup_cart_token'

function safeGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
function safeSet(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch { /* storage unavailable (private mode) — continue in memory */ }
}

export const tokenStore = {
  get: () => safeGet(TOKEN_KEY),
  set: (t) => safeSet(TOKEN_KEY, t),
}
export const cartTokenStore = {
  get: () => safeGet(CART_TOKEN_KEY),
  set: (t) => safeSet(CART_TOKEN_KEY, t),
}

const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 })

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Token ${token}`
  const cartToken = cartTokenStore.get()
  if (cartToken) config.headers['X-Cart-Token'] = cartToken
  return config
})

let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.set(null)
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

/** Turn any Axios/DRF error into a readable message. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
  const data = error.response.data
  if (!data) return fallback
  if (typeof data === 'string') return fallback
  if (data.detail) {
    const items = Array.isArray(data.items) ? ` ${data.items.join(' ')}` : ''
    return `${data.detail}${items}`
  }
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(' ')
  const first = Object.values(data)[0]
  if (Array.isArray(first)) return first.join(' ')
  return fallback
}

/** Field-level DRF errors → { field: 'message' } */
export function fieldErrors(error) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(data)) {
    if (k === 'detail') continue
    out[k] = Array.isArray(v) ? v.join(' ') : String(v)
  }
  return out
}

export default api
