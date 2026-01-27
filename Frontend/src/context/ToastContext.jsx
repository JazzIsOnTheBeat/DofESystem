import React, { createContext, useCallback, useEffect, useRef, useState } from 'react'
import '../styles/toast.css'

export const ToastContext = createContext({ showToast: () => {} })

let idCounter = 0

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idCounter
    const toast = { id, message, type }
    setToasts((t) => [toast, ...t])
    const timer = setTimeout(() => removeToast(id), duration)
    timers.current.set(id, timer)
    return id
  }, [removeToast])

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t))
      timers.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Close">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
