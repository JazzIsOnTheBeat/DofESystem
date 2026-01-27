import React from 'react'
import '../styles/login.css'

export default function Login() {
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
            <h2 className="panel-title">Login Temporarily Disabled</h2>
            <p style={{marginTop:12}}>The login feature is currently disabled by the administrator. Please try again later.</p>
            <div style={{marginTop:16}}>
              <a href="/" className="btn-primary">Go to Home</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
