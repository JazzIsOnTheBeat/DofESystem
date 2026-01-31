import React, { useContext } from 'react';
import '../styles/header.css';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthProvider';

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout()
    showToast('Logout berhasil', 'success');
    navigate('/login');
  }

  return (
    <div className="profile-dropdown" role="menu" aria-label="Profile menu">
      <ul className="profile-list">
        <li className="profile-item">
          <a className="profile-link" href="/settings">
            <Settings className="profile-link-icon" size={16} />
            <span>Pengaturan</span>
          </a>
        </li>
        <li className="profile-item">
          <button className="profile-link" onClick={handleLogout}>
            <LogOut className="profile-link-icon" size={16} />
            <span>Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileDropdown;
