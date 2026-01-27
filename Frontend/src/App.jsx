import './App.css';
import Sidebar from './partials/sidebar';
import Header from  './partials/header';
import Footer from './partials/footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Cash from './pages/Cash';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';

function App() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="App">
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
