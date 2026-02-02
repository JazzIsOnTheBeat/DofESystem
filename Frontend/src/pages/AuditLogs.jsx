import React, { useEffect, useState, memo, useContext, useMemo, useCallback } from 'react';
import { axiosPrivate } from '../api/axios';
import { AuthContext } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Wallet,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle
} from 'lucide-react';
import '../styles/auditlogs.css';

const actionConfig = {
  payment_created: { icon: Wallet, labelKey: 'paymentCreated', color: 'blue' },
  payment_verified: { icon: CheckCircle, labelKey: 'paymentVerified', color: 'green' },
  payment_rejected: { icon: XCircle, labelKey: 'paymentRejected', color: 'red' },
  payment_deleted: { icon: Trash2, labelKey: 'paymentDeleted', color: 'red' },
  user_created: { icon: UserPlus, labelKey: 'userCreated', color: 'blue' },
  user_updated: { icon: Edit, labelKey: 'userUpdated', color: 'yellow' },
  expense_created: { icon: Wallet, labelKey: 'expenseCreated', color: 'orange' },
  expense_deleted: { icon: Trash2, labelKey: 'expenseDeleted', color: 'red' },
  login: { icon: User, labelKey: 'login', color: 'green' },
  logout: { icon: User, labelKey: 'logout', color: 'gray' },
  default: { icon: FileText, labelKey: 'activity', color: 'default' }
};

const LogItem = memo(function LogItem({ log, t, language }) {
  const config = actionConfig[log.action] || actionConfig.default;
  const ActionIcon = config.icon;
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`log-item ${config.color}`}>
      <div className="log-icon">
        <ActionIcon size={18} />
      </div>
      <div className="log-content">
        <div className="log-header">
          <span className="log-action">{t(config.labelKey)}</span>
          <span className="log-time">
            <Clock size={12} />
            {formatDate(log.createdAt)}
          </span>
        </div>
        <p className="log-description">{log.description}</p>
        <div className="log-meta">
          <span className="log-user">
            <User size={12} />
            {log.userName || 'System'}
          </span>
          {log.targetUser && (
            <span className="log-target">
              → {log.targetUser}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

const StatsCard = memo(function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`audit-stat ${color}`}>
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
});

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAccess, setHasAccess] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, payments: 0, verifications: 0 });
  const logsPerPage = 15;

  const { accessToken, isLoading: authLoading } = useContext(AuthContext);
  const { t, language } = useLanguage();

  const userRole = useMemo(() => {
    if (!accessToken) return null;
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload).role;
    } catch { return null; }
  }, [accessToken]);

  useEffect(() => {
    const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
    setHasAccess(pengurusRoles.includes(userRole));
  }, [userRole]);

  const fetchLogs = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: logsPerPage,
        ...(filterAction !== 'all' && { action: filterAction }),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await axiosPrivate.get(`/audit-logs?${params}`);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [hasAccess, currentPage, filterAction, searchQuery]);

  const fetchStats = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      const response = await axiosPrivate.get('/audit-logs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
    }
  }, [hasAccess]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken || !hasAccess) {
      setLoading(false);
      return;
    }

    fetchLogs();
    fetchStats();
  }, [accessToken, authLoading, hasAccess, fetchLogs, fetchStats]);

  useEffect(() => {
    const handleFocus = () => {
      if (accessToken && !authLoading && hasAccess) {
        fetchLogs();
        fetchStats();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [accessToken, authLoading, hasAccess, fetchLogs, fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAction, searchQuery]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-loading">
          <div className="loading-spinner"></div>
          <p>{t('loadingAuditLogs')}</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="audit-page">
        <div className="access-denied">
          <Shield size={64} />
          <h2>{t('accessDenied')}</h2>
          <p>{t('accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div className="header-content">
          <h1>
            <FileText size={28} />
            {t('auditLogsTitle')}
          </h1>
          <p className="header-subtitle">{t('monitorActivities')}</p>
        </div>
        <div className="header-badge">
          <Shield size={14} />
          {t('pengurusOnly')}
        </div>
      </div>

      <div className="audit-stats">
        <StatsCard icon={FileText} label={t('totalLogs')} value={stats.total} color="blue" />
        <StatsCard icon={Calendar} label={t('today')} value={stats.today} color="green" />
        <StatsCard icon={Wallet} label={t('payments')} value={stats.payments} color="purple" />
        <StatsCard icon={CheckCircle} label={t('verifications')} value={stats.verifications} color="orange" />
      </div>

      <div className="audit-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('searchActivities')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={16} />
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="all">{t('allActivities')}</option>
            <option value="payment_created">{t('paymentCreated')}</option>
            <option value="payment_verified">{t('paymentVerified')}</option>
            <option value="payment_rejected">{t('paymentRejected')}</option>
            <option value="expense_created">{t('expenseCreated')}</option>
            <option value="login">Login</option>
          </select>
        </div>
      </div>

      <div className="audit-logs-container">
        {logs.length > 0 ? (
          <div className="logs-list">
            {logs.map(log => (
              <LogItem key={log.id} log={log} t={t} language={language} />
            ))}
          </div>
        ) : (
          <div className="no-logs">
            <AlertTriangle size={48} />
            <p>{t('noLogsFound')}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="audit-pagination">
          <button 
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            {t('previous')}
          </button>
          <span className="pagination-info">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </span>
          <button 
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            {t('next')}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
