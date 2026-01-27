import React, { createContext, useState } from 'react'

export const AuthContext = createContext(null)

const SESSION_KEY = 'dofe_session'

function readStoredSession() {
  try {
    // Prefer persistent (localStorage), fall back to sessionStorage
    let raw = localStorage.getItem(SESSION_KEY)
    if (!raw) raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (s.expiry && s.expiry > Date.now()) return s
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch (e) {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  }
  return null
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession())

  const login = async (username, password, remember = false) => {
    // dummy credentials: admin / password
    if (username === 'admin' && password === 'password') {
      const session = {
        username,
        token: 'demo-token',
        expiry: Date.now() + 1000 * 60 * 60 // 1 hour
      }
      try {
        if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      } catch (e) {
        // Fallback to localStorage if sessionStorage unavailable
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      }
      setUser(session)
      return { ok: true }
    }
    return { ok: false, message: 'Invalid username or password' }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
