import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../services/api'
import { wishlistService } from '../services'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const toast = useToast()
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return }
    try { setItems(await wishlistService.list()) } catch { setItems([]) }
  }, [isAuthenticated])

  useEffect(() => { refresh() }, [refresh])

  const ids = useMemo(() => new Set(items.map((i) => i.product.id)), [items])

  const toggle = useCallback(async (productId) => {
    if (!isAuthenticated) {
      toast.show('Log in to save items to your wishlist', 'error')
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }
    try {
      if (ids.has(productId)) {
        await wishlistService.remove(productId)
        toast.show('Removed from wishlist')
      } else {
        await wishlistService.add(productId)
        toast.show('Saved to wishlist')
      }
      refresh()
    } catch (e) {
      toast.show(errorMessage(e), 'error')
    }
  }, [ids, isAuthenticated, navigate, refresh, toast])

  const value = useMemo(() => ({ items, ids, toggle, refresh }), [items, ids, toggle, refresh])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => useContext(WishlistContext)
