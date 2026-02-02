import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/notfound.css';

const NotFound = () => {
  const { t } = useLanguage();
  
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-illustration">
          <div className="error-code">404</div>
        </div>
        
        <h1>{t('pageNotFound')}</h1>
        <p>{t('pageNotFoundMessage')}</p>
        
        <div className="notfound-actions">
          <Link to="/" className="btn-primary">
            <Home size={18} />
            {t('backToHome')}
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={18} />
            {t('previousPage')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
