import '../styles/sidebar.css';
import { Home, Wallet, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Ribbon } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <h2 className='sidebar-title'>
                <div className="sidebar-logo nav-icon">
                    <Ribbon className="logo-icon text-primary" size={35} />
                </div>
                <div className="sidebar-brand">
                    <span className="brand-text">DofE Awards ST Bhinneka</span>
                </div>
                <div className="sidebar-subtitle">Management System</div>

            </h2>
            <nav className="nav">
                <ul>
                    <li className="nav-item">
                        <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Home className="nav-icon" size={18} />
                            <span className="nav-label">Beranda</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/cash" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Wallet className="nav-icon" size={18} />
                            <span className="nav-label">Uang Kas</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/members" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Users className="nav-icon" size={18} />
                            <span className="nav-label">Anggota</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Settings className="nav-icon" size={18} />
                            <span className="nav-label">Settings</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;