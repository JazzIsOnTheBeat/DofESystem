import React, { useEffect, useMemo, useState } from 'react'
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
  Medal
} from 'lucide-react'

// Helper: prefer several env variants for frontend (Vite uses import.meta.env)
const API_BASE = (
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && (process.env.API_URL || process.env.REACT_APP_API_URL)) ||
  'http://localhost:3000'
)

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const monthsFull = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const dummyMembers = [
  { id: 1, nama: 'Andi Pratama', role: 'anggota', kasAmount: 250000 },
  { id: 2, nama: 'Budi Santoso', role: 'anggota', kasAmount: 150000 },
  { id: 3, nama: 'Citra Dewi', role: 'bendahara', kasAmount: 600000 },
  { id: 4, nama: 'Dewi Lestari', role: 'anggota', kasAmount: 50000 },
  { id: 5, nama: 'Eka Purnama', role: 'anggota', kasAmount: 120000 },
  { id: 6, nama: 'Fajar Nugroho', role: 'anggota', kasAmount: 90000 },
  { id: 7, nama: 'Gina Maharani', role: 'anggota', kasAmount: 300000 },
  { id: 8, nama: 'Hendra Wijaya', role: 'anggota', kasAmount: 70000 },
  { id: 9, nama: 'Ika Permata', role: 'anggota', kasAmount: 180000 },
  { id: 10, nama: 'Joko Widodo', role: 'anggota', kasAmount: 0 },
]

const dummyPayments = {
  1: new Set([0, 1, 2, 3, 4, 5]),
  2: new Set([0, 1, 2]),
  3: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  4: new Set([0]),
  5: new Set([0, 2, 4]),
  6: new Set([1, 3, 5]),
  7: new Set([0, 1, 2, 3]),
  8: new Set([0, 1]),
  9: new Set([0, 1, 2, 3, 4]),
  10: new Set([]),
}

