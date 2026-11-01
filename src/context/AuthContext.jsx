import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cartTokenStore, setUnauthorizedHandler, tokenStore } from '../services/api'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(tokenStore.get()))

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    if (!tokenStore.get()) return
    authService.me()
      .then(setUser)
      .catch(() => tokenStore.set(null))
      .finally(() => setLoading(false))
  }, [])

  const finishAuth = useCallback((res) => {
    tokenStore.set(res.token)
    cartTokenStore.set(null) // guest cart has been merged into the account on the server
    setUser(res.user)
    window.dispatchEvent(new Event('stepup:auth-changed'))
    return res.user
  }, [])

  const login = useCallback(async (email, password) => finishAuth(await authService.login(email, password)), [finishAuth])
  const register = useCallback(async (payload) => finishAuth(await authService.register(payload)), [finishAuth])
  const googleLogin = useCallback(
  async (googleCredential) => {
    const response = await authService.googleLogin(googleCredential)
    return finishAuth(response)
  },
  [finishAuth]
)

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* token may already be invalid */ }
    tokenStore.set(null)
    setUser(null)
    window.dispatchEvent(new Event('stepup:auth-changed'))
  }, [])

  const value = useMemo(
  () => ({
    user,
    setUser,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: Boolean(user)
  }),
  [user, loading, login, register, googleLogin, logout]
)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
