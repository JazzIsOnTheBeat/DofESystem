import { memo } from 'react';
import '../styles/sidebar.css';
import { Ribbon } from 'lucide-react';
import NavLinks from '../components/NavLinks';

const Sidebar = memo(function Sidebar() {
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
                <NavLinks />
            </nav>
        </aside>
    );
});

export default Sidebar;
