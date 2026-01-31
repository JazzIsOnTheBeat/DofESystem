import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <section className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">
            <SettingsIcon className="page-icon" size={28} />
            Pengaturan
          </h2>
          <p className="page-subtitle">Pengaturan akun dan aplikasi.</p>
        </div>
      </div>
    </section>
  );
}

export default Settings;
