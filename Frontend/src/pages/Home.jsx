import React from 'react';
import { Home as HomeIcon } from 'lucide-react';

const Home = () => {
  return (
    <section className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">
            <HomeIcon className="page-icon" size={28} />
            Beranda
          </h2>
          <p className="page-subtitle">Selamat datang di Sistem DofE.</p>
        </div>
      </div>
    </section>
  );
}

export default Home;
