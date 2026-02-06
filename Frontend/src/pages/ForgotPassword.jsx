import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { ToastContext } from '../context/ToastContext';
import { Mail, ChevronLeft, ArrowRight } from 'lucide-react';
import '../styles/login.css';

export default function ForgotPassword() {
    const [nim, setNim] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useContext(ToastContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/forgot-password', { nim });
            showToast(res.data.msg || 'Reset link sent!', 'success');
            // We don't necessarily navigate away so they can see the message, 
            // or we could go back to login after a delay.
        } catch (err) {
            const msg = err.response?.data?.msg || 'Failed to request reset';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-panel" style={{ margin: 'auto', maxWidth: '450px', width: '90%' }}>
                <form className="panel-card" onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div className="brand-lg" style={{ margin: '0 auto 16px' }}>
                            <Mail size={32} />
                        </div>
                        <h2 className="panel-title">Forgot Password?</h2>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>
                            Enter your NIM and we'll send a password reset link to your student email.
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="field-label" htmlFor="nim">NIM</label>
                        <input
                            className="field-input"
                            id="nim"
                            type="text"
                            value={nim}
                            onChange={(e) => setNim(e.target.value)}
                            placeholder="e.g. 2101010"
                            required
                        />
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <button className="btn-primary full rounded-full" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                            {!loading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
                        </button>
                    </div>

                    <Link
                        to="/login"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            color: 'var(--theme-text-muted)',
                            fontSize: '0.85rem',
                            marginTop: '24px',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        <ChevronLeft size={16} />
                        Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
}
