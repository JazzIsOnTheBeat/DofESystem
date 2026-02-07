import '../styles/header.css';
import { Sparkles, Bell, User, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect, useContext, useMemo, useCallback, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown';
import NavLinks from '../components/NavLinks';
import { AuthContext } from '../context/AuthProvider';
import { ChevronRight, Home as HomeIcon } from 'lucide-react'; // Added icons

const Header = memo(function Header() {
    const location = useLocation();
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const mobileNavRef = useRef(null);

    const { accessToken } = useContext(AuthContext);

    // Route to Title Mapping
    const routeTitles = useMemo(() => ({
        '/': 'Home',
        '/cash': 'Cash',
        '/members': 'Members',
        '/settings': 'Settings',
        '/audit-logs': 'Audit Logs',
        '/summary': 'Summary',
        '/work-in-progress': 'Work In Progress',
        '/change-password': 'Change Password',
        '/forgot-password': 'Forgot Password',
        '/reset-password': 'Reset Password'
    }), []);

    // Generate Breadcrumbs
    const breadcrumbs = useMemo(() => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        const crumbs = [{ path: '/', title: 'Home' }];

        let currentPath = '';
        pathnames.forEach((value, index) => {
            currentPath += `/${value}`;

            // Handle dynamic routes like /reset-password/:token
            let title = routeTitles[currentPath];
            if (!title && currentPath.startsWith('/reset-password/')) {
                title = 'Reset Password';
            }

            if (title && title !== 'Home') {
                crumbs.push({ path: currentPath, title });
            }
        });

        return crumbs;
    }, [location.pathname, routeTitles]);

    // Decode JWT to get user info
    const userInfo = useMemo(() => {
        if (!accessToken) return { nama: 'Guest', role: 'anggota' };
        try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return { nama: 'Guest', role: 'anggota' };
        }
    }, [accessToken]);

    const userName = userInfo.nama || 'Guest';
    const userRole = userInfo.role || 'anggota';

    // Format role for display
    const formatRole = useCallback((role) => {
        const roleMap = {
            'ketua': 'Chairman',
            'wakilKetua': 'Vice Chairman',
            'sekretaris': 'Secretary',
            'admin': 'Admin',
            'bendahara': 'Treasurer',
            'anggota': 'Member'
        };
        return roleMap[role] || role;
    }, []);

    useEffect(() => {
        const onDocClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
            if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
                setShowMobileNav(false);
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const notifications = useMemo(() => [
        { title: 'Cash payment received', time: '2 hours ago' },
        { title: 'New member application', time: '1 day ago' },
    ], []);

    const toggleNotif = useCallback((e) => {
        e.stopPropagation();
        setShowNotif(s => !s);
    }, []);

    const toggleProfile = useCallback((e) => {
        e.stopPropagation();
        setShowProfile(s => !s);
    }, []);

    const toggleMobileNav = useCallback((e) => {
        e.stopPropagation();
        setShowMobileNav(s => !s);
    }, []);

    return (
        <header className="header">
            <div className="header-inner">
                <button className="mobile-menu-btn" onClick={toggleMobileNav} aria-label="Toggle Menu">
                    {showMobileNav ? <X size={24} /> : <Menu size={24} />}
                </button>

                {showMobileNav && (
                    <div className="mobile-nav-dropdown" ref={mobileNavRef}>
                        <nav className="mobile-nav">
                            <NavLinks onItemClick={() => setShowMobileNav(false)} />
                        </nav>
                    </div>
                )}

                <nav className="breadcrumb-container" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <div key={crumb.path} className="breadcrumb-item-wrapper">
                                {index === 0 ? (
                                    <Link to="/" className="breadcrumb-home">
                                        <HomeIcon size={16} />
                                    </Link>
                                ) : (
                                    <ChevronRight className="breadcrumb-separator" size={14} />
                                )}

                                {isLast ? (
                                    <span className="breadcrumb-item active">{crumb.title}</span>
                                ) : (
                                    index !== 0 && (
                                        <Link to={crumb.path} className="breadcrumb-item link">
                                            {crumb.title}
                                        </Link>
                                    )
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="header-actions">
                <div className="notif-wrap" ref={notifRef}>
                    <button className="icon-btn" aria-label="Notifications" onClick={toggleNotif}>
                        <Bell className="bell" size={20} />
                    </button>
                    {showNotif && <NotificationDropdown items={notifications} />}
                </div>

                <div className="profile-wrap" ref={profileRef}>
                    <button className="profile-btn" aria-label="Profile" onClick={toggleProfile}>
                        <div className="avatar">{userName[0]?.toUpperCase() || 'G'}</div>
                        <div className="profile-info">
                            <span className="profile-name">{userName}</span>
                            <span className="profile-role">{formatRole(userRole)}</span>
                        </div>
                    </button>
                    {showProfile && <ProfileDropdown />}
                </div>
            </div>
        </header>
    );
});

export default Header;
