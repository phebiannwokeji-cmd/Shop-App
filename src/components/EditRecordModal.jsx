import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ShieldAlert, Save, Trash2, X } from 'lucide-react';

export const EditRecordModal = ({ payload, onClose }) => {
  const { updateRecord, deleteRecord } = useData();
  const { type, record, action } = payload; // type: 'sale'|'expense'|'debt', action: 'EDIT'|'DELETE'

  const [reason, setReason] = useState('');
  
  // Fields for EDIT mode
  const [field1, setField1] = useState(() => {
    if (type === 'sale') return record.quantity;
    if (type === 'expense') return record.description;
    if (type === 'debt') return record.customerName;
    return '';
  });

  const [field2, setField2] = useState(() => {
    if (type === 'sale') return record.paymentMethod;
    if (type === 'expense') return record.amount;
    if (type === 'debt') return record.amountOwed;
    return '';
  });

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (action === 'DELETE') {
      deleteRecord({
        recordType: type,
        recordId: record.id,
        reason
      });
    } else if (action === 'EDIT') {
      let updatedFields = {};
      if (type === 'sale') {
        const qty = parseInt(field1, 10);
        const totalPrice = record.unitPrice * qty;
        updatedFields = { quantity: qty, totalPrice, paymentMethod: field2 };
      } else if (type === 'expense') {
        updatedFields = { description: field1, amount: parseFloat(field2) };
      } else if (type === 'debt') {
        updatedFields = { customerName: field1, amountOwed: parseFloat(field2) };
      }

      updateRecord({
        recordType: type,
        recordId: record.id,
        updatedFields,
        reason
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <h3 className="title-md flex-gap-2">
            <ShieldAlert size={20} style={{ color: action === 'DELETE' ? '#ef4444' : '#f59e0b' }} />
            {action === 'DELETE' ? `Delete ${type.toUpperCase()}` : `Edit ${type.toUpperCase()}`}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Audit Disclaimer Banner */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fcd34d',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          marginBottom: '1.25rem'
        }}>
          🔒 <strong>Audit Notice:</strong> This action will be permanently logged in the owner audit trail with your name, timestamp, and previous values. No silent overwrites allowed.
        </div>

        <form onSubmit={handleConfirm}>
          
          {action === 'EDIT' && (
            <>
              {type === 'sale' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-input"
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </>
              )}

              {type === 'expense' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₦)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-input currency"
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                    />
                  </div>
                </>
              )}

              {type === 'debt' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount Owed (₦)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-input currency"
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* AUDIT REASON FIELD (MANDATORY) */}
          <div className="form-group">
            <label className="form-label">
              <span>Reason for {action === 'DELETE' ? 'Deletion' : 'Edit'}</span>
              <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Required for audit</span>
            </label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder={action === 'DELETE' ? "e.g. Customer cancelled order / accidental duplicate entry" : "e.g. Correcting wrong quantity entered"}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex-between" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className={`btn ${action === 'DELETE' ? 'btn-danger' : 'btn-primary'}`}
              disabled={!reason.trim()}
            >
              {action === 'DELETE' ? <Trash2 size={16} /> : <Save size={16} />}
              {action === 'DELETE' ? 'Confirm Deletion' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
