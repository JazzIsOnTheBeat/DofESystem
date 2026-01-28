import React, { useContext } from 'react';
import '../styles/header.css';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('accessToken');
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
