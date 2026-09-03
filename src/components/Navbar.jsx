import React from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Store, UserCheck, LogOut, ArrowRightLeft, ShieldCheck, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isStaff, isOwner, loginAsDemoStaff, loginAsDemoOwner } = useAuth();

  if (!user) return null;

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
      <div className="flex-between" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand Logo & Name */}
        <div className="flex-gap-4">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#022c22',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Store size={22} />
          </div>
          <div>
            <h1 className="title-md" style={{ lineHeight: 1.2 }}>Grace & Mercy Store</h1>
            <p className="subtitle" style={{ fontSize: '0.75rem' }}>Shared Record Book & Trust Ledger</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex-gap-4">
          {/* Active Role Badge */}
          <div className="flex-gap-2">
            <span className={`badge ${isOwner ? 'badge-owner' : 'badge-staff'}`}>
              {isOwner ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
              {user.role}
            </span>
            <span className="subtitle" style={{ display: 'none', mdDisplay: 'inline' }}>
              {user.name}
            </span>
          </div>

          {/* Quick Role Switcher for local pair testing (Hidden when Supabase auth is active) */}
          {!isSupabaseConfigured && (
            <button
              onClick={isStaff ? loginAsDemoOwner : loginAsDemoStaff}
              className="btn btn-secondary btn-sm"
              title="Switch view between Staff and Owner for testing"
            >
              <ArrowRightLeft size={14} />
              <span style={{ fontSize: '0.8rem' }}>
                Switch to {isStaff ? 'Owner' : 'Staff'}
              </span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </header>
  );
};
