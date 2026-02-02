import React, { useEffect, useMemo, useState, useContext, useCallback, memo } from 'react'
import '../styles/cash.css'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  QrCode,
  PlusCircle,
  Trophy,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  Medal,
  Upload,
  Eye,
  Check,
  XCircle,
  MinusCircle,
  Trash2,
  Users
} from 'lucide-react'
import { axiosPrivate } from '../api/axios'
import { AuthContext } from '../context/AuthProvider'
import { useLanguage } from '../context/LanguageContext'

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const monthsFull = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]

const AnimatedValue = memo(function AnimatedValue({ value, prefix = '', suffix = '' }) {
  return <>{prefix}{value.toLocaleString('en-US')}{suffix}</>
})

const StatCard = memo(function StatCard({ title, value, icon: Icon, variant, trend, trendValue }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-content">
        <div className="stat-label">{title}</div>
        <div className="stat-value">
          <AnimatedValue value={value} prefix="Rp " />
        </div>
        {trend && (
          <div className={`stat-trend ${trend}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )
})

const LeaderboardItem = memo(function LeaderboardItem({ member, rank, paidCount, t }) {
  const rankIcon = useMemo(() => {
    if (rank === 1) return <Crown size={14} className="rank-icon gold" />
    if (rank === 2) return <Medal size={14} className="rank-icon silver" />
    if (rank === 3) return <Medal size={14} className="rank-icon bronze" />
    return <span className="rank-number">{rank}</span>
  }, [rank])

  return (
    <li className="leaderboard-item">
      <div className="rank-badge">{rankIcon}</div>
      <div className="avatar">
        {String(member.nama || '')[0]}
      </div>
      <div className="leaderboard-info">
        <strong>{member.nama}</strong>
        <div className="member-meta">
          <span className="payment-count">
            <CheckCircle2 size={10} />
            {paidCount} {t('months')}
          </span>
          <span className="payment-amount">
            Rp {(paidCount * 10000).toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </li>
  )
})

export default function Cash() {
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState({})
  const [pendingPayments, setPendingPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })

  const [showQris, setShowQris] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  const [newExpense, setNewExpense] = useState({ amount: '', desc: '' })
  const [selectedMember, setSelectedMember] = useState(null)
  const [paymentFile, setPaymentFile] = useState(null)
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth())

  const [isLoading, setIsLoading] = useState(true)

  const { accessToken, isLoading: authLoading } = useContext(AuthContext);
  const { t, formatRole, getMonthsArray, language } = useLanguage();

  const userInfo = useMemo(() => {
    if (!accessToken) return { role: 'anggota', id: 0, nama: '' };
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return { role: 'anggota', id: 0, nama: '' };
    }
  }, [accessToken]);

  const userRole = userInfo.role;
  const userId = userInfo.userId;
  const MONTHLY_FEE = 10000;

  const loadData = useCallback(async () => {
    setIsLoading(true)

    const kasEndpoint = userRole === 'bendahara' || userRole === 'ketua' || userRole === 'sekretaris' || userRole === 'wakilKetua' ? '/kas/staff' : '/kas/my';

    try {
      const usersRes = await axiosPrivate.get('/users');
      setMembers(usersRes.data);

      const [kasRes, expenseRes, summaryRes] = await Promise.all([
        axiosPrivate.get(kasEndpoint),
        axiosPrivate.get('/pengeluaran'),
        axiosPrivate.get('/kas/summary')
      ]);

      const map = {};
      const pending = [];

      kasRes.data.forEach((p) => {
        const id = p.userId;
        const monthStr = (p.bulan || '').substring(0, 3);
        const idx = months.indexOf(monthStr);

        map[id] = map[id] || new Map();

        if (idx >= 0) {
          map[id].set(idx, {
            id: p.id,
            status: p.Status,
            bukti: p.bukti,
            pending: p.Status === 'pending'
          });
        }

        if (p.Status === 'pending') {
          pending.push({ ...p, memberName: p.user?.nama || 'Unknown' });
        }
      });

      setPayments(map);
      setPendingPayments(pending);

      setExpenses(expenseRes.data.map(e => ({
        id: e.id,
        desc: e.deskripsi,
        amount: e.jumlah,
        tanggal: e.tanggal,
        user: e.user?.nama || 'Unknown'
      })));

      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        console.log("Authentication failed - user needs to log in again");
      }
    }

    setIsLoading(false);
  }, [userRole]);

  useEffect(() => {
    if (!authLoading && accessToken) {
      loadData();
    } else if (!authLoading && !accessToken) {
      setIsLoading(false);
    }
  }, [userRole, accessToken, authLoading, loadData]);

  useEffect(() => {
    const handleFocus = () => {
      if (accessToken && !authLoading) {
        loadData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [accessToken, authLoading, loadData]);

  useEffect(() => {
    if (showVerificationModal && pendingPayments.length === 0) {
      setShowVerificationModal(false);
    }
  }, [pendingPayments.length, showVerificationModal]);

  const handleUploadPayment = useCallback(async () => {
    if (!paymentFile) return alert(t('selectPaymentProof'));

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("jumlah", MONTHLY_FEE);
    formData.append("bulan", monthsFull[paymentMonth]);
    formData.append("bukti", paymentFile);

    try {
      const response = await axiosPrivate.post('/kas', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const newPayment = response.data?.data;
      setPayments(prev => {
        const newPayments = { ...prev };
        const userMap = new Map(newPayments[userId] || []);
        userMap.set(paymentMonth, {
          id: newPayment?.id || Date.now(),
          status: 'pending',
          bukti: newPayment?.bukti || null,
          pending: true
        });
        newPayments[userId] = userMap;
        return newPayments;
      });
      
      alert(t('paymentProofSubmitted'));
      setShowQris(false);
      setPaymentFile(null);
    } catch (err) {
      console.error(err);
      alert(t('failedSubmitProof'));
    }
  }, [paymentFile, userId, paymentMonth, t, MONTHLY_FEE]);

  const handleVerifyPayment = useCallback(async (id, status) => {
    const paymentToVerify = pendingPayments.find(p => p.id === id);
    
    try {
      await axiosPrivate.patch(`/kas/bendahara/${id}`, {
        Status: status,
        catatan: status === 'diterima' ? t('paid') : 'Invalid proof'
      });
      
      setPendingPayments(prev => prev.filter(p => p.id !== id));
      
      if (paymentToVerify) {
        const monthStr = (paymentToVerify.bulan || '').substring(0, 3);
        const monthIdx = months.indexOf(monthStr);
        const memberId = paymentToVerify.userId;
        
        if (status === 'diterima') {
          setPayments(prev => {
            const newPayments = { ...prev };
            const userMap = new Map(newPayments[memberId] || []);
            userMap.set(monthIdx, {
              id: id,
              status: 'diterima',
              bukti: paymentToVerify.bukti,
              pending: false
            });
            newPayments[memberId] = userMap;
            return newPayments;
          });
          
          setSummary(prev => ({
            ...prev,
            totalIncome: prev.totalIncome + parseInt(paymentToVerify.jumlah || MONTHLY_FEE),
            balance: prev.balance + parseInt(paymentToVerify.jumlah || MONTHLY_FEE)
          }));
        } else {
          setPayments(prev => {
            const newPayments = { ...prev };
            const userMap = new Map(newPayments[memberId] || []);
            userMap.delete(monthIdx);
            newPayments[memberId] = userMap;
            return newPayments;
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert(t('failedProcessVerification'));
    }
  }, [t, pendingPayments, MONTHLY_FEE]);

  const totalIncome = summary.totalIncome;
  const totalExpenses = summary.totalExpense;
  const balance = summary.balance;

  const addExpense = useCallback(async () => {
    const amt = Number(newExpense.amount) || 0
    if (!amt || !newExpense.desc) {
      alert(t('amountDescRequired'));
      return;
    }

    try {
      const response = await axiosPrivate.post('/pengeluaran', {
        jumlah: amt,
        deskripsi: newExpense.desc
      });
      
      const newExpenseData = response.data?.data || {
        id: Date.now(),
        desc: newExpense.desc,
        amount: amt,
        tanggal: new Date().toISOString(),
        user: userInfo.nama || 'Unknown'
      };
      
      setExpenses(prev => [{
        id: newExpenseData.id,
        desc: newExpenseData.deskripsi || newExpense.desc,
        amount: newExpenseData.jumlah || amt,
        tanggal: newExpenseData.tanggal || new Date().toISOString(),
        user: newExpenseData.user?.nama || userInfo.nama || 'Unknown'
      }, ...prev]);
      
      setSummary(prev => ({
        ...prev,
        totalExpense: prev.totalExpense + amt,
        balance: prev.balance - amt
      }));
      
      setNewExpense({ amount: '', desc: '' })
      setShowExpenseModal(false)
    } catch (err) {
      console.error(err);
      alert(t('failedAddExpense'));
    }
  }, [newExpense, t, userInfo.nama])

  const deleteExpense = useCallback(async (id) => {
    if (!window.confirm(t('deleteExpense'))) return;
    
    const expenseToDelete = expenses.find(e => e.id === id);
    
    try {
      await axiosPrivate.delete(`/pengeluaran/${id}`);
      
      setExpenses(prev => prev.filter(e => e.id !== id));
      
      if (expenseToDelete) {
        setSummary(prev => ({
          ...prev,
          totalExpense: prev.totalExpense - expenseToDelete.amount,
          balance: prev.balance + expenseToDelete.amount
        }));
      }
    } catch (err) {
      console.error(err);
      alert(t('failedDeleteExpense'));
    }
  }, [t, expenses])

  const leaderboard = useMemo(() => {
    const rows = (members || []).map(m => {
      const userPayments = payments[m.id] || new Map();
      let paidCount = 0;
      userPayments.forEach(v => { if (v.status === 'diterima') paidCount++; });

      return {
        id: m.id,
        nama: m.nama,
        paid: paidCount,
        kasAmount: m.kasAmount || 0,
        role: m.role
      };
    })
    return rows.sort((a, b) => b.paid - a.paid).slice(0, 5)
  }, [members, payments])

  const visibleMembers = useMemo(() => {
    if (userRole === 'bendahara' || userRole === 'ketua' || userRole === 'sekretaris' || userRole === 'wakilKetua') return members
    return members.filter(m => m.id === userId)
  }, [members, userRole, userId])

  const currentMonthIdx = useMemo(() => new Date().getMonth(), [])

  const handleManualToggle = useCallback(async (member, monthIdx) => {
    if (userRole !== 'bendahara') return;

    const userPayments = payments[member.id] || new Map();
    const paymentData = userPayments.get(monthIdx);
    const monthName = monthsFull[monthIdx];

    try {
      if (paymentData) {
        if (window.confirm(`${t('deletePaymentStatus')} ${member.nama} ${monthName}?`)) {
          await axiosPrivate.delete(`/kas/staff/${paymentData.id}`);
          
          setPayments(prev => {
            const newPayments = { ...prev };
            const userMap = new Map(newPayments[member.id] || []);
            userMap.delete(monthIdx);
            newPayments[member.id] = userMap;
            return newPayments;
          });
          
          if (paymentData.status === 'diterima') {
            setSummary(prev => ({
              ...prev,
              totalIncome: prev.totalIncome - MONTHLY_FEE,
              balance: prev.balance - MONTHLY_FEE
            }));
          }
        }
      } else {
        const response = await axiosPrivate.post('/kas/manual', {
          userId: member.id,
          bulan: monthName,
          jumlah: MONTHLY_FEE
        });
        const newPayment = response.data?.data;
        
        setPayments(prev => {
          const newPayments = { ...prev };
          const userMap = new Map(newPayments[member.id] || []);
          userMap.set(monthIdx, {
            id: newPayment?.id || Date.now(),
            status: 'diterima',
            bukti: null,
            pending: false
          });
          newPayments[member.id] = userMap;
          return newPayments;
        });
        
        setSummary(prev => ({
          ...prev,
          totalIncome: prev.totalIncome + MONTHLY_FEE,
          balance: prev.balance + MONTHLY_FEE
        }));
      }
    } catch (error) {
      console.error("Failed to toggle payment", error);
      alert(t('failedChangePaymentStatus'));
    }
  }, [userRole, payments, t, MONTHLY_FEE]);

  if (isLoading) {
    return (
      <section className="cash-page">
        <div className="cash-loading">
          <div className="loading-spinner"></div>
          <p>{t('loadingData')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="cash-page">
      <div className="cash-header">
        <div className="cash-header-content">
          <h1>
            <Wallet size={28} />
            {t('cashFund')}
          </h1>
          <p>{t('managePaymentsExpenses')}</p>
        </div>
        <div className="cash-actions">
          {(userRole === 'bendahara' || userRole === 'ketua' || userRole === 'sekretaris' || userRole === 'wakilKetua') && (
            <>
              <button className="btn" onClick={() => setShowExpenseModal(true)}>
                <MinusCircle size={16} />
                {t('addExpense')}
              </button>
              {pendingPayments.length > 0 && (
                <button className="btn primary" onClick={() => setShowVerificationModal(true)}>
                  <AlertCircle size={16} />
                  {t('verification')} ({pendingPayments.length})
                </button>
              )}
            </>
          )}
          <button className="btn primary" onClick={() => setShowQris(true)}>
            <QrCode size={16} />
            {t('payCash')}
          </button>
        </div>
      </div>

      <div className="cash-stats">
        <StatCard
          title={t('totalCashIn')}
          value={totalIncome}
          icon={TrendingUp}
          variant="green"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title={t('totalExpenses')}
          value={totalExpenses}
          icon={TrendingDown}
          variant="red"
          trend="down"
          trendValue="-5%"
        />
        <StatCard
          title={t('currentBalance')}
          value={balance}
          icon={Wallet}
          variant="blue"
        />
      </div>

      <div className="cash-main">
        <div className="cash-left">
          <div className="payment-table-card">
            <div className="table-header">
              <h3>
                <Users size={18} />
                {t('cashPaymentTable')}
              </h3>
            </div>
            <div className="table-wrap">
              <table className="kas-table">
                <thead>
                  <tr>
                    <th>{t('member')}</th>
                    {months.map((m, i) => (
                      <th key={m} title={monthsFull[i]} className={i === currentMonthIdx ? 'current-month' : ''}>
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((m) => (
                    <tr key={m.id} className={m.role === 'bendahara' || m.role === 'ketua' || m.role === 'sekretaris' || m.role === 'wakilKetua' ? 'row-bendahara' : ''}>
                      <td>
                        <div className="member-name">
                          <div className="member-avatar">{String(m.nama || '')[0] || '?'}</div>
                          <div className="member-info">
                            <div className="member-main">
                              <span className="name-text">{m.nama}</span>
                              {(m.role === 'bendahara' || m.role === 'ketua' || m.role === 'sekretaris' || m.role === 'wakilKetua') && (
                                <span className="badge accent-1">
                                  {m.role === 'ketua' ? (
                                    <>
                                      <Sparkles size={8} />
                                      <p>{t('chairman')}</p>
                                    </>
                                  ) : m.role === 'sekretaris' ? (
                                    <>
                                      <Sparkles size={8} />
                                      <p>{t('secretary')}</p>
                                    </>
                                  ) : m.role === 'wakilKetua' ? (
                                    <>
                                      <Sparkles size={8} />
                                      <p>{t('viceChairman')}</p>
                                    </>
                                  ) : m.role === 'bendahara' ? (
                                    <>
                                      <Sparkles size={8} />
                                      <p>{t('treasurer')}</p>
                                    </>
                                  ) : null}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {months.map((mm, monthIdx) => {
                        const userPayments = payments[m.id] || new Map();
                        const paymentData = userPayments.get(monthIdx);
                        const status = paymentData ? paymentData.status : null;
                        const isPending = status === 'pending';
                        const isPaid = status === 'diterima';
                        const isCurrentMonth = monthIdx === currentMonthIdx;

                        let tooltip = `${m.nama} — ${monthsFull[monthIdx]}`;
                        if (isPending) tooltip += ` (${t('waitingVerification')})`;
                        if (isPaid) tooltip += ` (${t('paid')})`;

                        return (
                          <td key={mm} className={isCurrentMonth ? 'current-month-cell' : ''}>
                            <div
                              className={`chk-wrap ${(userRole === 'bendahara' || userRole === 'ketua' || userRole === 'sekretaris' || userRole === 'wakilKetua') ? 'cursor-pointer' : ''}`}
                              onClick={() => handleManualToggle(m, monthIdx)}
                              title={tooltip}
                            >
                              {isPaid ? (
                                <div className="chk-circle checked"></div>
                              ) : isPending ? (
                                <div className="chk-circle pending">
                                  <div className="pending-dot"></div>
                                </div>
                              ) : (
                                <div className="chk-circle"></div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(userRole === 'bendahara' || userRole === 'ketua' || userRole === 'sekretaris' || userRole === 'wakilKetua') && expenses.length > 0 && (
            <div className="expense-section">
              <h3 className="section-title">
                <Receipt size={18} />
                {t('expenseList')}
              </h3>
              <div className="expense-list">
                {expenses.map((exp) => (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-info">
                      <span className="expense-desc">{exp.desc}</span>
                      <span className="expense-meta">
                        {new Date(exp.tanggal).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')} • {exp.user}
                      </span>
                    </div>
                    <div className="expense-amount">
                      <span>- Rp {exp.amount.toLocaleString('en-US')}</span>
                      <button className="btn-delete" onClick={() => deleteExpense(exp.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cash-right">
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <Trophy size={18} className="trophy-icon" />
              <h3>Leaderboard</h3>
            </div>
            <p className="leaderboard-subtitle">{t('topMembersPayments')}</p>
            <ul className="leaderboard-list">
              {leaderboard.map((m, idx) => (
                <LeaderboardItem
                  key={m.id}
                  member={m}
                  rank={idx + 1}
                  paidCount={m.paid}
                  t={t}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showQris && (
        <div className="modal-overlay" onClick={() => setShowQris(false)}>
          <div className="modal-content qris-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQris(false)}>
              <X size={18} />
            </button>
            <h3>{t('cashPayment')}</h3>
            <div className="qris-image">
              <QrCode size={120} />
              <p>{t('scanQRIS')}</p>
            </div>
            <div className="payment-form">
              <label>{t('selectMonth')}</label>
              <select value={paymentMonth} onChange={(e) => setPaymentMonth(Number(e.target.value))}>
                {monthsFull.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <label>{t('uploadPaymentProof')}</label>
              <input type="file" accept="image/*" onChange={(e) => setPaymentFile(e.target.files[0])} />
              <button className="btn primary" onClick={handleUploadPayment} style={{ marginTop: '8px' }}>
                <Upload size={16} />
                {t('submitProof')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowExpenseModal(false)}>
              <X size={18} />
            </button>
            <h3>{t('addExpense')}</h3>
            <div className="expense-form">
              <label>{t('description')}</label>
              <input
                type="text"
                placeholder="Example: Office supplies"
                value={newExpense.desc}
                onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })}
              />
              <label>{t('amount')}</label>
              <input
                type="number"
                placeholder="Example: 10000"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
              <button className="btn primary" onClick={addExpense} style={{ marginTop: '8px' }}>
                <PlusCircle size={16} />
                {t('addExpense')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
          <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowVerificationModal(false)}>
              <X size={20} />
            </button>
            <h3>{t('paymentVerification')}</h3>
            <div className="verification-list">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="verification-item">
                  <div className="verification-info">
                    <strong>{payment.memberName}</strong>
                    <span>{payment.bulan} — Rp {parseInt(payment.jumlah).toLocaleString('en-US')}</span>
                  </div>
                  {payment.bukti && (
                    <a href={payment.bukti} target="_blank" rel="noopener noreferrer" className="btn-view">
                      <Eye size={14} />
                      {t('viewProof')}
                    </a>
                  )}
                  <div className="verification-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleVerifyPayment(payment.id, 'diterima')}
                    >
                      <Check size={14} />
                      {t('accept')}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleVerifyPayment(payment.id, 'ditolak')}
                    >
                      <XCircle size={14} />
                      {t('reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
