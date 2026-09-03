import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { SalesEntry } from './components/SalesEntry';
import { InventoryView } from './components/InventoryView';
import { ExpenseEntry } from './components/ExpenseEntry';
import { CustomerDebts } from './components/CustomerDebts';
import { OwnerDashboard } from './components/OwnerDashboard';
import { EditRecordModal } from './components/EditRecordModal';
import { ShoppingBag, Package, Wallet, Users, LayoutDashboard } from 'lucide-react';

const MainAppContent = () => {
  const { user, isStaff, isOwner } = useAuth();
  
  // Default tab based on role: Staff defaults to Sales, Owner defaults to Dashboard
  const [activeTab, setActiveTab] = useState(isOwner ? 'dashboard' : 'sales');
  
  // Edit modal state
  const [editPayload, setEditPayload] = useState(null);

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="app-container" style={{ flex: 1, paddingTop: 0 }}>
        
        {/* Navigation Tabs Bar */}
        <div className="tabs-nav">
          
          {/* OWNER DASHBOARD TAB */}
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            {isOwner ? 'Owner Dashboard' : 'Owner View Preview'}
          </button>

          {/* SALES ENTRY TAB (Staff view) */}
          <button
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <ShoppingBag size={16} />
            Sales Entry
          </button>

          {/* INVENTORY TAB */}
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={16} />
            Inventory & Prices
          </button>

          {/* EXPENSES TAB */}
          <button
            className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <Wallet size={16} />
            Expenses
          </button>

          {/* CUSTOMER DEBTS TAB */}
          <button
            className={`tab-btn ${activeTab === 'debts' ? 'active' : ''}`}
            onClick={() => setActiveTab('debts')}
          >
            <Users size={16} />
            Customer Debts
          </button>

        </div>

        {/* Tab Content Display */}
        {activeTab === 'dashboard' && <OwnerDashboard />}
        {activeTab === 'sales' && <SalesEntry onEditRecord={(payload) => setEditPayload(payload)} />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'expenses' && <ExpenseEntry onEditRecord={(payload) => setEditPayload(payload)} />}
        {activeTab === 'debts' && <CustomerDebts onEditRecord={(payload) => setEditPayload(payload)} />}

      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        marginTop: '2rem'
      }}>
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
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
