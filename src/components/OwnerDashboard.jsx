import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, 
  Clock, ShieldCheck, ShieldAlert, Activity, Eye, Banknote, Landmark, CreditCard, BellOff, Layers
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { isOwner } = useAuth();
  const { 
    products, 
    sales, 
    expenses, 
    customerDebts, 
    auditLogs, 
    backgroundEvents, 
    globalLowStockThreshold 
  } = useData();

  const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'all'
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'audit', 'events'
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  if (!isOwner) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: '#ef4444'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h2 className="title-md" style={{ color: '#fca5a5' }}>Access Restricted</h2>
        <p className="subtitle" style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>
          The Owner Remote Control Center, KPIs, and Audit Records are restricted to Owner accounts. Staff members are limited to operational record entry (Sales, Inventory, Expenses, and Debts).
        </p>
      </div>
    );
  }

  // Helper: Filter records by selected period
  const filterByPeriod = (records, dateField = 'createdAt') => {
    const now = new Date();
    return records.filter(r => {
      const date = new Date(r[dateField]);
      if (period === 'today') {
        return date.toDateString() === now.toDateString();
      }
      if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= oneWeekAgo;
      }
      if (period === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  };

  const filteredSales = filterByPeriod(sales);
  const filteredExpenses = filterByPeriod(expenses);

  // Calculations
  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netMargin = totalSalesAmount - totalExpenseAmount;

  // Breakdown by Payment Method (Sales)
  const salesByCash = filteredSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalPrice, 0);
  const salesByTransfer = filteredSales.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.totalPrice, 0);
  const salesByCard = filteredSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.totalPrice, 0);

  // Breakdown by Payment Method (Expenses)
  const expenseByCash = filteredExpenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);
  const expenseByTransfer = filteredExpenses.filter(e => e.paymentMethod === 'transfer').reduce((sum, e) => sum + e.amount, 0);
  const expenseByCard = filteredExpenses.filter(e => e.paymentMethod === 'card').reduce((sum, e) => sum + e.amount, 0);

  // Low Stock Items (stock < global threshold)
  const lowStockItems = products.filter(p => p.stock < globalLowStockThreshold);

  // Unpaid Debts (Oldest First)
  const unpaidDebts = [...customerDebts]
    .filter(d => d.status === 'unpaid')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  const totalUnpaidAmount = unpaidDebts.reduce((sum, d) => sum + d.amountOwed, 0);

  // Recent Activity Feed (Combined Sales, Expenses, Debts)
  const combinedActivity = [
    ...sales.map(s => ({ ...s, activityType: 'sale', timestamp: s.createdAt })),
    ...expenses.map(e => ({ ...e, activityType: 'expense', timestamp: e.createdAt })),
    ...customerDebts.map(d => ({ ...d, activityType: 'debt', timestamp: d.createdAt }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TOP CONTROL BAR */}
      <div className="glass-card flex-between">
        <div>
          <h2 className="title-md flex-gap-2">
            <ShieldCheck size={22} style={{ color: 'var(--accent-purple)' }} />
            Owner Remote Control Center
          </h2>
          <p className="subtitle">Real-time visibility • Full auditability • No gatekeeping</p>
        </div>

        {/* Date Filter & View Tabs */}
        <div className="flex-gap-4">
          
          {/* Period Pills */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#0f172a', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            <button
              className={`btn btn-sm ${period === 'today' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('today')}
            >
              Today
            </button>
            <button
              className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('week')}
            >
              This Week
            </button>
            <button
              className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('month')}
            >
              This Month
            </button>
            <button
              className={`btn btn-sm ${period === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
          </div>

        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          <Layers size={16} /> Overview & Analytics
        </button>
        <button
          className={`tab-btn ${activeSection === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSection('audit')}
        >
          <Activity size={16} /> Audit Trail & Record Edits ({auditLogs.length})
        </button>
        <button
          className={`tab-btn ${activeSection === 'events' ? 'active' : ''}`}
          onClick={() => setActiveSection('events')}
        >
          <BellOff size={16} /> Silent Background Event Logs ({backgroundEvents.length})
        </button>
      </div>

      {/* SECTION 1: OVERVIEW & ANALYTICS */}
      {activeSection === 'overview' && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid-4">
            
            {/* Total Sales */}
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="subtitle" style={{ fontSize: '0.8rem' }}>Total Sales ({period})</span>
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="currency" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
                ₦{totalSalesAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {filteredSales.length} sales transactions
              </div>
            </div>

            {/* Total Expenses */}
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="subtitle" style={{ fontSize: '0.8rem' }}>Total Expenses ({period})</span>
                <TrendingDown size={18} style={{ color: '#fca5a5' }} />
              </div>
              <div className="currency" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fca5a5' }}>
                ₦{totalExpenseAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {filteredExpenses.length} expense entries
              </div>
            </div>

            {/* Net Position */}
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="subtitle" style={{ fontSize: '0.8rem' }}>Net Cash Margin</span>
                <DollarSign size={18} style={{ color: netMargin >= 0 ? '#93c5fd' : '#fca5a5' }} />
              </div>
              <div className="currency" style={{ fontSize: '1.6rem', fontWeight: 700, color: netMargin >= 0 ? '#93c5fd' : '#fca5a5' }}>
                ₦{netMargin.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Sales minus Expenses
              </div>
            </div>

            {/* Customer Debts */}
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="subtitle" style={{ fontSize: '0.8rem' }}>Outstanding Debts</span>
                <Users size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div className="currency" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fcd34d' }}>
                ₦{totalUnpaidAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {unpaidDebts.length} customers owing
              </div>
            </div>

          </div>

          {/* Payment Method Breakdown */}
          <div className="grid-2">
            
            {/* Sales Channel Breakdown */}
            <div className="glass-card">
              <h3 className="title-md" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                Sales Breakdown by Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                <div className="flex-between" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-gap-2">
                    <Banknote size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 500 }}>Cash Sales</span>
                  </div>
                  <div className="currency" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ₦{salesByCash.toLocaleString()}
                  </div>
                </div>

                <div className="flex-between" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-gap-2">
                    <Landmark size={18} style={{ color: '#93c5fd' }} />
                    <span style={{ fontWeight: 500 }}>Bank Transfers</span>
                  </div>
                  <div className="currency" style={{ fontWeight: 700, color: '#93c5fd' }}>
                    ₦{salesByTransfer.toLocaleString()}
                  </div>
                </div>

                <div className="flex-between" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(168, 85, 247, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-gap-2">
                    <CreditCard size={18} style={{ color: '#e9d5ff' }} />
                    <span style={{ fontWeight: 500 }}>POS / Card Payments</span>
                  </div>
                  <div className="currency" style={{ fontWeight: 700, color: '#e9d5ff' }}>
                    ₦{salesByCard.toLocaleString()}
                  </div>
                </div>

              </div>
            </div>

            {/* Expenses Channel Breakdown */}
            <div className="glass-card">
              <h3 className="title-md" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                Expenses Breakdown by Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                <div className="flex-between" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-gap-2">
                    <Banknote size={18} style={{ color: '#fca5a5' }} />
                    <span style={{ fontWeight: 500 }}>Cash Expenses</span>
                  </div>
                  <div className="currency" style={{ fontWeight: 700, color: '#fca5a5' }}>
                    ₦{expenseByCash.toLocaleString()}
                  </div>
                </div>

                <div className="flex-between" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-gap-2">
                    <Landmark size={18} style={{ color: '#93c5fd' }} />
                    <span style={{ fontWeight: 500 }}>Transfer Expenses</span>
                  </div>
                  <div className="currency" style={{ fontWeight: 700, color: '#93c5fd' }}>
                    ₦{expenseByTransfer.toLocaleString()}
                  </div>
                </div>

                <div className="flex-between" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(168, 85, 247, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-gap-2">
                    <CreditCard size={18} style={{ color: '#e9d5ff' }} />
                    <span style={{ fontWeight: 500 }}>Card Expenses</span>
                  </div>
                  <div className="currency" style={{ fontWeight: 700, color: '#e9d5ff' }}>
                    ₦{expenseByCard.toLocaleString()}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Tables Grid: Low Stock & Unpaid Debts */}
          <div className="grid-2">
            
            {/* Low Stock Flagged Items Table */}
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 className="title-md flex-gap-2" style={{ fontSize: '1.1rem' }}>
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                  Low Stock Flagged Items ({lowStockItems.length})
                </h3>
                <span className="subtitle" style={{ fontSize: '0.75rem' }}>Threshold: &lt; {globalLowStockThreshold}</span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Fixed Price</th>
                      <th>Current Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          No products below low stock threshold.
                        </td>
                      </tr>
                    ) : (
                      lowStockItems.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td className="currency">₦{p.price.toLocaleString()}</td>
                          <td>
                            <span className="badge badge-low-stock">
                              {p.stock} units left
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unpaid Customer Debts Table (Oldest First) */}
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 className="title-md flex-gap-2" style={{ fontSize: '1.1rem' }}>
                  <Clock size={18} style={{ color: '#ef4444' }} />
                  Unpaid Customer Debts (Oldest First)
                </h3>
                <span className="subtitle" style={{ fontSize: '0.75rem' }}>{unpaidDebts.length} outstanding</span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>Customer & Phone</th>
                      <th>Amount Owed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidDebts.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          No customer debts recorded.
                        </td>
                      </tr>
                    ) : (
                      unpaidDebts.map(d => {
                        const daysAgo = Math.floor((Date.now() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={d.id}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {new Date(d.createdAt).toLocaleDateString()}
                              <div style={{ color: daysAgo >= 7 ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.7rem' }}>
                                {daysAgo} days ago
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{d.customerName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.customerPhone}</div>
                            </td>
                            <td className="currency" style={{ color: '#fca5a5', fontWeight: 700 }}>
                              ₦{d.amountOwed.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Recent Activity Feed across Sales, Expenses, Debts */}
          <div className="glass-card">
            <h3 className="title-md" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              Real-Time Shop Activity Feed
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {combinedActivity.map(act => (
                <div key={act.id} className="flex-between" style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div className="flex-gap-4">
                    <span className={`badge ${
                      act.activityType === 'sale' ? 'badge-staff' :
                      act.activityType === 'expense' ? 'badge-unpaid' : 'badge-low-stock'
                    }`}>
                      {act.activityType.toUpperCase()}
                    </span>

                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {act.activityType === 'sale' && `${act.quantity}x ${act.productName} (₦${act.totalPrice.toLocaleString()})`}
                        {act.activityType === 'expense' && `${act.description} (₦${act.amount.toLocaleString()})`}
                        {act.activityType === 'debt' && `Debt owed by ${act.customerName} (₦${act.amountOwed.toLocaleString()})`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Entered by {act.enteredByName} via {act.paymentMethod || 'Debt Entry'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: AUDIT TRAIL & RECORD EDIT HISTORY */}
      {activeSection === 'audit' && (
        <div className="glass-card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 className="title-md flex-gap-2">
                <Activity size={20} style={{ color: 'var(--accent-purple)' }} />
                Immutable Audit Log & Modifications
              </h3>
              <p className="subtitle">Every edit and delete preserves full historical values</p>
            </div>
            <span className="badge badge-owner">{auditLogs.length} audit entries</span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Record Type</th>
                  <th>Performed By</th>
                  <th>Audit Detail / Reason</th>
                  <th>Inspect Diff</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No edits or modifications recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          log.action === 'CREATED' ? 'badge-staff' :
                          log.action === 'EDITED' ? 'badge-low-stock' :
                          log.action === 'DELETED' ? 'badge-out-of-stock' : 'badge-paid'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {log.recordType}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {log.performedByName} <span className="subtitle">({log.performedByRole})</span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {log.newData?.editedReason || log.newData?.reason || log.newData?.productName || log.newData?.description || 'Standard Entry'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedAuditLog(log)}
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: SILENT BACKGROUND EVENT LOGS */}
      {activeSection === 'events' && (
        <div className="glass-card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 className="title-md flex-gap-2">
                <BellOff size={20} style={{ color: 'var(--primary)' }} />
                Quiet Background Event Storage
              </h3>
              <p className="subtitle">Automatically logged without disturbing shop staff or sending alerts</p>
            </div>
            <span className="badge badge-staff">{backgroundEvents.length} events logged</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {backgroundEvents.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No background events logged yet.
              </p>
            ) : (
              backgroundEvents.map(ev => (
                <div key={ev.id} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div className="flex-gap-4">
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: 
                        ev.eventType === 'low_stock' ? 'rgba(245, 158, 11, 0.15)' :
                        ev.eventType === 'large_expense' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color:
                        ev.eventType === 'low_stock' ? '#fcd34d' :
                        ev.eventType === 'large_expense' ? '#fca5a5' : '#93c5fd'
                    }}>
                      <AlertTriangle size={20} />
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {ev.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(ev.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* INSPECT AUDIT LOG MODAL */}
      {selectedAuditLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 className="title-md" style={{ marginBottom: '1rem' }}>
              Audit Snapshot: {selectedAuditLog.recordType.toUpperCase()} ({selectedAuditLog.action})
            </h3>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Performed by <strong>{selectedAuditLog.performedByName}</strong> at {new Date(selectedAuditLog.timestamp).toLocaleString()}
            </div>

            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  PREVIOUS STATE (BEFORE)
                </h4>
                <pre style={{
                  backgroundColor: '#0f172a',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#fca5a5',
                  overflowX: 'auto',
                  border: '1px solid var(--border-color)'
                }}>
                  {JSON.stringify(selectedAuditLog.previousData, null, 2) || 'null (New Creation)'}
                </pre>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  NEW STATE (AFTER)
                </h4>
                <pre style={{
                  backgroundColor: '#0f172a',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#6ee7b7',
                  overflowX: 'auto',
                  border: '1px solid var(--border-color)'
                }}>
                  {JSON.stringify(selectedAuditLog.newData, null, 2)}
                </pre>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-full"
              onClick={() => setSelectedAuditLog(null)}
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
