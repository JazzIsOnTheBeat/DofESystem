import '../styles/header.css';
import { Sparkles, Bell, User } from 'lucide-react';
import { useState, useRef, useEffect, useContext, useMemo, useCallback, memo } from 'react';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown';
import { AuthContext } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageContext';

const Header = memo(function Header() {
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const { accessToken } = useContext(AuthContext);
    const { t, formatRole } = useLanguage();

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

    useEffect(() => {
        const onDocClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
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

    return (
        <header className="header">
            <div className="header-inner">
                <Sparkles className="icon" size={20} />
                <h1>DofE Management System</h1>
            </div>

            <div className="header-actions">
                <div className="notif-wrap" ref={notifRef}>
                    <button className="icon-btn" aria-label={t('notifications')} onClick={toggleNotif}>
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