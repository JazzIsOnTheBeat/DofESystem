import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import { AuthContext } from '../context/AuthProvider';
import { ToastContext } from '../context/ToastContext';
import { Eye, EyeOff, Lock, KeyRound, ShieldAlert } from 'lucide-react';
import '../styles/login.css'; // Reusing login styles for consistency

export default function ChangePassword() {
    const [password, setPassword] = useState('');
    const [confPass, setConfPass] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { logout } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const navigate = useNavigate();

    // Real-time criteria checking
    const checks = {
        length: password.length >= 8,
        alphanumeric: /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password),
        noSpecial: /^[a-zA-Z0-9]*$/.test(password)
    };

    const isPasswordValid = checks.length && checks.alphanumeric && checks.noSpecial;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confPass) {
            setError("Passwords do not match");
            return;
        }

        if (password === 'abcd') {
            setError("Please choose a password other than the default 'abcd'");
            return;
        }

        setLoading(true);
        try {
            await axiosPrivate.patch('/NewPass', { password, confPass });

            // Update local storage flag
            localStorage.removeItem('isDefaultPass');

            showToast('Password updated successfully! Please login again with your new password.', 'success');

            // Force logout to ensure all tokens are fresh and user knows their new pass works
            await logout();
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.msg || 'Failed to update password';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-panel" style={{ margin: 'auto', maxWidth: '450px', width: '90%' }}>
                <form className="panel-card" onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div className="brand-lg" style={{ margin: '0 auto 16px' }}>
                            <Lock size={32} />
                        </div>
                        <h2 className="panel-title">Secure Your Account</h2>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>
                            For your safety, please change your default password before continuing.
                        </p>
                    </div>

                    <div className="password-criteria" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--theme-text-muted)', fontWeight: '600', marginBottom: '12px' }}>
                            <ShieldAlert size={16} />
                            <span style={{ fontSize: '0.85rem' }}>Password Requirements:</span>
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.85rem' }}>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: checks.length ? '#4ade80' : 'var(--theme-text-muted)',
                                marginBottom: '6px',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: checks.length ? '#4ade80' : 'rgba(255,255,255,0.2)'
                                }} />
                                At least 8 characters long
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: checks.alphanumeric ? '#4ade80' : 'var(--theme-text-muted)',
                                marginBottom: '6px',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: checks.alphanumeric ? '#4ade80' : 'rgba(255,255,255,0.2)'
                                }} />
                                Both letters and numbers
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: checks.noSpecial ? (password.length > 0 ? '#4ade80' : 'var(--theme-text-muted)') : '#ff6b6b',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: checks.noSpecial ? (password.length > 0 ? '#4ade80' : 'rgba(255,255,255,0.2)') : '#ff6b6b'
                                }} />
                                No special characters
                            </li>
                        </ul>
                    </div>

                    {error && (
                        <div style={{
                            color: '#ff6b6b',
                            fontSize: '0.85rem',
                            marginBottom: '16px',
                            textAlign: 'center',
                            padding: '8px',
                            background: 'rgba(255, 107, 107, 0.05)',
                            borderRadius: '4px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="field-label">New Password</label>
                        <div className="input-with-action">
                            <input
                                className="field-input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter 8+ alphanumeric characters"
                                required
                            />
                            <button type="button" className="show-pass" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group" style={{
                        marginTop: '16px',
                        opacity: isPasswordValid ? 1 : 0.6,
                        transition: 'opacity 0.3s ease'
                    }}>
                        <label className="field-label">Confirm New Password</label>
                        <input
                            className="field-input"
                            type={showPassword ? 'text' : 'password'}
                            value={confPass}
                            onChange={(e) => setConfPass(e.target.value)}
                            placeholder={isPasswordValid ? "Confirm your new password" : "Complete requirements first"}
                            required
                            disabled={!isPasswordValid}
                            style={{
                                cursor: isPasswordValid ? 'text' : 'not-allowed',
                                backgroundColor: isPasswordValid ? 'transparent' : 'rgba(255,255,255,0.02)'
                            }}
                        />
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <button className="btn-primary full rounded-full" type="submit" disabled={loading}>
                            <KeyRound size={18} style={{ marginRight: '8px' }} />
                            {loading ? 'Updating...' : 'Update Password & Login'}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => logout().then(() => navigate('/login'))}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--theme-text-muted)',
                            fontSize: '0.85rem',
                            marginTop: '16px',
                            width: '100%',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}
