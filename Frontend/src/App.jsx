import './App.css';
import Sidebar from './partials/sidebar';
import Header from  './partials/header';
import Footer from './partials/footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/home';
import Cash from './pages/cash';
import Members from './pages/members';
import Settings from './pages/settings';
import Login from './pages/login';
import RequireAuth from './components/RequireAuth';

function App() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <div className={`App ${isLogin ? 'no-sidebar' : ''}`}>
      {!isLogin && <Sidebar />}
      <div className="main-content">
        {!isLogin && <Header />}
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/cash" element={<RequireAuth><Cash /></RequireAuth>} />
            <Route path="/members" element={<RequireAuth><Members /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          </Routes>
        </div>
      </div>
      {!isLogin && <Footer />}
    </div>
  )
}

export default App
