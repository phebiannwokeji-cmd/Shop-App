"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, ShieldCheck, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, loginAsDemoStaff, loginAsDemoOwner, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#022c22',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '1rem'
          }}>
            <Store size={36} />
          </div>
          <h1 className="title-lg">Shop Record Book</h1>
          <p className="subtitle" style={{ marginTop: '0.25rem' }}>
            Trust from a distance • Immutable activity ledger
          </p>
        </div>

        {/* Main Login Card */}
        <div className="glass-card">
          <h2 className="title-md" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            Sign In to Your Account
          </h2>

          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <span>Email Address</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="staff@shop.com or owner@shop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 0.75rem' }}>OR DEMO ONE-CLICK LOGIN</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          {/* Quick Demo Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={loginAsDemoStaff}
              className="btn btn-secondary btn-full flex-between"
              style={{ padding: '0.85rem 1rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}
            >
              <div className="flex-gap-2">
                <UserCheck size={18} style={{ color: '#93c5fd' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Login as Staff</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enter sales, expenses & customer debts</div>
                </div>
              </div>
              <span className="badge badge-staff">Staff</span>
            </button>

            <button
              onClick={loginAsDemoOwner}
              className="btn btn-secondary btn-full flex-between"
              style={{ padding: '0.85rem 1rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}
            >
              <div className="flex-gap-2">
                <ShieldCheck size={18} style={{ color: '#c4b5fd' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Login as Owner</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Read-only dashboard, audit log & totals</div>
                </div>
              </div>
              <span className="badge badge-owner">Owner</span>
            </button>
          </div>
        </div>

        {/* Footnote */}
        <p className="subtitle" style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem' }}>
          🔒 Immutable ledger enabled • Every entry is logged with timestamp & staff ID
        </p>

      </div>
    </div>
  );
};
