import React, { useContext, useMemo, useEffect, useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import { axiosPrivate } from '../api/axios';
import {
  Wallet,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  UserPlus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  XCircle,
  FileText,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import '../styles/home.css';

const QuickAction = memo(function QuickAction({ icon: Icon, title, desc, to, color }) {
  return (
    <Link to={to} className={`quick-action ${color}`}>
      <div className="quick-action-icon">
        <Icon size={22} />
      </div>
      <div className="quick-action-content">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <ChevronRight size={18} className="quick-action-arrow" />
    </Link>
  );
});

const StatCard = memo(function StatCard({ icon: Icon, label, value, subtext, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
    </div>
  );
});

const ActivityItem = memo(function ActivityItem({ icon: Icon, title, time, type }) {
  return (
    <div className={`activity-item ${type}`}>
      <div className="activity-icon">
        <Icon size={16} />
      </div>
      <div className="activity-content">
        <span className="activity-title">{title}</span>
        <span className="activity-time">{time}</span>
      </div>
    </div>
  );
});

const actionIconMap = {
  login: { icon: LogIn, type: 'info', label: 'Login' },
  logout: { icon: LogOut, type: 'info', label: 'Logout' },
  register: { icon: UserPlus, type: 'success', label: 'Registration' },
  user_updated: { icon: Edit, type: 'info', label: 'User Updated' },
  user_deleted: { icon: Trash2, type: 'danger', label: 'User Deleted' },
  payment_submitted: { icon: Wallet, type: 'warning', label: 'Payment Submitted' },
  payment_verified: { icon: CheckCircle2, type: 'success', label: 'Payment Accepted' },
  payment_rejected: { icon: XCircle, type: 'danger', label: 'Payment Rejected' },
  expense_created: { icon: TrendingDown, type: 'warning', label: 'New Expense' },
  expense_deleted: { icon: Trash2, type: 'danger', label: 'Expense Deleted' },
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const Home = () => {
  const { accessToken, isLoading: authLoading } = useContext(AuthContext);
  const { t, formatRole, formatRelativeTime, getGreeting, getMonthName, language } = useLanguage();
  const [stats, setStats] = useState({ 
    totalMembers: 0, 
    totalKas: 0, 
    totalExpense: 0,
    myPayments: 0,
    pendingPayments: 0,
    currentMonthPaid: false
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = useMemo(() => {
    if (!accessToken) return { nama: 'Guest', role: 'anggota', userId: null };
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch { return { nama: 'User', role: 'anggota', userId: null }; }
  }, [accessToken]);

  const userName = userInfo.nama || 'Guest';
  const userRole = userInfo.role || 'anggota';
  const isPengurus = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'].includes(userRole);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [language]);

  const currentMonthName = useMemo(() => {
    return getMonthName(new Date().getMonth());
  }, [getMonthName]);

  const fetchData = useCallback(async () => {
    try {
      const baseRequests = [
        axiosPrivate.get('/users'),
        axiosPrivate.get('/kas/summary'),
        axiosPrivate.get('/kas/my')
      ];

      if (isPengurus) {
        baseRequests.push(axiosPrivate.get('/audit-logs?limit=5'));
      }

      if (userRole === 'bendahara') {
        baseRequests.push(axiosPrivate.get('/kas/staff'));
      }

      const responses = await Promise.all(baseRequests);
      
      const [usersRes, summaryRes, myKasRes] = responses;
      
      const currentMonthPaid = myKasRes.data.some(
        k => k.bulan?.startsWith(currentMonthName.substring(0, 3)) && k.Status === 'diterima'
      );

      let pendingCount = 0;
      if (userRole === 'bendahara' && responses[4]) {
        pendingCount = responses[4].data.filter(k => k.Status === 'pending').length;
      }

      setStats({
        totalMembers: usersRes.data.length,
        totalKas: summaryRes.data.balance || 0,
        totalIncome: summaryRes.data.totalIncome || 0,
        totalExpense: summaryRes.data.totalExpense || 0,
        myPayments: myKasRes.data.filter(k => k.Status === 'diterima').length,
        pendingPayments: pendingCount,
        currentMonthPaid
      });

      if (isPengurus && responses[3]?.data?.logs) {
        const logs = responses[3].data.logs.map(log => {
          const actionInfo = actionIconMap[log.action] || { icon: FileText, type: 'info', label: log.action };
          return {
            icon: actionInfo.icon,
            title: log.description,
            time: formatRelativeTime(log.createdAt),
            type: actionInfo.type
          };
        });
        setActivities(logs);
      } else {
        const myActivities = myKasRes.data
          .slice(0, 5)
          .map(kas => ({
            icon: kas.Status === 'diterima' ? CheckCircle2 : kas.Status === 'pending' ? Clock : XCircle,
            title: `Payment ${kas.bulan} ${kas.Status === 'diterima' ? 'accepted' : kas.Status === 'pending' ? 'waiting verification' : 'rejected'}`,
            time: formatRelativeTime(kas.updatedAt || kas.createdAt),
            type: kas.Status === 'diterima' ? 'success' : kas.Status === 'pending' ? 'warning' : 'danger'
          }));
        setActivities(myActivities);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
      setActivities([
        { icon: AlertCircle, title: 'Unable to load activities', time: 'Now', type: 'warning' }
      ]);
    }
    setLoading(false);
  }, [isPengurus, userRole, currentMonthName]);

  useEffect(() => {
    if (authLoading || !accessToken) {
      setLoading(false);
      return;
    }
    fetchData();
    
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [accessToken, authLoading, fetchData]);

  useEffect(() => {
    const handleFocus = () => {
      if (accessToken && !authLoading) {
        fetchData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [accessToken, authLoading, fetchData]);

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-loading">
          <div className="loading-spinner"></div>
          <p>{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-badge">
            <Sparkles size={14} />
            <span>{formatRole(userRole)}</span>
          </div>
          <h1>{getGreeting()}, {userName}! 👋</h1>
          <p className="welcome-date">
            <Calendar size={16} />
            {currentDate}
          </p>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-circle">
            <Award size={48} />
          </div>
        </div>
      </section>

      <section className="stats-section">
        <StatCard
          icon={Users}
          label={t('totalMembers')}
          value={stats.totalMembers}
          subtext={t('activeMembers')}
          color="blue"
        />
        <StatCard
          icon={Wallet}
          label={t('cashBalance')}
          value={`Rp ${stats.totalKas.toLocaleString('en-US')}`}
          subtext={t('availableCash')}
          color="green"
        />
        <StatCard
          icon={CheckCircle2}
          label={t('myPayments')}
          value={`${stats.myPayments}/12`}
          subtext={stats.currentMonthPaid ? `${currentMonthName} ✓` : `${currentMonthName} ${t('notYet')}`}
          color="purple"
        />
        {userRole === 'bendahara' ? (
          <StatCard
            icon={AlertCircle}
            label={t('pendingVerification')}
            value={stats.pendingPayments}
            subtext={t('pendingPayments')}
            color="orange"
          />
        ) : (
          <StatCard
            icon={Target}
            label={t('thisYearTarget')}
            value="Rp 600k"
            subtext={t('perMember')}
            color="orange"
          />
        )}
      </section>

      <div className="home-grid">
        <section className="quick-actions-section">
          <h2 className="section-title">
            <ArrowUpRight size={18} />
            {t('quickActions')}
          </h2>
          <div className="quick-actions-list">
            <QuickAction
              icon={Wallet}
              title={t('payCash')}
              desc={t('payMonthlyCash')}
              to="/cash"
              color="primary"
            />
            <QuickAction
              icon={Users}
              title={t('viewMembers')}
              desc={t('listAllMembers')}
              to="/members"
              color="secondary"
            />
            {userRole === 'bendahara' && (
              <QuickAction
                icon={TrendingUp}
                title={t('manageCash')}
                desc={t('verifyManagePayments')}
                to="/cash"
                color="accent"
              />
            )}
          </div>
        </section>

        <section className="activity-section">
          <h2 className="section-title">
            <Clock size={18} />
            {t('recentActivity')}
          </h2>
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <ActivityItem key={idx} {...activity} />
              ))
            ) : (
              <div className="no-activity">
                <FileText size={24} />
                <p>{t('noActivitiesYet')}</p>
              </div>
            )}
          </div>
          {isPengurus && (
            <Link to="/audit-logs" className="view-all-link">
              {t('viewAllLogs')}
              <ChevronRight size={16} />
            </Link>
          )}
        </section>

        <section className="info-section">
          <div className={`info-card payment-status ${stats.currentMonthPaid ? 'paid' : 'unpaid'}`}>
            <div className="info-card-header">
              {stats.currentMonthPaid ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <h3>{t('cashStatus')} {currentMonthName}</h3>
            </div>
            <div className="info-card-content">
              <div className="payment-status-info">
                {stats.currentMonthPaid ? (
                  <>
                    <span className="status-badge success">{t('paid')}</span>
                    <p>{t('thankYouPayment')}</p>
                  </>
                ) : (
                  <>
                    <span className="status-badge warning">{t('notYetPaid')}</span>
                    <p>{t('paymentNotReceived')}</p>
                    <Link to="/cash" className="pay-now-btn">
                      <Wallet size={14} />
                      {t('payNow')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {userRole === 'bendahara' && (
            <div className="info-card finance-summary">
              <div className="info-card-header">
                <DollarSign size={20} />
                <h3>{t('financialSummary')}</h3>
              </div>
              <div className="info-card-content">
                <div className="finance-row">
                  <span className="finance-label">{t('income')}</span>
                  <span className="finance-value income">+Rp {(stats.totalIncome || 0).toLocaleString('en-US')}</span>
                </div>
                <div className="finance-row">
                  <span className="finance-label">{t('expenses')}</span>
                  <span className="finance-value expense">-Rp {(stats.totalExpense || 0).toLocaleString('en-US')}</span>
                </div>
                <div className="finance-row total">
                  <span className="finance-label">{t('balance')}</span>
                  <span className="finance-value">Rp {stats.totalKas.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="info-card schedule">
            <div className="info-card-header">
              <Calendar size={20} />
              <h3>{t('activitySchedule')}</h3>
            </div>
            <div className="info-card-content">
              <div className="schedule-item">
                <span className="schedule-day">{t('friday')}</span>
                <span className="schedule-desc">{t('weeklyRoutine')}</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-day">{t('saturday')}</span>
                <span className="schedule-desc">{t('outdoorTraining')}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
