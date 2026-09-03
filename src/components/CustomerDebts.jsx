import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, PlusCircle, CheckCircle, Clock, Phone, Check, Edit2, Trash2 } from 'lucide-react';

export const CustomerDebts = ({ onEditRecord }) => {
  const { customerDebts, addDebt, markDebtPaid } = useData();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountOwed, setAmountOwed] = useState('');

  const [activeTab, setActiveTab] = useState('unpaid'); // 'unpaid' or 'paid'
  const [msg, setMsg] = useState(null);

  // Unpaid debts sorted OLDEST FIRST (ascending date created)
  const unpaidDebts = [...customerDebts]
    .filter(d => d.status === 'unpaid')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Paid debts sorted NEWEST FIRST
  const paidDebts = [...customerDebts]
    .filter(d => d.status === 'paid')
    .sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));

  const totalUnpaidAmount = unpaidDebts.reduce((sum, d) => sum + d.amountOwed, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg(null);

    const amt = parseFloat(amountOwed);
    if (!customerName || !customerPhone || isNaN(amt) || amt <= 0) return;

    addDebt({
      customerName,
      customerPhone,
      amountOwed: amt
    });

    setMsg(`Recorded debt of ₦${amt.toLocaleString()} for ${customerName}`);
    setCustomerName('');
    setCustomerPhone('');
    setAmountOwed('');

    setTimeout(() => setMsg(null), 4000);
  };

  const handleMarkPaid = (debt) => {
    markDebtPaid(debt.id);
    setMsg(`Marked debt for ${debt.customerName} (₦${debt.amountOwed.toLocaleString()}) as PAID!`);
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="grid-2">
      
      {/* 1. RECORD DEBT FORM */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 className="title-md flex-gap-2">
              <Users size={20} style={{ color: '#ef4444' }} />
              Record Customer Debt
            </h2>
            <p className="subtitle">Log credit sales & unpaid customer balances</p>
          </div>
          <span className="badge badge-staff">Staff Entry</span>
        </div>

        {msg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle size={16} inline style={{ marginRight: '0.5rem' }} />
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Mama Blessing, Baba Tunde"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Phone Number</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="e.g. 08031234567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amount Owed (₦)</label>
            <input
              type="number"
              min="1"
              step="100"
              required
              className="form-input currency"
              placeholder="e.g. 25000"
              value={amountOwed}
              onChange={(e) => setAmountOwed(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
          >
            <PlusCircle size={18} />
            Save Debt Record
          </button>
        </form>

        {/* Total Unpaid Summary Box */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Outstanding Unpaid Debt</div>
            <div className="currency" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fca5a5' }}>
              ₦{totalUnpaidAmount.toLocaleString()}
            </div>
          </div>
          <span className="badge badge-unpaid">{unpaidDebts.length} Customers</span>
        </div>
      </div>

      {/* 2. DEBTS LIST (OLDEST FIRST) */}
      <div className="glass-card">
        
        {/* Tab Toggle */}
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div className="flex-gap-2">
            <button
              className={`btn btn-sm ${activeTab === 'unpaid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('unpaid')}
            >
              Unpaid ({unpaidDebts.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'paid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('paid')}
            >
              Paid History ({paidDebts.length})
            </button>
          </div>
          <span className="subtitle" style={{ fontSize: '0.75rem' }}>
            {activeTab === 'unpaid' ? 'Oldest unpaid debts first' : 'Recent paid debts'}
          </span>
        </div>

        {/* Unpaid Debts List */}
        {activeTab === 'unpaid' && (
          <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>Customer</th>
                  <th>Amount Owed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidDebts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No unpaid customer debts! All clear.
                    </td>
                  </tr>
                ) : (
                  unpaidDebts.map(d => {
                    const daysAgo = Math.floor((Date.now() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
                    const isAging = daysAgo >= 7;

                    return (
                      <tr key={d.id}>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} style={{ color: isAging ? '#f59e0b' : 'var(--text-muted)' }} />
                            {new Date(d.createdAt).toLocaleDateString()}
                          </div>
                          {isAging && (
                            <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                              {daysAgo} days ago (Aging)
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{d.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={10} /> {d.customerPhone}
                          </div>
                        </td>
                        <td className="currency" style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1rem' }}>
                          ₦{d.amountOwed.toLocaleString()}
                        </td>
                        <td>
                          <div className="flex-gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                              onClick={() => handleMarkPaid(d)}
                              title="Mark this customer debt as paid"
                            >
                              <Check size={14} /> Mark Paid
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.4rem' }}
                              onClick={() => onEditRecord({ type: 'debt', record: d, action: 'EDIT' })}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.25rem 0.4rem' }}
                              onClick={() => onEditRecord({ type: 'debt', record: d, action: 'DELETE' })}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paid Debts History */}
        {activeTab === 'paid' && (
          <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paid Date</th>
                  <th>Customer</th>
                  <th>Amount Paid</th>
                  <th>Collected By</th>
                </tr>
              </thead>
              <tbody>
                {paidDebts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No paid debts history found.
                    </td>
                  </tr>
                ) : (
                  paidDebts.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(d.paidAt || d.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.customerPhone}</div>
                      </td>
                      <td className="currency" style={{ color: '#6ee7b7', fontWeight: 600 }}>
                        ₦{d.amountOwed.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span className="badge badge-paid">
                          <Check size={12} /> {d.paidByName || 'Staff'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
