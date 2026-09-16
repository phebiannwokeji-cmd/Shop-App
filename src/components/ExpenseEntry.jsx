"use client";

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Wallet, PlusCircle, CheckCircle, AlertTriangle, CreditCard, Banknote, Landmark, Edit2, Trash2 } from 'lucide-react';

export const ExpenseEntry = ({ onEditRecord }) => {
  const { expenses, addExpense } = useData();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [msg, setMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg(null);
    setErrorMsg(null);

    const amtNum = parseFloat(amount);
    if (!description || isNaN(amtNum) || amtNum <= 0) {
      setErrorMsg('Please enter a valid description and amount');
      return;
    }

    try {
      addExpense({
        description,
        amount: amtNum,
        paymentMethod
      });

      setMsg(`Recorded expense: "${description}" for ₦${amtNum.toLocaleString()}`);
      setDescription('');
      setAmount('');
      setPaymentMethod('cash');

      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record expense');
    }
  };

  return (
    <div className="grid-2">
      
      {/* 1. EXPENSE FORM */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 className="title-md flex-gap-2">
              <Wallet size={20} style={{ color: '#f59e0b' }} />
              Record Shop Expense
            </h2>
            <p className="subtitle">Track shop expenditure by payment channel</p>
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
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} />
            <span>{msg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Fuel for generator, Shop sweeping fee, Repairs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amount Spent (₦)</label>
            <input
              type="number"
              min="1"
              step="100"
              required
              className="form-input currency"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method Used</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              
              <button
                type="button"
                className={`btn ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={16} /> Cash
              </button>

              <button
                type="button"
                className={`btn ${paymentMethod === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}
                onClick={() => setPaymentMethod('transfer')}
              >
                <Landmark size={16} /> Transfer
              </button>

              <button
                type="button"
                className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={16} /> Card
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
          >
            <PlusCircle size={18} />
            Save Expense Record
          </button>
        </form>
      </div>

      {/* 2. RECENT EXPENSES TABLE */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2 className="title-md">Recent Expenses Log</h2>
          <span className="subtitle">{expenses.length} entries</span>
        </div>

        <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Description</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No expenses recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.description}</td>
                    <td>
                      <span className={`payment-pill payment-${e.paymentMethod}`}>
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td className="currency" style={{ color: '#fca5a5', fontWeight: 600 }}>
                      -₦{e.amount.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {e.enteredByName}
                    </td>
                    <td>
                      <div className="flex-gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          title="Edit Expense"
                          onClick={() => onEditRecord({ type: 'expense', record: e, action: 'EDIT' })}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          title="Delete Expense"
                          onClick={() => onEditRecord({ type: 'expense', record: e, action: 'DELETE' })}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
