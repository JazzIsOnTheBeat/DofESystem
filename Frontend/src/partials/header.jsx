import '../styles/header.css';
import { Sparkles, Bell, User } from 'lucide-react';
import { useState, useRef, useEffect, useContext } from 'react';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const Header = () => {
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

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

    const notifications = [
        { title: 'Pembayaran kas diterima', time: '2 jam lalu' },
        { title: 'Pengajuan anggota baru', time: '1 hari lalu' },
    ];

    const { logout, user } = useContext(AuthContext)
    const navigate = useNavigate()

    return (
        <header className="header">
            <div className="header-inner">
                <Sparkles className="icon" size={20} />
                <h1>DofE Project</h1>
            </div>

            <div className="header-actions">
                <div className="notif-wrap" ref={notifRef}>
                    <button className="icon-btn" aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setShowNotif(s => !s); }}>
                        <Bell className="bell" size={18} />
                    </button>
                    {showNotif && <NotificationDropdown items={notifications} />}
                </div>

                <div className="profile-wrap" ref={profileRef}>
                    <button className="profile-btn" aria-label="Profile" onClick={(e) => { e.stopPropagation(); setShowProfile(s => !s); }}>
                        <div className="avatar">{user && user.username ? user.username.charAt(0).toUpperCase() : 'D'}</div>
                        <span className="profile-name">{user && user.username ? user.username : 'Dummy'}</span>
                    </button>
                    {showProfile && <ProfileDropdown onLogout={() => { logout(); setShowProfile(false); navigate('/login'); }} />}
                </div>
            </div>
        </header>
    );
}

export default Header;