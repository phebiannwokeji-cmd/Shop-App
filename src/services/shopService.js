/**
 * Framework-agnostic shop business logic.
 *
 * Depends only on a repository implementing the interface in ./repository.js
 * (getAll, getById, insert, update, query). No React, localStorage, or
 * Supabase imports — the backing store is injected by the caller so this
 * logic can run against localStorage, Supabase, or any future store.
 *
 * Every mutating method persists through the repository and resolves to
 *   { success: boolean, data?: object, error?: Error, events?: array }
 * where `data` holds the collections affected by the operation and `events`
 * lists any background events (low stock, large expense, aging debt)
 * produced by the operation.
 */
"use client";

const DEFAULT_SETTINGS = {
  lowStockThreshold: 10,
  largeExpenseThreshold: 50000,
  agingDebtDaysThreshold: 7,
};

const DEFAULT_ACTOR = { id: 'u1', name: null, role: 'staff' };

const recordListKey = (recordType) =>
  recordType === 'sale' ? 'sales'
  : recordType === 'expense' ? 'expenses'
  : 'customerDebts';

const buildAudit = (actor, recordType, recordId, action, previousData, newData) => ({
  id: 'al_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
  recordType,
  recordId,
  action,
  performedByName: actor?.name || 'Staff User',
  performedByRole: actor?.role || 'staff',
  previousData,
  newData,
  timestamp: new Date().toISOString(),
});

const buildBackgroundEvent = (eventType, title, description, metadata = {}) => ({
  id: 'bg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
  eventType,
  title,
  description,
  metadata,
  createdAt: new Date().toISOString(),
});

