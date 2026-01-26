import React from 'react';
import '../styles/header.css';
import { Clock } from 'lucide-react';

const NotificationDropdown = ({ items = [] }) => {
  return (
    <div className="notif-dropdown" role="dialog" aria-label="Notifications">
      <div className="notif-header">Notifications</div>
      <ul className="notif-list">
        {items.length ? (
          items.map((n, i) => (
            <li className="notif-item" key={i}>
              <div className="notif-left">
                <Clock className="notif-dot" size={16} />
              </div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </li>
          ))
        ) : (
          <li className="notif-empty">No notifications</li>
        )}
      </ul>
      <div className="notif-footer">
        <button className="notif-clear">Clear all</button>
      </div>
    </div>
  );
}

export default NotificationDropdown;
