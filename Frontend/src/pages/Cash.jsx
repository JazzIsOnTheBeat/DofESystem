import React, { useEffect, useMemo, useState, useContext, useCallback, memo } from 'react'
import '../styles/cash.css'
import { useLanguage } from '../context/LanguageContext'
import {
  CircleCheckBig,
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
  Users,
  ChevronDown,
  ExternalLink,
  Search
} from 'lucide-react'
import { axiosPrivate } from '../api/axios'
import { AuthContext } from '../context/AuthProvider'
import { ToastContext } from '../context/ToastContext'

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

const LeaderboardItem = memo(function LeaderboardItem({ member, rank, paidCount }) {
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
            <CircleCheckBig size={10} />
            {paidCount} months
          </span>
          <span className="payment-amount">
            Rp {(paidCount * 10000).toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </li>
  )
})

const PaymentTableCell = memo(function PaymentTableCell({
  monthIdx,
  paymentData,
  memberName,
  currentMonthIdx,
  userRole,
  onToggle
}) {
  const status = paymentData ? paymentData.status : null;
  const isPending = status === 'pending';
  const isPaid = status === 'diterima';
  const isRejected = status === 'ditolak';
  const isCurrentMonth = monthIdx === currentMonthIdx;

  let tooltip = `${memberName} — ${monthsFull[monthIdx]}`;
  if (isPending) tooltip += " (Waiting Verification)";
  if (isPaid) tooltip += " (Paid)";
  if (isRejected) tooltip += " (Rejected)";

  return (
    <td className={isCurrentMonth ? 'current-month-cell' : ''}>
      <div
        className={`chk-wrap ${(['bendahara', 'ketua', 'sekretaris', 'wakilketua'].includes(userRole?.toLowerCase())) ? 'cursor-pointer' : ''}`}
        onClick={() => onToggle(monthIdx)}
        title={tooltip}
      >
        {isPaid ? (
          <CircleCheckBig size={26} className="status-icon paid" />
        ) : isPending ? (
          <MinusCircle size={26} className="status-icon pending" />
        ) : isRejected ? (
          <XCircle size={26} className="status-icon rejected" />
        ) : (
          <div className="chk-circle"></div>
        )}
      </div>
    </td>
  );
});

