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
        const res = await fetch('http://localhost:3000/users')
        if (!res.ok) throw new Error('Failed to fetch')
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
