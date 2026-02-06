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
import { useLanguage } from '../context/LanguageContext';
import '../styles/members.css';

const roleConfig = {
  ketua: { icon: Crown, labelKey: 'chairman', color: 'gold' },
  wakilKetua: { icon: Shield, labelKey: 'viceChairman', color: 'silver' },
  sekretaris: { icon: BookOpen, labelKey: 'secretary', color: 'blue' },
  bendahara: { icon: Briefcase, labelKey: 'treasurer', color: 'green' },
  admin: { icon: Shield, labelKey: 'admin', color: 'red' },
  anggota: { icon: User, labelKey: 'member', color: 'default' }
};

const MemberCard = memo(function MemberCard({ member, isCurrentUser, isPengurus, onEdit, onDelete, t }) {
  const config = roleConfig[member.role] || roleConfig.anggota;
  const RoleIcon = config.icon;
  
  return (
    <div className={`member-card ${config.color} ${isCurrentUser ? 'current-user' : ''}`}>
      {isCurrentUser && (
        <div className="current-user-badge">
          <UserCheck size={12} />
          {t('you')}
        </div>
      )}
      {isPengurus && !isCurrentUser && (
        <div className="member-actions">
          <button className="action-btn edit" onClick={() => onEdit(member)} title={t('edit')}>
            <Edit2 size={14} />
          </button>
          <button className="action-btn delete" onClick={() => onDelete(member)} title={t('delete')}>
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
          <span>{t(config.labelKey)}</span>
        </div>
      </div>
      <div className="member-details">
        {member.nim && (
          <div className="member-detail-item">
            <Mail size={14} />
            <span>{member.nim}@satyaterrabhinneka.ac.id</span>
          </div>
        )}
      </div>
    </div>
  );
});

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
  const { t } = useLanguage();

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

  const isPengurus = useMemo(() => {
    const pengurusRoles = ['ketua', 'wakilKetua', 'admin'];
    return pengurusRoles.includes(userRole);
  }, [userRole]);

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

  useEffect(() => {
    const handleFocus = () => {
      if (accessToken && !authLoading) {
        fetchMembers();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [accessToken, authLoading, fetchMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.nim?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, filterRole]);

  const sortedMembers = useMemo(() => {
    const roleOrder = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara', 'anggota'];
    return [...filteredMembers].sort((a, b) => {
      const roleA = roleOrder.indexOf(a.role);
      const roleB = roleOrder.indexOf(b.role);
      if (roleA !== roleB) return roleA - roleB;
      return a.nama?.localeCompare(b.nama) || 0;
    });
  }, [filteredMembers]);

  const stats = useMemo(() => {
    const total = members.length;
    const leadership = members.filter(m => ['ketua', 'wakilKetua'].includes(m.role)).length;
    const anggota = members.filter(m => m.role === 'anggota').length;
    return { total, leadership, anggota };
  }, [members]);

  const handleAdd = useCallback(() => {
    setFormData({ nama: '', nim: '', password: '', confPass: '', role: 'anggota' });
    setFormError('');
    setShowAddModal(true);
  }, []);

  const handleEdit = useCallback((member) => {
    setSelectedMember(member);
    setFormData({ nama: member.nama, nim: member.nim, password: '', confPass: '', role: member.role });
    setFormError('');
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  }, []);

  const submitAdd = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.nama || !formData.nim || !formData.password) {
      setFormError(t('nameNIMPasswordRequired'));
      return;
    }
    
    if (formData.password !== formData.confPass) {
      setFormError(t('passwordMismatch'));
      return;
    }

    setFormLoading(true);
    try {
      const response = await axiosPrivate.post('/register', formData);
      
      const newMember = response.data?.user || {
        id: Date.now(),
        nama: formData.nama,
        nim: formData.nim,
        role: formData.role
      };
      
      setMembers(prev => [...prev, {
        id: newMember.id,
        nama: newMember.nama || formData.nama,
        nim: newMember.nim || formData.nim,
        role: newMember.role || formData.role
      }]);
      
      setShowAddModal(false);
    } catch (err) {
      setFormError(err.response?.data?.msg || t('failedAddMember'));
    } finally {
      setFormLoading(false);
    }
  }, [formData, t]);

  const submitEdit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.nama || !formData.nim) {
      setFormError(t('nameNIMRequired'));
      return;
    }
    
    if (formData.password && formData.password !== formData.confPass) {
      setFormError(t('passwordMismatch'));
      return;
    }

    setFormLoading(true);
    try {
      const updateData = { nama: formData.nama, nim: formData.nim, role: formData.role };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await axiosPrivate.patch(`/users/${selectedMember.id}`, updateData);
      
      setMembers(prev => prev.map(m => 
        m.id === selectedMember.id 
          ? { ...m, nama: formData.nama, nim: formData.nim, role: formData.role }
          : m
      ));
      
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.response?.data?.msg || t('failedUpdateMember'));
    } finally {
      setFormLoading(false);
    }
  }, [formData, selectedMember, t]);

  const submitDelete = useCallback(async () => {
    setFormLoading(true);
    try {
      await axiosPrivate.delete(`/users/${selectedMember.id}`);
      
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
      
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setFormLoading(false);
    }
  }, [selectedMember]);

  if (loading) {
    return (
      <div className="members-page">
        <div className="members-loading">
          <div className="loading-spinner"></div>
          <p>{t('loadingMemberData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="members-page">
      <div className="members-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            {t('memberList')}
          </h1>
          <p className="header-subtitle">{t('manageViewMembers')}</p>
        </div>
        {isPengurus && (
          <button className="add-member-btn" onClick={handleAdd}>
            <Plus size={18} />
            {t('addMember')}
          </button>
        )}
      </div>

      <div className="members-stats">
        <StatsCard icon={Users} label={t('totalMembers')} value={stats.total} color="blue" />
        <StatsCard icon={Crown} label={t('leadership')} value={stats.leadership} color="gold" />
        <StatsCard icon={User} label={t('regularMembers')} value={stats.anggota} color="default" />
      </div>

      <div className="members-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('searchNameNIM')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={16} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">{t('allRoles')}</option>
            <option value="ketua">{t('chairman')}</option>
            <option value="wakilKetua">{t('viceChairman')}</option>
            <option value="sekretaris">{t('secretary')}</option>
            <option value="bendahara">{t('treasurer')}</option>
            <option value="anggota">{t('member')}</option>
          </select>
        </div>
      </div>

      <div className="members-grid">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              isCurrentUser={member.id === currentUserId}
              isPengurus={isPengurus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          ))
        ) : (
          <div className="no-results">
            <Users size={48} />
            <p>{t('noMembersFound')}</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Plus size={20} /> {t('addNewMember')}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitAdd}>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label>{t('fullName')}</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder={t('enterFullName')}
                />
              </div>
              <div className="form-group">
                <label>NIM</label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder={t('enterNIM')}
                />
              </div>
              <div className="form-group">
                <label>{t('role')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="anggota">{t('member')}</option>
                  <option value="admin">{t('admin')}</option>
                  <option value="ketua">{t('chairman')}</option>
                  <option value="wakilKetua">{t('viceChairman')}</option>
                  <option value="sekretaris">{t('secretary')}</option>
                  <option value="bendahara">{t('treasurer')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('password')}</label>
                <div className="input-with-action">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('enterPassword')}
                  />
                  <button type="button" className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>{t('confirmPassword')}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confPass}
                  onChange={(e) => setFormData({ ...formData, confPass: e.target.value })}
                  placeholder={t('confirmPasswordPlaceholder')}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Edit2 size={20} /> {t('editMember')}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEdit}>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label>{t('fullName')}</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder={t('enterFullName')}
                />
              </div>
              <div className="form-group">
                <label>NIM</label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder={t('enterNIM')}
                />
              </div>
              <div className="form-group">
                <label>{t('role')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="anggota">{t('member')}</option>
                  <option value="admin">{t('admin')}</option>
                  <option value="ketua">{t('chairman')}</option>
                  <option value="wakilKetua">{t('viceChairman')}</option>
                  <option value="sekretaris">{t('secretary')}</option>
                  <option value="bendahara">{t('treasurer')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('newPassword')}</label>
                <div className="input-with-action">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('enterNewPassword')}
                  />
                  <button type="button" className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>{t('confirmNewPassword')}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confPass}
                  onChange={(e) => setFormData({ ...formData, confPass: e.target.value })}
                  placeholder={t('confirmNewPasswordPlaceholder')}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Trash2 size={20} /> {t('deleteMember')}</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="delete-confirm">
              <p>{t('confirmDeleteMember')}</p>
              <strong>{selectedMember?.nama}</strong>
              <p className="warning-text">{t('actionCannotBeUndone')}</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                {t('cancel')}
              </button>
              <button type="button" className="btn-danger" onClick={submitDelete} disabled={formLoading}>
                {formLoading ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
