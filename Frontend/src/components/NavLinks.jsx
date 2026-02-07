import { useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Users, FileText, ClipboardList, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthProvider';

const NavLinks = ({ onItemClick }) => {
    const { accessToken } = useContext(AuthContext);

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

    const links = [
        { to: "/", label: "Dashboard", Icon: Home, end: true },
        { to: "/cash", label: "Cash", Icon: Wallet },
        { to: "/members", label: "Members", Icon: Users },
        { to: "/summary", label: "Summary", Icon: ClipboardList },
        ...(isPengurus ? [{ to: "/audit-logs", label: "Audit Logs", Icon: FileText }] : []),
        { to: "/settings", label: "Settings", Icon: Settings },
    ];

    return (
        <ul className="nav-list">
            {links.map(({ to, label, Icon, end }) => (
                <li className="nav-item" key={to}>
                    <NavLink
                        to={to}
                        end={end}
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={onItemClick}
                    >
                        <Icon className="nav-icon" size={18} />
                        <span className="nav-label">{label}</span>
                    </NavLink>
                </li>
            ))}
        </ul>
    );
};

export default NavLinks;
