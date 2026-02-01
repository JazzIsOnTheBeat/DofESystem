import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import '../styles/notfound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-illustration">
          <div className="error-code">404</div>
        </div>
        
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for is not available or has been moved.</p>
        
        <div className="notfound-actions">
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

export default NotFound;
