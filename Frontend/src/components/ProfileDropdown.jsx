import React from 'react';
import '../styles/header.css';
import { Settings, LogOut } from 'lucide-react';

const ProfileDropdown = ({ onLogout }) => {
  return (
    <div className="profile-dropdown" role="menu" aria-label="Profile menu">
      <ul className="profile-list">
        <li className="profile-item">
          <a className="profile-link" href="#/settings">
            <Settings className="profile-link-icon" size={16} />
            <span>Pengaturan</span>
          </a>
        </li>
        <li className="profile-item">
          <button className="profile-link" onClick={onLogout}>
            <LogOut className="profile-link-icon" size={16} />
            <span>Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileDropdown;
