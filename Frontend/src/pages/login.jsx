import React, { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider'
import { ToastContext } from '../context/ToastContext'
import '../styles/login.css'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state && location.state.from) || '/'
  const { showToast } = useContext(ToastContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username.trim(), password, remember)
      if (res.ok) {
        showToast('Signed in successfully', 'success')
        // wait a moment so user can see the toast before redirect
        await new Promise((r) => setTimeout(r, 1000))
        navigate(from, { replace: true })
      } else setError(res.message || 'Log In failed')
    } catch (err) {
      setError('Unexpected error')
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
          <div className="panel-card">
            <h2 className="panel-title">Sign in to your account</h2>
            <form onSubmit={handleSubmit} className="login-form compact-form" aria-label="Login form">
              <div style={{position:'relative'}}>
                <input className="field-input" aria-label="username" placeholder="Email or username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div style={{position:'relative'}}>
                <input className="field-input" aria-label="password" placeholder="Password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="show-pass" aria-label="Toggle password" onClick={() => setShowPass(s => !s)}>{showPass ? 'Hide' : 'Show'}</button>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="form-actions-row">
                <button type="submit" className="btn-primary full" disabled={loading}>
                  {loading ? <span className="spinner" aria-hidden="true"></span> : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="helper compact-helper">Demo credentials(Jika lu mau testing) — <strong>admin</strong> / <strong>password</strong></div>
          </div>
        </main>
      </div>
    </div>
  )
}
