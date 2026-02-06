import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, Home, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/workinprogress.css';

const WorkInProgress = () => {
  const { t } = useLanguage();
  
  return (
    <div className="wip-page">
      <div className="wip-content">
        <div className="wip-illustration">
          <div className="wip-icon-wrapper">
            <Construction size={64} />
          </div>
          <div className="wip-decorations">
            <Sparkles className="sparkle s1" size={20} />
            <Sparkles className="sparkle s2" size={16} />
            <Sparkles className="sparkle s3" size={24} />
          </div>
        </div>
        
        <h1>{t('underDevelopment')}</h1>
        <p>{t('underDevelopmentMessage')}</p>
        
        <div className="wip-info">
          <Clock size={16} />
          <span>{t('estimated')}</span>
        </div>
        
        <div className="wip-actions">
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

export default WorkInProgress;
