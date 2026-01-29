import React, { createContext, useCallback, useEffect, useState } from 'react'

export const AuthContext = createContext({
  isAuthenticated: false,
  accessToken: null,
  login: async () => {},
  logout: async () => {},
  getAuthHeader: () => ({}),
})

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null)

  useEffect(() => {
    // keep localStorage and state in sync
    const onStorage = () => setAccessToken(localStorage.getItem('accessToken'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async ({ nim, password }) => {
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, error: err.msg || 'Login gagal' }
      }
      const data = await res.json()
      const token = data.accessToken || data.token || null
      if (token) {
        localStorage.setItem('accessToken', token)
        setAccessToken(token)
        return { success: true }
      }
      return { success: false, error: 'No token returned' }
    } catch (err) {
      console.error('login error', err)
      return { success: false, error: 'Network error' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (err) {
      console.error('logout error', err)
    }
    localStorage.removeItem('accessToken')
    setAccessToken(null)
  }, [])

  const getAuthHeader = useCallback(() => ({ Authorization: accessToken ? `Bearer ${accessToken}` : '' }), [accessToken])

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!accessToken, accessToken, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  )
}