export const createShopService = (repository) => {
  const settings = (overrides = {}) => ({
    ...DEFAULT_SETTINGS,
    ...(overrides || {}),
  });

  // 1. RECORD SALE — validates stock, computes total, reduces inventory,
  //    audits the sale, and flags low stock.
  const recordSale = ({ productId, quantity, paymentMethod }, ctx = {}) => {
    const s = settings(ctx.settings);
    const actor = { ...DEFAULT_ACTOR, ...(ctx.actor || {}) };

    const product = repository.getById('products', productId);
    if (!product) {
      return { success: false, error: new Error('Product not found') };
    }
    if (product.stock < quantity) {
      return {
        success: false,
        error: new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`),
      };
    }

    const qty = parseInt(quantity, 10);
    const totalPrice = product.price * qty;
    const newStock = product.stock - qty;

    const sale = {
      id: 's_' + Date.now(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.price,
      totalPrice,
      paymentMethod,
      enteredById: actor.id,
      enteredByName: actor.name || 'Chidi (Staff)',
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    const audit = buildAudit(actor, 'sale', sale.id, 'CREATED', null, {
      productName: product.name,
      quantity: qty,
      totalPrice,
      paymentMethod,
    });

    repository.update('products', productId, { stock: newStock });
    repository.insert('sales', sale);
    repository.insert('auditLogs', audit);

    const events = [];
    if (newStock < s.lowStockThreshold) {
      const event = buildBackgroundEvent(
        'low_stock',
        'Low Stock Level Reached',
        `${product.name} stock decreased to ${newStock} units (global threshold: ${s.lowStockThreshold}).`,
        { productId: product.id, productName: product.name, newStock, threshold: s.lowStockThreshold },
      );
      events.push(event);
      repository.insert('backgroundEvents', event);
    }

    return {
      success: true,
      data: {
        record: sale,
        products: repository.getAll('products'),
        sales: repository.getAll('sales'),
        auditLogs: repository.getAll('auditLogs'),
        backgroundEvents: repository.getAll('backgroundEvents'),
      },
      events,
    };
  };

  // 2. RECORD EXPENSE — validates amount and flags large expenses.
  const recordExpense = ({ description, amount, paymentMethod }, ctx = {}) => {
    const s = settings(ctx.settings);
    const actor = { ...DEFAULT_ACTOR, ...(ctx.actor || {}) };

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return { success: false, error: new Error('Invalid expense amount') };
    }

    const expense = {
      id: 'e_' + Date.now(),
      description,
      amount: amt,
      paymentMethod,
      enteredById: actor.id,
      enteredByName: actor.name || 'Chidi (Staff)',
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    const audit = buildAudit(actor, 'expense', expense.id, 'CREATED', null, {
      description,
      amount: amt,
      paymentMethod,
    });

    repository.insert('expenses', expense);
    repository.insert('auditLogs', audit);

    const events = [];
    if (amt >= s.largeExpenseThreshold) {
      const event = buildBackgroundEvent(
        'large_expense',
        'Unusually Large Expense Logged',
        `An expense of ₦${amt.toLocaleString()} for "${description}" was recorded by ${actor.name || 'Staff'}.`,
        { expenseId: expense.id, amount: amt, description, enteredBy: actor.name },
      );
      events.push(event);
      repository.insert('backgroundEvents', event);
    }

    return {
      success: true,
      data: {
        record: expense,
        expenses: repository.getAll('expenses'),
        auditLogs: repository.getAll('auditLogs'),
        backgroundEvents: repository.getAll('backgroundEvents'),
      },
      events,
    };
  };

  // 3. RECORD DEBT — creates an unpaid customer debt and audits it.
  const recordDebt = ({ customerName, customerPhone, amountOwed }, ctx = {}) => {
    const actor = { ...DEFAULT_ACTOR, ...(ctx.actor || {}) };

    const amt = parseFloat(amountOwed);
    if (isNaN(amt) || amt <= 0) {
      return { success: false, error: new Error('Invalid debt amount') };
    }

    const debt = {
      id: 'd_' + Date.now(),
      customerName,
      customerPhone,
      amountOwed: amt,
      status: 'unpaid',
      enteredById: actor.id,
      enteredByName: actor.name || 'Chidi (Staff)',
      createdAt: new Date().toISOString(),
      paidAt: null,
      paidByName: null,
      isDeleted: false,
    };

    const audit = buildAudit(actor, 'debt', debt.id, 'CREATED', null, {
      customerName,
      customerPhone,
      amountOwed: amt,
    });

    repository.insert('customerDebts', debt);
    repository.insert('auditLogs', audit);

    return {
      success: true,
      data: {
        record: debt,
        customerDebts: repository.getAll('customerDebts'),
        auditLogs: repository.getAll('auditLogs'),
      },
      events: [],
    };
  };

  // MARK DEBT PAID — transitions a debt to paid with a snapshot audit.
  const markDebtPaid = (debtId, ctx = {}) => {
    const actor = { ...DEFAULT_ACTOR, ...(ctx.actor || {}) };

    const target = repository.getById('customerDebts', debtId);
    if (!target) {
      return { success: false, error: new Error('Debt not found') };
    }

    const now = new Date().toISOString();
    const prevSnapshot = { status: target.status, paidAt: target.paidAt, paidByName: target.paidByName };
    const nextSnapshot = { status: 'paid', paidAt: now, paidByName: actor.name || 'Staff' };

    repository.update('customerDebts', debtId, nextSnapshot);

    const audit = buildAudit(actor, 'debt', debtId, 'MARKED_PAID', prevSnapshot, nextSnapshot);
    repository.insert('auditLogs', audit);

    return {
      success: true,
      data: {
        customerDebts: repository.getAll('customerDebts'),
        auditLogs: repository.getAll('auditLogs'),
      },
      events: [],
    };
  };

  // EDIT RECORD — auditable update across sales, expenses, and debts.
  const editRecord = ({ recordType, recordId, updatedFields, reason }, ctx = {}) => {
    const actor = { ...DEFAULT_ACTOR, ...(ctx.actor || {}) };
    const listKey = recordListKey(recordType);

    const target = repository.getById(listKey, recordId);
    if (!target) {
      return { success: false, error: new Error('Record not found') };
    }

    const previousSnapshot = { ...target };
    const updated = { ...previousSnapshot, ...(updatedFields || {}), editedReason: reason };

    repository.update(listKey, recordId, updated);

    const audit = buildAudit(actor, recordType, recordId, 'EDITED', previousSnapshot, updated);
    repository.insert('auditLogs', audit);

    return {
      success: true,
      data: {
        record: updated,
        [listKey]: repository.getAll(listKey),
        auditLogs: repository.getAll('auditLogs'),
      },
      events: [],
    };
  };

  // SOFT DELETE RECORD — flags isDeleted instead of destroying history.
  const softDeleteRecord = ({ recordType, recordId, reason }, ctx = {}) => {
    const actor = { ...DEFAULT_ACTOR, ...(ctx.actor || {}) };
    const listKey = recordListKey(recordType);

    const target = repository.getById(listKey, recordId);
    if (!target) {
      return { success: false, error: new Error('Record not found') };
    }

    const previousSnapshot = { ...target };

    repository.update(listKey, recordId, { isDeleted: true, deleteReason: reason });

    const audit = buildAudit(actor, recordType, recordId, 'DELETED', previousSnapshot, {
      isDeleted: true,
      reason,
    });
    repository.insert('auditLogs', audit);

    return {
      success: true,
      data: {
        [listKey]: repository.getAll(listKey),
        auditLogs: repository.getAll('auditLogs'),
      },
      events: [],
    };
  };

  // ADD PRODUCT — appends a new inventory item.
  const addProduct = ({ name, price, stock } = {}) => {
    const product = {
      id: 'p_' + Date.now(),
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    };

    repository.insert('products', product);

    return {
      success: true,
      data: {
        record: product,
        products: repository.getAll('products'),
      },
      events: [],
    };
  };

  // UPDATE STOCK — adjusts a product's quantity in place.
  const updateStock = (productId, newStock) => {
    const target = repository.getById('products', productId);
    if (!target) {
      return { success: false, error: new Error('Product not found') };
    }

    const stockVal = parseInt(newStock, 10);
    repository.update('products', productId, { stock: stockVal });

    return {
      success: true,
      data: {
        record: { ...target, stock: stockVal },
        products: repository.getAll('products'),
      },
      events: [],
    };
  };

  // DETECT BACKGROUND EVENTS — scans for unpaid debts past the aging
  // threshold that have not yet been logged.
  const detectBackgroundEvents = (ctx = {}) => {
    const s = settings(ctx.settings);
    const now = new Date();

    const debts = repository.getAll('customerDebts');
    const existingEvents = repository.getAll('backgroundEvents');

    const events = [];
    for (const debt of debts) {
      if (debt.status !== 'unpaid' || debt.isDeleted) continue;

      const createdDate = new Date(debt.createdAt);
      const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
      if (diffDays < s.agingDebtDaysThreshold) continue;

      const alreadyLogged = existingEvents.some(
        (ev) => ev.eventType === 'aging_debt' && ev.metadata?.debtId === debt.id,
      );
      if (alreadyLogged) continue;

      const event = buildBackgroundEvent(
        'aging_debt',
        'Customer Debt Exceeded Threshold',
        `Debt of ₦${debt.amountOwed.toLocaleString()} owed by ${debt.customerName} (${debt.customerPhone}) has been unpaid for ${Math.floor(diffDays)} days.`,
        { debtId: debt.id, customerName: debt.customerName, amount: debt.amountOwed, daysUnpaid: Math.floor(diffDays) },
      );
      events.push(event);
      repository.insert('backgroundEvents', event);
    }

    if (events.length === 0) {
      return { success: true, data: { backgroundEvents: existingEvents }, events: [] };
    }

    return {
      success: true,
      data: {
        backgroundEvents: repository.getAll('backgroundEvents'),
      },
      events,
    };
  };

  return {
    recordSale,
    recordExpense,
    recordDebt,
    markDebtPaid,
    editRecord,
    softDeleteRecord,
    addProduct,
    updateStock,
    detectBackgroundEvents,
  };
};

export default createShopService;