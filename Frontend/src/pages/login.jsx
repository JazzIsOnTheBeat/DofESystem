import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthProvider'
import '../styles/login.css'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [nim, setNim] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showToast } = useContext(ToastContext)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await login({ nim, password })
      if (!result.success) {
        showToast(result.error || 'Login failed', 'error')
        return
      }
      showToast('Login successful', 'success')
      if (result.isDefaultPass) {
        navigate('/change-password')
      } else {
        navigate('/')
      }
    } catch (err) {
      showToast('A network error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page split">
      <div className="login-split">
        <aside className="login-side">
          <div className="side-inner">
            <div className="brand-lg">D</div>
            <h1 className="side-title text-left">DofE Awards ST Bhinneka</h1>
            <p className="side-desc text-left">Management System</p>
          </div>
        </aside>

        <main className="login-panel" role="main" aria-label="Sign in">
          <form className="panel-card" onSubmit={submit}>
            <h2 className="panel-title">Sign In</h2>

            <label className="field-label" htmlFor="nim">NIM</label>
            <input className="field-input" id="nim" value={nim} onChange={(e) => setNim(e.target.value)} required />

            <label className="field-label" htmlFor="password" style={{ marginTop: 12 }}>Password</label>
            <div className="input-with-action">
              <input
                className="field-input"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn-primary full rounded-full" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Sign In'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link
                to="/forgot-password"
                style={{
                  color: 'var(--theme-text-muted)',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
