import React, { useEffect, useState } from 'react'
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
    <section>
      <h2>Anggota</h2>
      {loading && <p>Memuat anggota...</p>}
      {error && <p className="error">{error}</p>}
      <div className="members-grid">
        {members && members.map((m) => (
          <MemberCard key={m.id} name={m.nama} role={m.role} />
        ))}
      </div>
    </section>
  )
}

export default Members
