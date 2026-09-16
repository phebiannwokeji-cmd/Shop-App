"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredData, saveStoredData } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState(() => getStoredData());

  // Auto-persist changes to local storage
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Periodic silent check for aging debts (> 7 days unpaid)
  useEffect(() => {
    const checkAging = () => {
      const now = new Date();
      const thresholdDays = data.agingDebtDaysThreshold || 7;
      
      const unpaidAging = data.customerDebts.filter(debt => {
        if (debt.status !== 'unpaid' || debt.isDeleted) return false;
        const createdDate = new Date(debt.createdAt);
        const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
        return diffDays >= thresholdDays;
      });

      // Find any aging debts that haven't been logged in backgroundEvents yet
      const newEvents = [];
      unpaidAging.forEach(debt => {
        const alreadyLogged = data.backgroundEvents.some(
          ev => ev.eventType === 'aging_debt' && ev.metadata?.debtId === debt.id
        );

        if (!alreadyLogged) {
          const createdDate = new Date(debt.createdAt);
          const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
          newEvents.push({
            id: 'bg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            eventType: 'aging_debt',
            title: 'Customer Debt Exceeded Threshold',
            description: `Debt of ₦${debt.amountOwed.toLocaleString()} owed by ${debt.customerName} (${debt.customerPhone}) has been unpaid for ${diffDays} days.`,
            metadata: { debtId: debt.id, customerName: debt.customerName, amount: debt.amountOwed, daysUnpaid: diffDays },
            createdAt: new Date().toISOString()
          });
        }
      });

      if (newEvents.length > 0) {
        setData(prev => ({
          ...prev,
          backgroundEvents: [...newEvents, ...prev.backgroundEvents]
        }));
      }
    };

    checkAging();
    const interval = setInterval(checkAging, 60000); // check every minute
    return () => clearInterval(interval);
  }, [data.customerDebts, data.backgroundEvents, data.agingDebtDaysThreshold]);

  // Helper to log immutable audit entries
  const logAudit = useCallback((recordType, recordId, action, previousData, newData) => {
    const auditEntry = {
      id: 'al_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      recordType,
      recordId,
      action,
      performedByName: user?.name || 'Staff User',
      performedByRole: user?.role || 'staff',
      previousData,
      newData,
      timestamp: new Date().toISOString()
    };

    return auditEntry;
  }, [user]);

  // 1. SALES ENTRY (Reduces stock, checks low stock event)
  const addSale = ({ productId, quantity, paymentMethod }) => {
    const product = data.products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }

    const qty = parseInt(quantity, 10);
    const unitPrice = product.price;
    const totalPrice = unitPrice * qty;
    const newStock = product.stock - qty;

    const newSale = {
      id: 's_' + Date.now(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice,
      totalPrice,
      paymentMethod,
      enteredById: user?.id || 'u1',
      enteredByName: user?.name || 'Chidi (Staff)',
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    // Stock update for product
    const updatedProducts = data.products.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    );

    // Audit log
    const audit = logAudit('sale', newSale.id, 'CREATED', null, {
      productName: product.name,
      quantity: qty,
      totalPrice,
      paymentMethod
    });

    // Quiet Event Logging if stock dropped below threshold
    let newBgEvents = [...data.backgroundEvents];
    if (newStock < data.globalLowStockThreshold) {
      newBgEvents.unshift({
        id: 'bg_' + Date.now(),
        eventType: 'low_stock',
        title: 'Low Stock Level Reached',
        description: `${product.name} stock decreased to ${newStock} units (global threshold: ${data.globalLowStockThreshold}).`,
        metadata: { productId: product.id, productName: product.name, newStock, threshold: data.globalLowStockThreshold },
        createdAt: new Date().toISOString()
      });
    }

    setData(prev => ({
      ...prev,
      products: updatedProducts,
      sales: [newSale, ...prev.sales],
      auditLogs: [audit, ...prev.auditLogs],
      backgroundEvents: newBgEvents
    }));

    return newSale;
  };

  // 2. EXPENSE ENTRY (Checks large expense event)
  const addExpense = ({ description, amount, paymentMethod }) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) throw new Error('Invalid expense amount');

    const newExpense = {
      id: 'e_' + Date.now(),
      description,
      amount: amt,
      paymentMethod,
      enteredById: user?.id || 'u1',
      enteredByName: user?.name || 'Chidi (Staff)',
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    const audit = logAudit('expense', newExpense.id, 'CREATED', null, {
      description,
      amount: amt,
      paymentMethod
    });

    // Quiet Event Logging for large expenses (> ₦50,000)
    let newBgEvents = [...data.backgroundEvents];
    if (amt >= data.largeExpenseThreshold) {
      newBgEvents.unshift({
        id: 'bg_' + Date.now(),
        eventType: 'large_expense',
        title: 'Unusually Large Expense Logged',
        description: `An expense of ₦${amt.toLocaleString()} for "${description}" was recorded by ${user?.name || 'Staff'}.`,
        metadata: { expenseId: newExpense.id, amount: amt, description, enteredBy: user?.name },
        createdAt: new Date().toISOString()
      });
    }

    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      auditLogs: [audit, ...prev.auditLogs],
      backgroundEvents: newBgEvents
    }));

    return newExpense;
  };

  // 3. CUSTOMER DEBT ENTRY
  const addDebt = ({ customerName, customerPhone, amountOwed }) => {
    const amt = parseFloat(amountOwed);
    if (isNaN(amt) || amt <= 0) throw new Error('Invalid debt amount');

    const newDebt = {
      id: 'd_' + Date.now(),
      customerName,
      customerPhone,
      amountOwed: amt,
      status: 'unpaid',
      enteredById: user?.id || 'u1',
      enteredByName: user?.name || 'Chidi (Staff)',
      createdAt: new Date().toISOString(),
      paidAt: null,
      paidByName: null,
      isDeleted: false
    };

    const audit = logAudit('debt', newDebt.id, 'CREATED', null, {
      customerName,
      customerPhone,
      amountOwed: amt
    });

    setData(prev => ({
      ...prev,
      customerDebts: [newDebt, ...prev.customerDebts],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return newDebt;
  };

  // MARK DEBT AS PAID
  const markDebtPaid = (debtId) => {
    const target = data.customerDebts.find(d => d.id === debtId);
    if (!target) return;

    const now = new Date().toISOString();
    const prevSnapshot = { status: target.status, paidAt: target.paidAt, paidByName: target.paidByName };
    const newSnapshot = { status: 'paid', paidAt: now, paidByName: user?.name || 'Staff' };

    const updatedDebts = data.customerDebts.map(d => 
      d.id === debtId 
        ? { ...d, status: 'paid', paidAt: now, paidByName: user?.name || 'Staff' }
        : d
    );

    const audit = logAudit('debt', debtId, 'MARKED_PAID', prevSnapshot, newSnapshot);

    setData(prev => ({
      ...prev,
      customerDebts: updatedDebts,
      auditLogs: [audit, ...prev.auditLogs]
    }));
  };

  // 4. INVENTOY & PRODUCTS MANAGEMENT
  const addProduct = ({ name, price, stock }) => {
    const newProduct = {
      id: 'p_' + Date.now(),
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10)
    };

    setData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  const updateProductStock = (productId, newStock) => {
    const stockVal = parseInt(newStock, 10);
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, stock: stockVal } : p)
    }));
  };

  // 5. AUDITABLE EDIT / SOFT-DELETE (History is never overwritten)
  const updateRecord = ({ recordType, recordId, updatedFields, reason }) => {
    let listKey = recordType === 'sale' ? 'sales' : recordType === 'expense' ? 'expenses' : 'customerDebts';
    const target = data[listKey].find(item => item.id === recordId);
    if (!target) return;

    const previousSnapshot = { ...target };
    const newSnapshot = { ...target, ...updatedFields, editedReason: reason };

    const updatedList = data[listKey].map(item => item.id === recordId ? newSnapshot : item);
    const audit = logAudit(recordType, recordId, 'EDITED', previousSnapshot, newSnapshot);

    setData(prev => ({
      ...prev,
      [listKey]: updatedList,
      auditLogs: [audit, ...prev.auditLogs]
    }));
  };

  const deleteRecord = ({ recordType, recordId, reason }) => {
    let listKey = recordType === 'sale' ? 'sales' : recordType === 'expense' ? 'expenses' : 'customerDebts';
    const target = data[listKey].find(item => item.id === recordId);
    if (!target) return;

    const previousSnapshot = { ...target };
    const updatedList = data[listKey].map(item => 
      item.id === recordId ? { ...item, isDeleted: true, deleteReason: reason } : item
    );

    const audit = logAudit(recordType, recordId, 'DELETED', previousSnapshot, { isDeleted: true, reason });

    setData(prev => ({
      ...prev,
      [listKey]: updatedList,
      auditLogs: [audit, ...prev.auditLogs]
    }));
  };

  return (
    <DataContext.Provider value={{
      products: data.products,
      sales: data.sales.filter(s => !s.isDeleted),
      expenses: data.expenses.filter(e => !e.isDeleted),
      customerDebts: data.customerDebts.filter(d => !d.isDeleted),
      allSalesWithDeleted: data.sales,
      allExpensesWithDeleted: data.expenses,
      allDebtsWithDeleted: data.customerDebts,
      auditLogs: data.auditLogs,
      backgroundEvents: data.backgroundEvents,
      globalLowStockThreshold: data.globalLowStockThreshold,
      addSale,
      addExpense,
      addDebt,
      markDebtPaid,
      addProduct,
      updateProductStock,
      updateRecord,
      deleteRecord
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
