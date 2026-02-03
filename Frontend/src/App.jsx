import './App.css';
import Sidebar from './partials/sidebar';
import Header from './partials/header';
import Footer from './partials/footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Cash from './pages/Cash';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Login from './pages/login';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';
import WorkInProgress from './pages/WorkInProgress';
import Summary from './pages/Summary';
import RequireAuth from './components/RequireAuth';
import RequirePengurus from './components/RequirePengurus';

function App() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className={`App ${isLogin ? 'no-sidebar' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {!isLogin && <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
      <div className="main-content">
        {!isLogin && <Header onMenuToggle={() => setMobileMenuOpen(s => !s)} />}
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth><Sidebar /><Header /><div className="main-content"><Footer /></div></RequireAuth>} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/cash" element={<RequireAuth><Cash /></RequireAuth>} />
          <Route path="/members" element={<RequireAuth><Members /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/audit-logs" element={<RequirePengurus><AuditLogs /></RequirePengurus>} />
          <Route path="/summary" element={<RequireAuth><Summary /></RequireAuth>} />
          <Route path="/work-in-progress" element={<RequireAuth><WorkInProgress /></RequireAuth>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isLogin && <Footer />}
    </div>
  )
}

export default App
