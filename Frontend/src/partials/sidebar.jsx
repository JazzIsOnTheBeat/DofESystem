import { memo, useContext, useMemo } from 'react';
import '../styles/sidebar.css';
import { Home, Wallet, Settings, Users, Ribbon, FileText, ClipboardList } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = memo(function Sidebar() {
    const { accessToken } = useContext(AuthContext);
    const { t } = useLanguage();

    const userRole = useMemo(() => {
        if (!accessToken) return null;
        try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload).role;
        } catch { return null; }
    }, [accessToken]);

    const isPengurus = useMemo(() => {
        const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
        return pengurusRoles.includes(userRole);
    }, [userRole]);

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
                            <span className="nav-label">{t('dashboard')}</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/cash" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Wallet className="nav-icon" size={18} />
                            <span className="nav-label">{t('cash')}</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/members" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Users className="nav-icon" size={18} />
                            <span className="nav-label">{t('members')}</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/summary" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <ClipboardList className="nav-icon" size={18} />
                            <span className="nav-label">{t('summary')}</span>
                        </NavLink>
                    </li>
                    {isPengurus && (
                        <li className="nav-item">
                            <NavLink to="/audit-logs" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                                <FileText className="nav-icon" size={18} />
                                <span className="nav-label">{t('auditLogs')}</span>
                            </NavLink>
                        </li>
                    )}
                    <li className="nav-item">
                        <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                            <Settings className="nav-icon" size={18} />
                            <span className="nav-label">{t('settings')}</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
});

export default Sidebar;