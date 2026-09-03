import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingBag, PlusCircle, CheckCircle, AlertTriangle, CreditCard, Banknote, Landmark, History, Edit2, Trash2 } from 'lucide-react';

export const SalesEntry = ({ onEditRecord }) => {
  const { products, sales, addSale } = useData();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Selected product details
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const calculatedTotal = selectedProduct ? selectedProduct.price * Math.max(1, quantity) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setErrorMsg(null);

    if (!selectedProductId) {
      setErrorMsg('Please select a product from the list');
      return;
    }

    if (!selectedProduct) {
      setErrorMsg('Invalid product selection');
      return;
    }

    if (selectedProduct.stock < quantity) {
      setErrorMsg(`Not enough stock! Available: ${selectedProduct.stock} units`);
      return;
    }

    try {
      const sale = addSale({
        productId: selectedProductId,
        quantity,
        paymentMethod
      });

      setFeedbackMsg(`Recorded sale of ${quantity}x ${selectedProduct.name} for ₦${calculatedTotal.toLocaleString()}! Stock updated.`);
      
      // Reset form fields
      setSelectedProductId('');
      setQuantity(1);
      setPaymentMethod('cash');

      // Auto dismiss success toast
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record sale');
    }
  };

  return (
    <div className="grid-2">
      
      {/* 1. SALES ENTRY FORM */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 className="title-md flex-gap-2">
              <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
              Record New Sale
            </h2>
            <p className="subtitle">Fixed prices • Automatic stock reduction</p>
          </div>
          <span className="badge badge-staff">Staff Entry</span>
        </div>

        {feedbackMsg && (
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
            <span>{feedbackMsg}</span>
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
          
          {/* FIELD 1: PRODUCT DROPDOWN */}
          <div className="form-group">
            <label className="form-label">
              <span>Select Product</span>
              {selectedProduct && (
                <span className="subtitle" style={{ fontSize: '0.8rem' }}>
                  In Stock: <strong style={{ color: selectedProduct.stock < 10 ? '#f59e0b' : 'var(--text-primary)' }}>{selectedProduct.stock}</strong>
                </span>
              )}
            </label>
            <select
              className="form-select"
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- Select a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} — ₦{p.price.toLocaleString()} {p.stock === 0 ? '(OUT OF STOCK)' : `(${p.stock} left)`}
                </option>
              ))}
            </select>
          </div>

          {/* FIELD 2: QUANTITY & TOTAL PREVIEW */}
          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedProduct ? selectedProduct.stock : 999}
                required
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Total Amount</label>
              <div className="form-input currency" style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                ₦{calculatedTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* FIELD 3: PAYMENT METHOD */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
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

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
            disabled={!selectedProductId || (selectedProduct && selectedProduct.stock === 0)}
          >
            <PlusCircle size={18} />
            Save & Record Sale (₦{calculatedTotal.toLocaleString()})
          </button>
        </form>
      </div>

      {/* 2. RECENT SALES LIST */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2 className="title-md flex-gap-2">
            <History size={18} style={{ color: 'var(--text-secondary)' }} />
            Recent Sales Log
          </h2>
          <span className="subtitle">{sales.length} entries</span>
        </div>

        <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Item & Qty</th>
                <th>Payment</th>
                <th>Total</th>
                <th>By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.quantity} units @ ₦{s.unitPrice.toLocaleString()}</div>
                    </td>
                    <td>
                      <span className={`payment-pill payment-${s.paymentMethod}`}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="currency" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      ₦{s.totalPrice.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.enteredByName}
                    </td>
                    <td>
                      <div className="flex-gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          title="Edit Sale (Recorded in audit trail)"
                          onClick={() => onEditRecord({ type: 'sale', record: s, action: 'EDIT' })}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          title="Delete Sale (Recorded in audit trail)"
                          onClick={() => onEditRecord({ type: 'sale', record: s, action: 'DELETE' })}
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
