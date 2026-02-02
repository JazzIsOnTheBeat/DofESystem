import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthProvider'
import { useLanguage } from '../context/LanguageContext'
import '../styles/login.css'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [nim, setNim] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showToast } = useContext(ToastContext)
  const { login } = useContext(AuthContext)
  const { t } = useLanguage()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await login({ nim, password })
      if (!result.success) {
        showToast(result.error || t('loginFailed'), 'error')
        return
      }
      showToast(t('loginSuccess'), 'success')
      navigate('/')
    } catch (err) {
      showToast(t('networkError'), 'error')
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

        <main className="login-panel" role="main" aria-label={t('signIn')}>
          <form className="panel-card" onSubmit={submit}>
            <h2 className="panel-title">{t('signIn')}</h2>

            <label className="field-label" htmlFor="nim">NIM</label>
            <input className="field-input" id="nim" value={nim} onChange={(e) => setNim(e.target.value)} required />

            <label className="field-label" htmlFor="password" style={{ marginTop: 12 }}>{t('password')}</label>
            <div className="input-with-action">
              <input
                className="field-input"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required/>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn-primary full rounded-full" type="submit" disabled={loading}>
                {loading ? t('processing') : t('signIn')}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