// Animated Counter Component
function AnimatedValue({ value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const stepValue = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(stepValue * step), value)
      setDisplayValue(current)

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <>{prefix}{displayValue.toLocaleString('id-ID')}{suffix}</>
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, variant, trend, trendValue }) {
  return (
    <div className={`card big ${variant}`}>
      <div className="card-header">
        <div className="card-icon">
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`card-trend ${trend}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="card-title">{title}</div>
      <div className="card-value">
        <AnimatedValue value={value} prefix="Rp " />
      </div>
    </div>
  )
}

// Leaderboard Item Component
function LeaderboardItem({ member, rank, payments }) {
  const paidCount = payments[member.id]?.size || 0

  const getRankIcon = () => {
    if (rank === 1) return <Crown size={16} className="rank-icon gold" />
    if (rank === 2) return <Medal size={16} className="rank-icon silver" />
    if (rank === 3) return <Medal size={16} className="rank-icon bronze" />
    return null
  }

  return (
    <li className="leaderboard-item">
      <div className="rank-badge">
        {getRankIcon() || <span className="rank-number">{rank}</span>}
      </div>
      <div className="avatar">
        {String(member.nama || '')[0]}
      </div>
      <div className="leaderboard-info">
        <strong>{member.nama}</strong>
        <div className="member-meta">
          <span className="payment-count">
            <CheckCircle2 size={12} />
            {paidCount} pembayaran
          </span>
          <span className="payment-amount">
            Rp {(member.kasAmount || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </li>
  )
}

export default function Cash() {
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState({})
  const [expenses, setExpenses] = useState([])
  const [showQris, setShowQris] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newExpense, setNewExpense] = useState({ amount: '', desc: '' })
  const [selectedMember, setSelectedMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const userRole = localStorage.getItem('userRole') || 'bendahara'
  const userId = Number(localStorage.getItem('userId') || 1)

  useEffect(() => {
    let mounted = true

    async function load() {
      setIsLoading(true)

      // Simulate loading delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 300))

      try {
        const res = await fetch(`${API_BASE}/users`, { credentials: 'include' })
        if (!res.ok) throw new Error('no api')
        const data = await res.json()
        if (!mounted) return
        setMembers(data)
      } catch (err) {
        setMembers(dummyMembers)
      }

      try {
        const res2 = await fetch(`${API_BASE}/kas`, { credentials: 'include' })
        if (!res2.ok) throw new Error('no api')
        const data2 = await res2.json()
        const map = {}
        data2.forEach((p) => {
          const id = p.userId
          const idx = months.indexOf((p.bulan || '').substr(0, 3))
          map[id] = map[id] || new Set()
          if (idx >= 0) map[id].add(idx)
        })
        setPayments(map)
      } catch (err) {
        const clone = {}
        Object.keys(dummyPayments).forEach(k => { clone[k] = new Set(dummyPayments[k]) })
        setPayments(clone)
      }

      try {
        const r3 = await fetch(`${API_BASE}/expenses`, { credentials: 'include' })
        if (!r3.ok) throw new Error('no api')
        const ex = await r3.json()
        setExpenses(ex)
      } catch (err) {
        setExpenses([
          { id: 1, desc: 'Beli ATK', amount: 20000 },
          { id: 2, desc: 'Cetak laporan', amount: 50000 },
          { id: 3, desc: 'Konsumsi rapat', amount: 75000 },
        ])
      }

      setIsLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [])

  const togglePayment = (memberId, monthIdx) => {
    setPayments((prev) => {
      const next = { ...prev }
      next[memberId] = next[memberId] ? new Set(next[memberId]) : new Set()
      if (next[memberId].has(monthIdx)) next[memberId].delete(monthIdx)
      else next[memberId].add(monthIdx)
      return next
    })
  }

  // Calculate totals
  const MONTHLY_FEE = 50000 // Iuran per bulan

  const totalIncome = useMemo(() => {
    let total = 0
    Object.values(payments).forEach(s => {
      total += (s.size || 0) * MONTHLY_FEE
    })
    return total
  }, [payments])

  const totalExpenses = useMemo(() =>
    expenses.reduce((a, b) => a + (b.amount || 0), 0),
    [expenses]
  )

  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses])

  const addExpense = () => {
    const amt = Number(newExpense.amount) || 0
    if (!amt) return
    setExpenses((e) => [...e, {
      id: Date.now(),
      desc: newExpense.desc || 'Pengeluaran',
      amount: amt
    }])
    setNewExpense({ amount: '', desc: '' })
    setShowExpenseModal(false)
  }

  const leaderboard = useMemo(() => {
    const rows = (members || []).map(m => ({
      id: m.id,
      nama: m.nama,
      paid: (payments[m.id] ? payments[m.id].size : 0),
      kasAmount: m.kasAmount || 0,
      role: m.role
    }))
    return rows.sort((a, b) => b.paid - a.paid).slice(0, 5)
  }, [members, payments])

  const visibleMembers = useMemo(() => {
    if (userRole === 'bendahara') return members
    return members.filter(m => m.id === userId)
  }, [members, userRole, userId])

  // Get current month for highlighting
  const currentMonth = new Date().getMonth()

  return (
    <section className="cash-page">
      {/* Header */}
      <div className="cash-header">
        <div className="header-content">
          <h2>
            <Wallet className="header-icon" size={28} />
            Manajemen Uang Kas
          </h2>
          <p className="cash-sub">Kelola pembayaran dan pengeluaran kas kelas</p>
        </div>
        <div className="cash-actions">
          <button className="btn" onClick={() => setShowQris(true)}>
            <QrCode size={18} />
            QRIS Payment
          </button>
          <button className="btn primary" onClick={() => setShowExpenseModal(true)}>
            <PlusCircle size={18} />
            Tambah Pengeluaran
          </button>
        </div>
      </div>

      <div className="cash-grid">
        {/* Left Content */}
        <div className="cash-left">
          {/* Stats Cards */}
          <div className="cards-row">
            <StatCard
              title="Total Pemasukan"
              value={totalIncome}
              icon={TrendingUp}
              variant="total-income"
              trend="up"
              trendValue="+12%"
            />
            <StatCard
              title="Total Pengeluaran"
              value={totalExpenses}
              icon={TrendingDown}
              variant="total-expense"
              trend="down"
              trendValue="-5%"
            />
            <StatCard
              title="Saldo Tersedia"
              value={balance}
              icon={Wallet}
              variant="balance"
            />
          </div>

          {/* Payment Table */}
          <div className="table-wrap">
            <table className="kas-table">
              <thead>
                <tr>
                  <th>Anggota</th>
                  {months.map((m, i) => (
                    <th
                      key={m}
                      title={monthsFull[i]}
                      className={i === currentMonth ? 'current-month' : ''}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={m.role === 'bendahara' ? 'row-bendahara' : ''}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td>
                      <div
                        className="member-name"
                        tabIndex={0}
                        onClick={() => setSelectedMember(m)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setSelectedMember(m) }}
                        role="button"
                        aria-label={`Lihat detail ${m.nama}`}
                      >
                        <div className="member-avatar">
                          {String(m.nama || '')[0] || '?'}
                        </div>
                        <div className="member-info">
                          <div className="member-main">
                            {m.nama}
                            {m.role === 'bendahara' && (
                              <span className="badge accent-1">
                                <Sparkles size={10} />
                                Bendahara
                              </span>
                            )}
                          </div>
                          <div className="member-meta">
                            <span className="payment-stat">
                              <CheckCircle2 size={12} />
                              {payments[m.id]?.size || 0} pembayaran
                            </span>
                            <span className="divider">•</span>
                            <span>Rp {(m.kasAmount || 0).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {months.map((mm, idx) => {
                      const paidSet = payments[m.id] || new Set()
                      const checked = paidSet.has(idx)
                      const canEdit = userRole === 'bendahara' || m.id === userId
                      const tooltip = `${m.nama} — ${monthsFull[idx]}`
                      const isCurrentMonth = idx === currentMonth

                      return (
                        <td key={mm} className={isCurrentMonth ? 'current-month-cell' : ''}>
                          <label className="chk-wrap">
                            <input
                              className="chk-input"
                              type="checkbox"
                              checked={checked}
                              disabled={!canEdit}
                              onChange={() => togglePayment(m.id, idx)}
                              aria-label={`${m.nama} ${monthsFull[idx]} pembayaran`}
                            />
                            <span
                              className={`chk-circle ${checked ? 'checked' : ''} ${!canEdit ? 'disabled' : ''}`}
                              data-tooltip={tooltip}
                            />
                          </label>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="cash-right">
          {/* Leaderboard */}
          <div className="card leaderboard-card">
            <div className="card-title">
              <Trophy size={16} />
              Top Pembayar
            </div>
            <ol className="leaderboard">
              {leaderboard.map((l, idx) => (
                <LeaderboardItem
                  key={l.id}
                  member={l}
                  rank={idx + 1}
                  payments={payments}
                />
              ))}
            </ol>
          </div>

          {/* Expense Summary */}
          <div className="card expenses-card">
            <div className="card-title">
              <Receipt size={16} />
              Riwayat Pengeluaran
            </div>
            <ul className="expense-list">
              {expenses.map((ex, idx) => (
                <li key={ex.id} className="expense-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="expense-info">
                    <span className="expense-icon">
                      <AlertCircle size={14} />
                    </span>
                    <span className="expense-desc">{ex.desc}</span>
                  </div>
                  <span className="expense-amount">
                    - Rp {Number(ex.amount).toLocaleString('id-ID')}
                  </span>
                </li>
              ))}
            </ul>
            <div className="expense-total">
              <span>Total Pengeluaran</span>
              <strong>Rp {totalExpenses.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* QRIS Modal */}
      {showQris && (
        <div className="modal" role="dialog" aria-label="QRIS Gopay Merchant" onClick={() => setShowQris(false)}>
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQris(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h3>
              <QrCode size={24} />
              QRIS Payment
            </h3>
            <p className="modal-subtitle">Scan kode QR untuk melakukan pembayaran</p>
            <div className="qris-box">
              <div className="qris-graphic">
                <div className="qr-placeholder">
                  <QrCode size={60} />
                  <span>QR Code</span>
                </div>
              </div>
              <div className="qris-info">
                <div className="qris-detail">
                  <span className="label">Merchant</span>
                  <span className="value">DofE ST Bhinneka</span>
                </div>
                <div className="qris-detail">
                  <span className="label">Gopay ID</span>
                  <span className="value">0123456789</span>
                </div>
                <div className="qris-detail">
                  <span className="label">Nominal</span>
                  <span className="value highlight">Rp 50.000</span>
                </div>
                <div className="qris-note">
                  <AlertCircle size={14} />
                  <span>Ini adalah demo. Ganti dengan QR code merchant Anda.</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowQris(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="modal" role="dialog" aria-label="Member detail" onClick={() => setSelectedMember(null)}>
          <div className="modal-inner member-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMember(null)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="member-modal-header">
              <div className="member-avatar large">
                {String(selectedMember.nama || '')[0]}
              </div>
              <div className="member-modal-info">
                <h3>{selectedMember.nama}</h3>
                <span className={`role-badge ${selectedMember.role}`}>
                  {selectedMember.role === 'bendahara' ? (
                    <><Sparkles size={12} /> Bendahara</>
                  ) : (
                    'Anggota'
                  )}
                </span>
              </div>
            </div>
            <div className="member-stats">
              <div className="stat-item">
                <span className="stat-label">Total Pembayaran</span>
                <span className="stat-value">
                  {payments[selectedMember.id]?.size || 0} bulan
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Kontribusi</span>
                <span className="stat-value">
                  Rp {((payments[selectedMember.id]?.size || 0) * MONTHLY_FEE).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Bulan Belum Bayar</span>
                <span className="stat-value warning">
                  {12 - (payments[selectedMember.id]?.size || 0)} bulan
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setSelectedMember(null)}>Tutup</button>
              <button className="btn primary">Kirim Reminder</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal" role="dialog" aria-label="Tambah Pengeluaran" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowExpenseModal(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h3>
              <PlusCircle size={24} />
              Tambah Pengeluaran
            </h3>
            <p className="modal-subtitle">Catat pengeluaran kas baru</p>
            <div className="form-group">
              <label htmlFor="expense-desc">Deskripsi</label>
              <input
                id="expense-desc"
                type="text"
                placeholder="Masukkan deskripsi pengeluaran..."
                value={newExpense.desc}
                onChange={(e) => setNewExpense(s => ({ ...s, desc: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="expense-amount">Jumlah (Rp)</label>
              <input
                id="expense-amount"
                type="number"
                placeholder="Masukkan jumlah..."
                value={newExpense.amount}
                onChange={(e) => setNewExpense(s => ({ ...s, amount: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowExpenseModal(false)}>Batal</button>
              <button className="btn primary" onClick={addExpense}>
                <CheckCircle2 size={16} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