const PaymentTableRow = memo(function PaymentTableRow({
  member,
  payments,
  currentMonthIdx,
  userRole,
  onToggle
}) {
  const userPayments = useMemo(() => payments || new Map(), [payments]);

  return (
    <tr className={['bendahara', 'ketua', 'sekretaris', 'wakilketua'].includes(member.role?.toLowerCase()) ? 'row-bendahara' : ''}>
      <td>
        <div className="member-name">
          <div className="member-avatar">{String(member.nama || '')[0] || '?'}</div>
          <div className="member-info">
            <div className="member-main">
              <span className="name-text">{member.nama}</span>
              {['bendahara', 'ketua', 'sekretaris', 'wakilketua'].includes(member.role?.toLowerCase()) && (
                <span className="badge accent-1">
                  <p>
                    {member.role === 'ketua' ? 'Chairman' :
                      member.role === 'sekretaris' ? 'Secretary' :
                        member.role === 'wakilKetua' ? 'Vice Chairman' :
                          'Treasurer'}
                  </p>
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      {months.map((mm, monthIdx) => (
        <PaymentTableCell
          key={mm}
          monthIdx={monthIdx}
          paymentData={userPayments.get(monthIdx)}
          memberName={member.nama}
          currentMonthIdx={currentMonthIdx}
          userRole={userRole}
          onToggle={(idx) => onToggle(member, idx)}
        />
      ))}
    </tr>
  );
});

export default function Cash() {
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState({})
  const [pendingPayments, setPendingPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [searchQuery, setSearchQuery] = useState('')


  // Modals
  const [showQris, setShowQris] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [activeProofUrl, setActiveProofUrl] = useState('')

  // Forms
  const [newExpense, setNewExpense] = useState({ amount: '', desc: '' })
  const [selectedMember, setSelectedMember] = useState(null)
  const [paymentFile, setPaymentFile] = useState(null)
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth())
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const { accessToken, isLoading: authLoading } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

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

    const normalizedRole = userRole?.toLowerCase();
    const authorizedRoles = ['bendahara', 'ketua', 'sekretaris', 'wakilketua'];
    const kasEndpoint = authorizedRoles.includes(normalizedRole) ? '/kas/staff' : '/kas/my';

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

      // Process expenses
      setExpenses(expenseRes.data.map(e => ({
        id: e.id,
        desc: e.deskripsi,
        amount: e.jumlah,
        tanggal: e.tanggal,
        user: e.user?.nama || 'Unknown'
      })));

      // Process summary
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

  const handleUploadPayment = useCallback(async () => {
    if (!paymentFile) {
      showToast("Please select payment proof!", "warning");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("jumlah", MONTHLY_FEE);
    formData.append("bulan", monthsFull[paymentMonth]);
    formData.append("bukti", paymentFile);

    try {
      await axiosPrivate.post('/kas', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToast("Payment proof submitted successfully! Waiting for Treasurer confirmation.", "success");
      setShowQris(false);
      setPaymentFile(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to submit payment proof.", "error");
    } finally {
      setIsUploading(false);
    }
  }, [paymentFile, userId, paymentMonth, loadData, showToast]);

  const handleVerifyPayment = useCallback(async (id, status) => {
    try {
      await axiosPrivate.patch(`/kas/bendahara/${id}`, {
        Status: status,
        catatan: status === 'diterima' ? 'Paid' : 'Invalid proof'
      });
      showToast(`Payment ${status === 'diterima' ? 'accepted' : 'rejected'} successfully!`, "success");
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to process verification.", "error");
    }
  }, [loadData, showToast]);

  const totalIncome = summary.totalIncome;
  const totalExpenses = summary.totalExpense;
  const balance = summary.balance;

  const addExpense = useCallback(async () => {
    const amt = Number(newExpense.amount) || 0
    if (!amt || !newExpense.desc) {
      alert('Amount and description are required');
      return;
    }

    try {
      await axiosPrivate.post('/pengeluaran', {
        jumlah: amt,
        deskripsi: newExpense.desc
      });
      setNewExpense({ amount: '', desc: '' })
      setShowExpenseModal(false)
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to add expense');
    }
  }, [newExpense, loadData])

  const deleteExpense = useCallback(async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axiosPrivate.delete(`/pengeluaran/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense');
    }
  }, [loadData])

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
    const normalizedRole = userRole?.toLowerCase();
    const authorizedRoles = ['bendahara', 'ketua', 'sekretaris', 'wakilketua'];
    let filtered = members;

    if (!authorizedRoles.includes(normalizedRole)) {
      filtered = members.filter(m => m.id === userId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => (m.nama || '').toLowerCase().includes(q));
    }

    return filtered;
  }, [members, userRole, userId, searchQuery])


  const currentMonthIdx = useMemo(() => new Date().getMonth(), [])

  // Logic for month selection in the payment form
  const monthOptions = useMemo(() => {
    const userPayments = payments[userId] || new Map();
    return monthsFull.map((month, idx) => {
      const paymentData = userPayments.get(idx);
      const isPaid = paymentData?.status === 'diterima';
      const isPending = paymentData?.status === 'pending';
      return {
        index: idx,
        name: month,
        isPaid,
        isPending,
        isDisabled: isPaid || isPending
      };
    });
  }, [payments, userId])

  const firstAvailableMonth = useMemo(() => {
    return monthOptions.find(m => !m.isDisabled)?.index ?? 0;
  }, [monthOptions]);

  // Ensure paymentMonth is valid when modal opens
  useEffect(() => {
    if (showQris) {
      const currentSelected = monthOptions.find(m => m.index === paymentMonth);
      if (!currentSelected || currentSelected.isDisabled) {
        setPaymentMonth(firstAvailableMonth);
      }
    }
  }, [showQris, monthOptions, firstAvailableMonth, paymentMonth])

  const handleManualToggle = useCallback(async (member, monthIdx) => {
    const normalizedRole = userRole?.toLowerCase();
    if (normalizedRole !== 'bendahara') {
      showToast("Hanya Bendahara yang bisa mengubah status pembayaran manual.", "warning");
      return;
    }

    const userPayments = payments[member.id] || new Map();
    const paymentData = userPayments.get(monthIdx);
    const monthName = monthsFull[monthIdx];

    try {
      if (paymentData) {
        if (window.confirm(`Delete payment status for ${member.nama} for ${monthName}?`)) {
          await axiosPrivate.delete(`/kas/staff/${paymentData.id}`);
          setPayments(prev => {
            const newPayments = { ...prev };
            const userMap = new Map(newPayments[member.id] || []);
            userMap.delete(monthIdx);
            newPayments[member.id] = userMap;
            return newPayments;
          });
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
      }
    } catch (error) {
      console.error("Failed to toggle payment", error);
      alert("Failed to change payment status");
    }
  }, [userRole, payments]);

  // Loading state
  if (isLoading) {
    return (
      <section className="cash-page">
        <div className="cash-loading">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="cash-page">
      {/* Header */}
      <div className="cash-header">
        <div className="cash-header-content">
          <h1>
            <Wallet size={28} />
            Cash Fund
          </h1>
          <p>Manage member cash payments and expenses</p>
        </div>
        <div className="cash-actions">
          {['bendahara', 'ketua', 'sekretaris', 'wakilketua'].includes(userRole?.toLowerCase()) && (
            <>
              <button className="btn" onClick={() => setShowExpenseModal(true)}>
                <MinusCircle size={16} />
                Add Expense
              </button>
              <button
                className={`btn ${pendingPayments.length > 0 ? 'primary' : ''}`}
                onClick={() => setShowVerificationModal(true)}
              >
                <AlertCircle size={16} />
                Verification {pendingPayments.length > 0 && `(${pendingPayments.length})`}
              </button>
            </>
          )}
          <button className="btn primary" onClick={() => setShowQris(true)}>
            <QrCode size={16} />
            Pay Cash
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="cash-stats">
        <StatCard
          title="Total Cash In"
          value={totalIncome}
          icon={TrendingUp}
          variant="green"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          icon={TrendingDown}
          variant="red"
          trend="down"
          trendValue="-5%"
        />
        <StatCard
          title="Current Balance"
          value={balance}
          icon={Wallet}
          variant="blue"
        />
      </div>

      {/* Main Content */}
      <div className="cash-main">
        <div className="cash-left">
          {/* Payment Table */}
          <div className="payment-table-card">
            <div className="table-header">
              <h3>
                <Users size={18} />
                Payment List
              </h3>
              {userRole?.toLowerCase() === 'bendahara' && (
                <div className="members-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="members-search-input"
                  />
                </div>
              )}

            </div>

            <div className="table-wrap">
              <table className="kas-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    {months.map((m, i) => (
                      <th key={m} title={monthsFull[i]} className={i === currentMonthIdx ? 'current-month' : ''}>
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((m) => (
                    <PaymentTableRow
                      key={m.id}
                      member={m}
                      payments={payments[m.id]}
                      currentMonthIdx={currentMonthIdx}
                      userRole={userRole}
                      onToggle={handleManualToggle}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense List */}
          {['bendahara', 'ketua', 'sekretaris', 'wakilketua'].includes(userRole?.toLowerCase()) && expenses.length > 0 && (
            <div className="expense-section">
              <h3 className="section-title">
                <Receipt size={18} />
                Expense List
              </h3>
              <div className="expense-list">
                {expenses.map((exp) => (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-info">
                      <span className="expense-desc">{exp.desc}</span>
                      <span className="expense-meta">
                        {new Date(exp.tanggal).toLocaleDateString('en-US')} • {exp.user}
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

        {/* Sidebar - Leaderboard */}
        <div className="cash-right">
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <Trophy size={18} className="trophy-icon" />
              <h3>Leaderboard</h3>
            </div>
            <p className="leaderboard-subtitle">Top 5 members with most payments</p>
            <ul className="leaderboard-list">
              {leaderboard.map((m, idx) => (
                <LeaderboardItem
                  key={m.id}
                  member={m}
                  rank={idx + 1}
                  paidCount={m.paid}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* QRIS Modal */}
      {showQris && (
        <div className="modal-overlay" onClick={() => setShowQris(false)}>
          <div className="modal-content qris-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQris(false)}>
              <X size={18} />
            </button>
            <h3>Cash Payment</h3>
            <div className="qris-image">
              <QrCode size={120} />
              <p>Scan QRIS to pay</p>
            </div>
            <div className="payment-form">
              <label>Select Month:</label>
              <div className="custom-month-select">
                <div
                  className={`select-trigger ${isMonthSelectOpen ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMonthSelectOpen(!isMonthSelectOpen);
                  }}
                >
                  <span>{monthOptions[paymentMonth]?.name || 'Select Month'}</span>
                  <ChevronDown size={18} className={`chevron ${isMonthSelectOpen ? 'up' : ''}`} />
                </div>

                {isMonthSelectOpen && (
                  <div className="select-dropdown glass-effect">
                    {monthOptions.map((m) => (
                      <div
                        key={m.index}
                        className={`select-option ${m.isDisabled ? 'disabled' : ''} ${paymentMonth === m.index ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!m.isDisabled) {
                            setPaymentMonth(m.index);
                            setIsMonthSelectOpen(false);
                          }
                        }}
                      >
                        <div className="option-content">
                          <span className="month-name">{m.name}</span>
                          {m.isPaid && (
                            <div className="status-badge paid">
                              <CircleCheckBig size={14} />
                              <span>Paid</span>
                            </div>
                          )}
                          {m.isPending && (
                            <div className="status-badge pending">
                              <MinusCircle size={14} />
                              <span>Pending</span>
                            </div>
                          )}
                        </div>
                        {paymentMonth === m.index && !m.isDisabled && (
                          <div className="selected-indicator"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label>Upload Payment Proof:</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentFile(e.target.files[0])}
                  disabled={!monthOptions.some(m => !m.isDisabled)}
                />
              </div>

              <button
                className="btn primary submit-payment-btn"
                onClick={handleUploadPayment}
                style={{ marginTop: '16px', width: '100%' }}
                disabled={isUploading || !monthOptions.some(m => !m.isDisabled)}
              >
                {isUploading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Submit Proof
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {
        showExpenseModal && (
          <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowExpenseModal(false)}>
                <X size={18} />
              </button>
              <h3>Add Expense</h3>
              <div className="expense-form">
                <label>Description:</label>
                <input
                  type="text"
                  placeholder="Example: Office supplies"
                  value={newExpense.desc}
                  onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })}
                />
                <label>Amount (Rp):</label>
                <input
                  type="number"
                  placeholder="Example: 10000"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
                <button className="btn primary" onClick={addExpense} style={{ marginTop: '8px' }}>
                  <PlusCircle size={16} />
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Verification Modal */}
      {
        showVerificationModal && (
          <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
            <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowVerificationModal(false)}>
                <X size={20} />
              </button>
              <h3>Payment Verification</h3>
              <div className="verification-list">
                {pendingPayments.length === 0 ? (
                  <div className="empty-verification">
                    <Receipt size={40} />
                    <p>No pending payments to verify</p>
                    <span>All submitted proofs have been processed.</span>
                  </div>
                ) : (
                  pendingPayments.map((payment) => (
                    <div key={payment.id} className="verification-item">
                      <div className="verification-info">
                        <strong>{payment.user?.nama || 'Unknown Member'}</strong>
                        <span>{payment.bulan} — Rp {parseInt(payment.jumlah || 0).toLocaleString('en-US')}</span>
                      </div>
                      {payment.bukti && (
                        <button
                          className="btn-view"
                          onClick={() => {
                            setActiveProofUrl(payment.bukti);
                            setShowProofModal(true);
                          }}
                        >
                          <Eye size={14} />
                          View Proof
                        </button>
                      )}
                      {userRole?.toLowerCase() === 'bendahara' && (
                        <div className="verification-actions">
                          <button
                            className="btn-accept"
                            onClick={() => handleVerifyPayment(payment.id, 'diterima')}
                          >
                            <Check size={14} />
                            Accept
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleVerifyPayment(payment.id, 'ditolak')}
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Proof Preview Modal */}
      {
        showProofModal && (
          <div className="modal-overlay proof-overlay" onClick={() => setShowProofModal(false)}>
            <div className="modal-content proof-modal" onClick={(e) => e.stopPropagation()}>
              <div className="proof-container">
                <button className="modal-close" onClick={() => setShowProofModal(false)}>
                  <X size={20} />
                </button>
                <img src={activeProofUrl} alt="Payment Proof" className="proof-image" />
                <div className="proof-actions-overlay">
                  <a href={activeProofUrl} target="_blank" rel="noopener noreferrer" className="btn primary">
                    <ExternalLink size={16} />
                    Open Original
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </section >
  );
}
