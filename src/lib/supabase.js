import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof process !== 'undefined' && process.env ? (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL) : '') || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) : '') || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ========================================================
// LOCAL MOCK ENGINE FOR IMMEDIATE ZERO-CONFIG LOCAL TESTING
// Persists in localStorage, enforces staff vs owner roles,
// stock auto-decrement, immutable audit logs, and silent events.
// ========================================================

const STORAGE_KEY = 'shop_record_book_data_v1';

// Initial pre-loaded seed data
const initialData = {
  globalLowStockThreshold: 10,
  largeExpenseThreshold: 50000,
  agingDebtDaysThreshold: 7,

  products: [
    { id: 'p1', name: 'Bag of Rice (50kg)', price: 75000, stock: 24 },
    { id: 'p2', name: 'Vegetable Oil (5L)', price: 18500, stock: 8 },
    { id: 'p3', name: 'Carton of Noodles (Indomie)', price: 12500, stock: 35 },
    { id: 'p4', name: 'Sugar (50kg)', price: 68000, stock: 5 },
    { id: 'p5', name: 'Tomato Paste (Pack of 50)', price: 14000, stock: 15 },
    { id: 'p6', name: 'Refined Milk (Pack of 24)', price: 22000, stock: 4 }
  ],

  sales: [
    {
      id: 's1',
      productId: 'p1',
      productName: 'Bag of Rice (50kg)',
      quantity: 2,
      unitPrice: 75000,
      totalPrice: 150000,
      paymentMethod: 'transfer',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      isDeleted: false
    },
    {
      id: 's2',
      productId: 'p3',
      productName: 'Carton of Noodles (Indomie)',
      quantity: 5,
      unitPrice: 12500,
      totalPrice: 62500,
      paymentMethod: 'cash',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      isDeleted: false
    },
    {
      id: 's3',
      productId: 'p5',
      productName: 'Tomato Paste (Pack of 50)',
      quantity: 1,
      unitPrice: 14000,
      totalPrice: 14000,
      paymentMethod: 'card',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 26).toISOString(), // Yesterday
      isDeleted: false
    }
  ],

  expenses: [
    {
      id: 'e1',
      description: 'Fuel for Shop Generator (20L)',
      amount: 17500,
      paymentMethod: 'cash',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      isDeleted: false
    },
    {
      id: 'e2',
      description: 'Monthly Security & Association Levy',
      amount: 55000,
      paymentMethod: 'transfer',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      isDeleted: false
    }
  ],

  customerDebts: [
    {
      id: 'd1',
      customerName: 'Mama Blessing',
      customerPhone: '08031234567',
      amountOwed: 28500,
      status: 'unpaid',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), // 10 days ago (Aging debt!)
      paidAt: null,
      paidByName: null,
      isDeleted: false
    },
    {
      id: 'd2',
      customerName: 'Emeka Carpenter',
      customerPhone: '08129876543',
      amountOwed: 14000,
      status: 'unpaid',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
      paidAt: null,
      paidByName: null,
      isDeleted: false
    },
    {
      id: 'd3',
      customerName: 'Chief Okonkwo',
      customerPhone: '07055551122',
      amountOwed: 75000,
      status: 'paid',
      enteredById: 'u1',
      enteredByName: 'Chidi (Staff)',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      paidByName: 'Chidi (Staff)',
      isDeleted: false
    }
  ],

  auditLogs: [
    {
      id: 'al1',
      recordType: 'sale',
      recordId: 's1',
      action: 'CREATED',
      performedByName: 'Chidi (Staff)',
      performedByRole: 'staff',
      previousData: null,
      newData: { productName: 'Bag of Rice (50kg)', quantity: 2, total: 150000 },
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'al2',
      recordType: 'debt',
      recordId: 'd3',
      action: 'MARKED_PAID',
      performedByName: 'Chidi (Staff)',
      performedByRole: 'staff',
      previousData: { status: 'unpaid' },
      newData: { status: 'paid', paidAt: new Date(Date.now() - 3600000 * 12).toISOString() },
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],

  backgroundEvents: [
    {
      id: 'bg1',
      eventType: 'low_stock',
      title: 'Low Stock Threshold Crossed',
      description: 'Refined Milk (Pack of 24) stock dropped to 4 (threshold: 10).',
      metadata: { productId: 'p6', currentStock: 4, threshold: 10 },
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 'bg2',
      eventType: 'large_expense',
      title: 'Unusually Large Expense Logged',
      description: 'Expense of ₦55,000 for "Monthly Security & Association Levy" entered by Chidi (Staff).',
      metadata: { amount: 55000, threshold: 50000 },
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'bg3',
      eventType: 'aging_debt',
      title: 'Customer Debt Exceeded 7 Days Unpaid',
      description: 'Debt of ₦28,500 owed by Mama Blessing has been unpaid for 10 days.',
      metadata: { customerName: 'Mama Blessing', amount: 28500, daysUnpaid: 10 },
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    }
  ]
};

export const getStoredData = () => {
  if (typeof window === 'undefined') {
    return initialData;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local shop data:', e);
    return initialData;
  }
};

export const saveStoredData = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
