import React from 'react'
import '../styles/cards.css'
export default function MemberCard({ name, role }) {
	const initials = (name || '')
		.split(' ')
		.map(n => n[0])
		.filter(Boolean)
		.slice(0,2)
		.join('')
		.toUpperCase()

	return (
		<div className="member-card">
			<div className="member-avatar" aria-hidden>{initials}</div>
			<div className="member-info">
				<div className="member-name">{name}</div>
				{role && <div className="member-role">{role}</div>}
			</div>
		</div>
	)
}
