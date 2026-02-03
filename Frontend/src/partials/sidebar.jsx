import React, { useEffect } from 'react';
import '../styles/sidebar.css';
import { Home, Wallet, Settings, Users, X, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Ribbon } from 'lucide-react';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);
    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen && window.innerWidth <= 600}>
                <button className="mobile-close" onClick={onClose} aria-label="Close menu">
                    <X size={18} />
                </button>

                <div className="mobile-header">
                    <Sparkles size={18} className="mobile-header-icon" />
                    <div className="mobile-header-title">DofE Management</div>
                </div>

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
                            <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => { if (window.innerWidth <= 600) onClose(); }}>
                                <Home className="nav-icon" size={18} />
                                <span className="nav-label">Beranda</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/cash" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => { if (window.innerWidth <= 600) onClose(); }}>
                                <Wallet className="nav-icon" size={18} />
                                <span className="nav-label">Uang Kas</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/members" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => { if (window.innerWidth <= 600) onClose(); }}>
                                <Users className="nav-icon" size={18} />
                                <span className="nav-label">Anggota</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => { if (window.innerWidth <= 600) onClose(); }}>
                                <Settings className="nav-icon" size={18} />
                                <span className="nav-label">Settings</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
        </>
    );
}

export default Sidebar;