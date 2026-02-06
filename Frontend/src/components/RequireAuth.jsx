import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider'

export default function RequireAuth({ children }) {
  const { isAuthenticated, isDefaultPass } = useContext(AuthContext)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isDefaultPass && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  return children
}
