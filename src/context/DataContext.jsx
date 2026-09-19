"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createShopService } from '../services/shopService';
import { localStorageRepository } from '../services/localStorageRepository';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const shopService = createShopService(localStorageRepository);

const actorFor = (user) => ({
  id: user?.id || 'u1',
  name: user?.name || null,
  role: user?.role || 'staff',
});

const settingsFor = (data) => ({
  lowStockThreshold: data.globalLowStockThreshold,
  largeExpenseThreshold: data.largeExpenseThreshold,
  agingDebtDaysThreshold: data.agingDebtDaysThreshold,
});

const merge = (prev, data) => ({ ...prev, ...data });

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState(() => localStorageRepository.getBook());

  const ctx = () => ({ actor: actorFor(user), settings: settingsFor(data) });

  // Periodic silent check for aging debts (> 7 days unpaid)
  useEffect(() => {
    const checkAging = () => {
      const result = shopService.detectBackgroundEvents({ settings: settingsFor(data) });
      if (result.success && result.events.length > 0) {
        setData((prev) => merge(prev, { backgroundEvents: result.data.backgroundEvents }));
      }
    };

    checkAging();
    const interval = setInterval(checkAging, 60000); // check every minute
    return () => clearInterval(interval);
  }, [data]);

  // 1. SALES ENTRY (Reduces stock, checks low stock event)
  const addSale = (payload) => {
    const result = shopService.recordSale(payload, ctx());
    if (!result.success) throw result.error;
    setData((prev) => merge(prev, result.data));
    return result.data.record;
  };

  // 2. EXPENSE ENTRY (Checks large expense event)
  const addExpense = (payload) => {
    const result = shopService.recordExpense(payload, ctx());
    if (!result.success) throw result.error;
    setData((prev) => merge(prev, result.data));
    return result.data.record;
  };

  // 3. CUSTOMER DEBT ENTRY
  const addDebt = (payload) => {
    const result = shopService.recordDebt(payload, ctx());
    if (!result.success) throw result.error;
    setData((prev) => merge(prev, result.data));
    return result.data.record;
  };

  // MARK DEBT AS PAID
  const markDebtPaid = (debtId) => {
    const result = shopService.markDebtPaid(debtId, ctx());
    if (!result.success) return;
    setData((prev) => merge(prev, result.data));
  };

  // 4. INVENTORY & PRODUCTS MANAGEMENT
  const addProduct = (payload) => {
    const result = shopService.addProduct(payload);
    if (!result.success) return;
    setData((prev) => merge(prev, result.data));
  };

  const updateProductStock = (productId, newStock) => {
    const result = shopService.updateStock(productId, newStock);
    if (!result.success) return;
    setData((prev) => merge(prev, result.data));
  };

  // 5. AUDITABLE EDIT / SOFT-DELETE (History is never overwritten)
  const updateRecord = (payload) => {
    const result = shopService.editRecord(payload, ctx());
    if (!result.success) return;
    setData((prev) => merge(prev, result.data));
  };

  const deleteRecord = (payload) => {
    const result = shopService.softDeleteRecord(payload, ctx());
    if (!result.success) return;
    setData((prev) => merge(prev, result.data));
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