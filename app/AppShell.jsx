"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../src/context/AuthContext';
import { Navbar } from '../src/components/Navbar';
import { Login } from '../src/components/Login';
import { EditRecordModal } from '../src/components/EditRecordModal';
import { ShoppingBag, Package, Wallet, Users, LayoutDashboard } from 'lucide-react';

const EditModalContext = createContext({
  setEditPayload: () => {},
  editPayload: null,
});

export const useEditModal = () => useContext(EditModalContext);

export function AppShell({ children }) {
  const { user, isOwner } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [editPayload, setEditPayload] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Role Access Guard: ensure staff cannot remain on or switch to owner dashboard
  useEffect(() => {
    if (mounted && user && !isOwner && pathname === '/') {
      router.replace('/sales');
    }
  }, [mounted, user, isOwner, pathname, router]);

  if (!mounted) {
    return null;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <EditModalContext.Provider value={{ editPayload, setEditPayload }}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main className="app-container" style={{ flex: 1, paddingTop: 0 }}>
          {/* Navigation Tabs Bar */}
          <div className="tabs-nav">
            {/* OWNER DASHBOARD TAB (Visible only to Owner) */}
            {isOwner && (
              <Link
                href="/"
                className={`tab-btn ${pathname === '/' ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                Owner Dashboard
              </Link>
            )}

            {/* SALES ENTRY TAB */}
            <Link
              href="/sales"
              className={`tab-btn ${pathname === '/sales' ? 'active' : ''}`}
            >
              <ShoppingBag size={16} />
              Sales Entry
            </Link>

            {/* INVENTORY TAB */}
            <Link
              href="/inventory"
              className={`tab-btn ${pathname === '/inventory' ? 'active' : ''}`}
            >
              <Package size={16} />
              Inventory & Prices
            </Link>

            {/* EXPENSES TAB */}
            <Link
              href="/expenses"
              className={`tab-btn ${pathname === '/expenses' ? 'active' : ''}`}
            >
              <Wallet size={16} />
              Expenses
            </Link>

            {/* CUSTOMER DEBTS TAB */}
            <Link
              href="/debts"
              className={`tab-btn ${pathname === '/debts' ? 'active' : ''}`}
            >
              <Users size={16} />
              Customer Debts
            </Link>
          </div>

          {/* Page Content */}
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            marginTop: '2rem'
          }}
        >
          Grace & Mercy Store • Shared Record Book & Ledger • Single Currency (NGN ₦)
        </footer>

        {/* Edit / Delete Modal with Audit Trail logging */}
        {editPayload && (
          <EditRecordModal
            payload={editPayload}
            onClose={() => setEditPayload(null)}
          />
        )}
      </div>
    </EditModalContext.Provider>
  );
}
