import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Package, AlertTriangle, Plus, CheckCircle, RefreshCw } from 'lucide-react';

export const InventoryView = () => {
  const { products, globalLowStockThreshold, addProduct, updateProductStock } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState('');

  const [msg, setMsg] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductStock) return;

    addProduct({
      name: newProductName,
      price: newProductPrice,
      stock: newProductStock
    });

    setMsg(`Added product "${newProductName}" with initial stock of ${newProductStock}!`);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductStock('');
    setShowAddModal(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleSaveStock = (productId) => {
    updateProductStock(productId, tempStockValue);
    setEditingStockId(null);
    setMsg('Product stock count updated!');
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Info Card */}
      <div className="glass-card flex-between">
        <div>
          <h2 className="title-md flex-gap-2">
            <Package size={20} style={{ color: 'var(--primary)' }} />
            Product Inventory & Fixed Price List
          </h2>
          <p className="subtitle" style={{ marginTop: '0.25rem' }}>
            Single global low-stock threshold: <strong style={{ color: '#f59e0b' }}>{globalLowStockThreshold} units</strong>
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {msg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#6ee7b7',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={16} inline style={{ marginRight: '0.5rem' }} />
          {msg}
        </div>
      )}

      {/* Product Table Card */}
      <div className="glass-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Fixed Price (₦)</th>
                <th>Current Stock</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const isLowStock = p.stock > 0 && p.stock < globalLowStockThreshold;
                const isOutOfStock = p.stock === 0;

                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="currency" style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      ₦{p.price.toLocaleString()}
                    </td>
                    <td>
                      {editingStockId === p.id ? (
                        <div className="flex-gap-2">
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value)}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveStock(p.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingStockId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="currency" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                          {p.stock} units
                        </span>
                      )}
                    </td>
                    <td>
                      {isOutOfStock && (
                        <span className="badge badge-out-of-stock">
                          <AlertTriangle size={12} /> OUT OF STOCK
                        </span>
                      )}
                      {isLowStock && (
                        <span className="badge badge-low-stock">
                          <AlertTriangle size={12} /> LOW STOCK (&lt; {globalLowStockThreshold})
                        </span>
                      )}
                      {!isOutOfStock && !isLowStock && (
                        <span className="badge badge-paid">
                          STOCKED
                        </span>
                      )}
                    </td>
                    <td>
                      {editingStockId !== p.id && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingStockId(p.id);
                            setTempStockValue(p.stock);
                          }}
                        >
                          <RefreshCw size={12} /> Adjust Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Product */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="title-md" style={{ marginBottom: '1rem' }}>Add Product to Fixed Price List</h3>
            
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Bag of Flour (50kg)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fixed Selling Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  className="form-input"
                  placeholder="e.g. 65000"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Starting Stock Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  placeholder="e.g. 20"
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                />
              </div>

              <div className="flex-between" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
