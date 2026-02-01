import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, Home, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import '../styles/workinprogress.css';

const WorkInProgress = () => {
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
        
        <h1>Under Development</h1>
        <p>This feature is currently under development and will be available soon. Thank you for your patience!</p>
        
        <div className="wip-info">
          <Clock size={16} />
          <span>Estimated: Coming Soon</span>
        </div>
        
        <div className="wip-actions">
          <Link to="/" className="btn-primary">
            <Home size={18} />
            Back to Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={18} />
            Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgress;
