import React, { useEffect, useState, memo, useContext, useMemo, useCallback } from 'react';
import { axiosPrivate } from '../api/axios';
import { AuthContext } from '../context/AuthProvider';
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

// Action type config
const actionConfig = {
  payment_created: { icon: Wallet, label: 'Payment Created', color: 'blue' },
  payment_verified: { icon: CheckCircle, label: 'Payment Verified', color: 'green' },
  payment_rejected: { icon: XCircle, label: 'Payment Rejected', color: 'red' },
  payment_deleted: { icon: Trash2, label: 'Payment Deleted', color: 'red' },
  user_created: { icon: UserPlus, label: 'User Created', color: 'blue' },
  user_updated: { icon: Edit, label: 'User Updated', color: 'yellow' },
  expense_created: { icon: Wallet, label: 'Expense Created', color: 'orange' },
  expense_deleted: { icon: Trash2, label: 'Expense Deleted', color: 'red' },
  login: { icon: User, label: 'Login', color: 'green' },
  logout: { icon: User, label: 'Logout', color: 'gray' },
  default: { icon: FileText, label: 'Activity', color: 'default' }
};

const LogItem = memo(function LogItem({ log }) {
  const config = actionConfig[log.action] || actionConfig.default;
  const ActionIcon = config.icon;
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
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
          <span className="log-action">{config.label}</span>
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

  // Initial load
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
    setCurrentPage(1);
  }, [filterAction, searchQuery]);

  // Handlers
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
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="audit-page">
        <div className="access-denied">
          <Shield size={64} />
          <h2>Access Denied</h2>
          <p>This page can only be accessed by leadership (Chairman, Vice Chairman, Secretary, Treasurer).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      {/* Header */}
      <div className="audit-header">
        <div className="header-content">
          <h1>
            <FileText size={28} />
            Audit Logs
          </h1>
          <p className="header-subtitle">Monitor all activities in the system</p>
        </div>
        <div className="header-badge">
          <Shield size={14} />
          Pengurus Only
        </div>
      </div>

      {/* Stats */}
      <div className="audit-stats">
        <StatsCard icon={FileText} label="Total Logs" value={stats.total} color="blue" />
        <StatsCard icon={Calendar} label="Today" value={stats.today} color="green" />
        <StatsCard icon={Wallet} label="Payments" value={stats.payments} color="purple" />
        <StatsCard icon={CheckCircle} label="Verifications" value={stats.verifications} color="orange" />
      </div>

      {/* Toolbar */}
      <div className="audit-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={16} />
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="all">All Activities</option>
            <option value="payment_created">Payment Created</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="payment_rejected">Payment Rejected</option>
            <option value="expense_created">Expense</option>
            <option value="login">Login</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="audit-logs-container">
        {logs.length > 0 ? (
          <div className="logs-list">
            {logs.map(log => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="no-logs">
            <AlertTriangle size={48} />
            <p>No logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="audit-pagination">
          <button 
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
