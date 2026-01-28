import './App.css';
import Sidebar from './partials/sidebar';
import Header from  './partials/header';
import Footer from './partials/footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/home';
import Cash from './pages/cash';
import Members from './pages/members';
import Settings from './pages/Settings';
import Login from './pages/login';

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
            <Route path="/" element={<Home />} />
            <Route path="/cash" element={<Cash />} />
            <Route path="/members" element={<Members />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
      {!isLogin && <Footer />}
    </div>
  )
}

export default App
