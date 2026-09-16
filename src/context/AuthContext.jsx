"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

const DEMO_STAFF = {
  id: 'u1',
  email: 'staff@shop.com',
  name: 'Chidi (Staff)',
  role: 'staff'
};

const DEMO_OWNER = {
  id: 'u2',
  email: 'owner@shop.com',
  name: 'Alhaji Musa (Owner)',
  role: 'owner'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return DEMO_STAFF;
    const saved = localStorage.getItem('shop_active_user');
    return saved ? JSON.parse(saved) : DEMO_STAFF; // Default to Staff logged in for quick testing
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('shop_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shop_active_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Extract metadata role or default based on email
        const isOwnerEmail = email.toLowerCase().includes('owner');
        const loggedUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || (isOwnerEmail ? 'Owner Account' : 'Staff Account'),
          role: data.user.user_metadata?.role || (isOwnerEmail ? 'owner' : 'staff')
        };
        setUser(loggedUser);
        return { success: true };
      } else {
        // Local auth validation
        const normalized = email.trim().toLowerCase();
        if (normalized.includes('owner')) {
          setUser(DEMO_OWNER);
        } else {
          setUser(DEMO_STAFF);
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoStaff = () => {
    setUser(DEMO_STAFF);
  };

  const loginAsDemoOwner = () => {
    setUser(DEMO_OWNER);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginAsDemoStaff,
      loginAsDemoOwner,
      logout,
      isStaff: user?.role === 'staff',
      isOwner: user?.role === 'owner'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
