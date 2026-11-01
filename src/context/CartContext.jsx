import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cartTokenStore, errorMessage } from '../services/api'
import { cartService } from '../services'
import { useToast } from './ToastContext'

const CartContext = createContext(null)
const EMPTY = { items: [], count: 0, subtotal: '0.00', shipping: '0.00', total: '0.00' }

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const apply = useCallback((data) => {
    if (data.token) cartTokenStore.set(data.token)
    setCart(data)
    return data
  }, [])

  const refresh = useCallback(async () => {
    try {
      apply(await cartService.get())
    } catch (e) {
      if (e.response?.status !== 401) console.warn('Cart load failed', e)
    } finally {
      setLoading(false)
    }
  }, [apply])

  useEffect(() => {
    refresh()
    const onAuth = () => refresh()
    window.addEventListener('stepup:auth-changed', onAuth)
    return () => window.removeEventListener('stepup:auth-changed', onAuth)
  }, [refresh])

  const run = useCallback(async (fn, success) => {
    setBusy(true)
    try {
      const data = apply(await fn())
      if (success) toast.show(success)
      return data
    } catch (e) {
      toast.show(errorMessage(e), 'error')
      throw e
    } finally {
      setBusy(false)
    }
  }, [apply, toast])

  const addItem = useCallback((variantId, qty = 1, message = 'Added to cart') =>
    run(() => cartService.add(variantId, qty), message), [run])
  const updateItem = useCallback((id, payload) => run(() => cartService.update(id, payload)), [run])
  const removeItem = useCallback((id) => run(() => cartService.remove(id), 'Removed from cart'), [run])

  const value = useMemo(() => ({ cart, loading, busy, refresh, addItem, updateItem, removeItem, setCart: apply }),
    [cart, loading, busy, refresh, addItem, updateItem, removeItem, apply])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
