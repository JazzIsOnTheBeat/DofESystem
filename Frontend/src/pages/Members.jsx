import React, { useEffect, useState } from 'react'
import { Users, Loader2, AlertCircle } from 'lucide-react'
import MemberCard from '../components/cards'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch('http://localhost:3000/users', { headers, credentials: 'include' })
        if (!res.ok) {
          if (res.status === 401) throw new Error('Unauthorized. Silakan login.')
          throw new Error('Failed to fetch')
        }
        const data = await res.json()
        setMembers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  return (
    <section className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">
            <Users className="page-icon" size={28} />
            Anggota
          </h2>
          <p className="page-subtitle">Daftar anggota DofE ST Bhinneka</p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={32} />
          <span>Memuat anggota...</span>
        </div>
      )}

      {error && (
        <div className="error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="members-grid">
        {members && members.map((m) => (
          <MemberCard key={m.id} name={m.nama} role={m.role} />
        ))}
      </div>
    </section>
  )
}

export default Members
