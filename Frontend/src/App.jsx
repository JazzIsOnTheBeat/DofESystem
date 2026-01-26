import './App.css'
import Sidebar from './partials/sidebar'
import Header from  './partials/header'
import Footer from './partials/footer'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cash from './pages/Cash'
import Members from './pages/Members'
import Settings from './pages/Settings'

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cash" element={<Cash />} />
            <Route path="/members" element={<Members />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App
