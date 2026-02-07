import React, { useEffect, useState, memo, useContext, useMemo, useCallback } from 'react';
import { axiosPrivate } from '../api/axios';
import {
  Users,
  Search,
  Crown,
  Shield,
  Briefcase,
  BookOpen,
  User,
  Mail,
  Phone,
  Filter,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthContext } from '../context/AuthProvider';
import '../styles/members.css';

// Role config with icons and colors
const roleConfig = {
  ketua: { icon: Crown, label: 'Chairman', color: 'gold' },
  wakilKetua: { icon: Shield, label: 'Vice Chairman', color: 'silver' },
  sekretaris: { icon: BookOpen, label: 'Secretary', color: 'blue' },
  bendahara: { icon: Briefcase, label: 'Treasurer', color: 'green' },
  anggota: { icon: User, label: 'Member', color: 'default' }
};

// Memoized Member Card
const MemberCard = memo(function MemberCard({ member, isCurrentUser, canManage, onEdit, onDelete }) {
  const config = roleConfig[member.role] || roleConfig.anggota;
  const RoleIcon = config.icon;

  return (
    <div className={`member-card ${config.color} ${isCurrentUser ? 'current-user' : ''}`}>
      {isCurrentUser && (
        <div className="current-user-badge">
          <UserCheck size={12} />
          You
        </div>
      )}
      {canManage && !isCurrentUser && (
        <div className="member-actions">
          <button className="action-btn edit" onClick={() => onEdit(member)} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="action-btn delete" onClick={() => onDelete(member)} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <div className="member-avatar">
        <span>{member.nama ? member.nama.charAt(0).toUpperCase() : '?'}</span>
      </div>
      <div className="member-info">
        <h3 className="member-name">{member.nama}</h3>
        <div className={`member-role ${config.color}`}>
          <RoleIcon size={12} />
          <span>{config.label}</span>
        </div>
      </div>
      <div className="member-details">
        {member.nim && (
          <div className="member-detail-item">
            <Mail size={14} />
            <span>{member.nim}@students.satyaterrabhinneka.ac.id</span>
          </div>
        )}
      </div>
    </div>
  );
});

// Stats Card
const StatsCard = memo(function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`members-stat ${color}`}>
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

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ nama: '', nim: '', password: '', confPass: '', role: 'anggota' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { accessToken, isLoading: authLoading } = useContext(AuthContext);

  // Get current user ID and role from token
  const { currentUserId, userRole } = useMemo(() => {
    if (!accessToken) return { currentUserId: null, userRole: null };
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);
      return { currentUserId: payload.userId, userRole: payload.role };
    } catch { return { currentUserId: null, userRole: null }; }
  }, [accessToken]);

  // Check if user is pengurus
  const isPengurus = useMemo(() => {
    const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
    return pengurusRoles.includes(userRole);
  }, [userRole]);

  // Check if user can manage members (Chairman and Vice Chairman only)
  const canManage = useMemo(() => {
    return ['ketua', 'wakilKetua'].includes(userRole);
  }, [userRole]);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      const response = await axiosPrivate.get('/users');
      setMembers(response.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchMembers();
  }, [accessToken, authLoading, fetchMembers]);

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.nim?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, filterRole]);

  // Sort members: leadership first, then alphabetically
  const sortedMembers = useMemo(() => {
    const roleOrder = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara', 'anggota'];
    return [...filteredMembers].sort((a, b) => {
      const roleA = roleOrder.indexOf(a.role);
      const roleB = roleOrder.indexOf(b.role);
      if (roleA !== roleB) return roleA - roleB;
      return a.nama?.localeCompare(b.nama) || 0;
    });
  }, [filteredMembers]);

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const leadership = members.filter(m => ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'].includes(m.role)).length;
    const anggota = members.filter(m => m.role === 'anggota').length;
    return { total, leadership, anggota };
  }, [members]);

  // Handle Add Member
  const handleAdd = useCallback(() => {
    setFormData({ nama: '', nim: '', password: '', confPass: '', role: 'anggota' });
    setFormError('');
    setShowAddModal(true);
  }, []);

  // Handle Edit Member
  const handleEdit = useCallback((member) => {
    setSelectedMember(member);
    setFormData({ nama: member.nama, nim: member.nim, password: '', confPass: '', role: member.role });
    setFormError('');
    setShowEditModal(true);
  }, []);

  // Handle Delete Member
  const handleDelete = useCallback((member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  }, []);

  // Submit Add Member
  const submitAdd = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nama || !formData.nim || !formData.password) {
      setFormError('Name, NIM, and Password are required');
      return;
    }

    if (formData.password !== formData.confPass) {
      setFormError('Password and Confirm Password do not match');
      return;
    }

    setFormLoading(true);
    try {
      await axiosPrivate.post('/register', formData);
      setShowAddModal(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to add member');
    } finally {
      setFormLoading(false);
    }
  }, [formData, fetchMembers]);

  // Submit Edit Member
  const submitEdit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nama || !formData.nim) {
      setFormError('Name and NIM are required');
      return;
    }

    if (formData.password && formData.password !== formData.confPass) {
      setFormError('Password and Confirm Password do not match');
      return;
    }

    setFormLoading(true);
    try {
      const updateData = { nama: formData.nama, nim: formData.nim, role: formData.role };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await axiosPrivate.patch(`/users/${selectedMember.id}`, updateData);
      setShowEditModal(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to update member');
    } finally {
      setFormLoading(false);
    }
  }, [formData, selectedMember, fetchMembers]);

  // Submit Delete Member
  const submitDelete = useCallback(async () => {
    setFormLoading(true);
    try {
      await axiosPrivate.delete(`/users/${selectedMember.id}`);
      setShowDeleteModal(false);
      fetchMembers();
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setFormLoading(false);
    }
  }, [selectedMember, fetchMembers]);

  if (loading) {
    return (
      <div className="members-page">
        <div className="members-loading">
          <div className="loading-spinner"></div>
          <p>Loading member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="members-page">
      {/* Header */}
      <div className="members-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            Member List
          </h1>
          <p className="header-subtitle">Manage and view all DofE ST Bhinneka members</p>
        </div>
        {canManage && (
          <button className="add-member-btn" onClick={handleAdd}>
            <Plus size={18} />
            Add Member
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="members-stats">
        <StatsCard icon={Users} label="Total Members" value={stats.total} color="blue" />
        <StatsCard icon={Crown} label="Leadership" value={stats.leadership} color="gold" />
        <StatsCard icon={User} label="Regular Members" value={stats.anggota} color="default" />
      </div>

      {/* Search and Filter */}
      <div className="members-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search name or NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={16} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="ketua">Chairman</option>
            <option value="wakilKetua">Vice Chairman</option>
            <option value="sekretaris">Secretary</option>
            <option value="bendahara">Treasurer</option>
            <option value="anggota">Member</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      <div className="members-grid">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUser={member.id === currentUserId}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="no-results">
            <Users size={48} />
            <p>No members found</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Plus size={20} /> Add New Member</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitAdd}>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>NIM</label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Enter NIM"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="anggota">Member</option>
                  <option value="ketua">Chairman</option>
                  <option value="wakilKetua">Vice Chairman</option>
                  <option value="sekretaris">Secretary</option>
                  <option value="bendahara">Treasurer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-action">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <button type="button" className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confPass}
                  onChange={(e) => setFormData({ ...formData, confPass: e.target.value })}
                  placeholder="Confirm password"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Edit2 size={20} /> Edit Member</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEdit}>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>NIM</label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Enter NIM"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="anggota">Member</option>
                  <option value="ketua">Chairman</option>
                  <option value="wakilKetua">Vice Chairman</option>
                  <option value="sekretaris">Secretary</option>
                  <option value="bendahara">Treasurer</option>
                </select>
              </div>
              <div className="form-group">
                <label>New Password (leave empty if not changing)</label>
                <div className="input-with-action">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                  <button type="button" className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confPass}
                  onChange={(e) => setFormData({ ...formData, confPass: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Trash2 size={20} /> Delete Member</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="delete-confirm">
              <p>Are you sure you want to delete member:</p>
              <strong>{selectedMember?.nama}</strong>
              <p className="warning-text">This action cannot be undone!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={submitDelete} disabled={formLoading}>
                {formLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
