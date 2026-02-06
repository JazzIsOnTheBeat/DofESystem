import './App.css';
import Sidebar from './partials/sidebar';
import Header from './partials/header';
import Footer from './partials/footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthProvider';
import Home from './pages/Home';
import Cash from './pages/Cash';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Login from './pages/login';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';
import WorkInProgress from './pages/WorkInProgress';
import Summary from './pages/Summary';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RequireAuth from './components/RequireAuth';
import RequirePengurus from './components/RequirePengurus';

function App() {
  const location = useLocation()
  const { isAuthenticated } = useContext(AuthContext)

  const isLogin = location.pathname === '/login'
  const isChangePass = location.pathname === '/change-password'
  const isForgotPass = location.pathname === '/forgot-password'
  const isResetPass = location.pathname.startsWith('/reset-password')

  // Layout should be hidden if on auth pages OR if not authenticated
  const hideLayout = isLogin || isChangePass || isForgotPass || isResetPass || !isAuthenticated;

  return (
    <div className={`App ${hideLayout ? 'no-sidebar' : ''}`}>
      {!hideLayout && <Sidebar />}
      <div className="main-content">
        {!hideLayout && <Header />}
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/cash" element={<RequireAuth><Cash /></RequireAuth>} />
          <Route path="/members" element={<RequireAuth><Members /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/audit-logs" element={<RequirePengurus><AuditLogs /></RequirePengurus>} />
          <Route path="/summary" element={<RequireAuth><Summary /></RequireAuth>} />
          <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/work-in-progress" element={<RequireAuth><WorkInProgress /></RequireAuth>} />

          {/* 404 Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!hideLayout && <Footer />}
    </div>
  )
}

export default App
