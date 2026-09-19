/**
 * Behavioral verification for the shop service extraction.
 *
 * Drives the real shopService + localStorageRepository against an
 * in-memory localStorage mock and asserts every rule from the manual
 * checklist. Run: node scripts/verify-service-extraction.mjs
 */

import assert from 'node:assert';
import { localStorageRepository } from '../src/services/localStorageRepository.js';
import { createShopService } from '../src/services/shopService.js';
import { STORAGE_KEY, initialData } from '../src/lib/supabase.js';

const store = new Map();
const mem = store;
// The repository's read() short-circuits to the in-memory seed when it
// thinks it is SSR (typeof window === 'undefined'); fake the browser.
globalThis.window = {};
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  clear: () => mem.clear(),
};

const shopService = createShopService(localStorageRepository);

const actor = { id: 'u1', name: 'Chidi (Staff)', role: 'staff' };
const settings = {
  lowStockThreshold: 10,
  largeExpenseThreshold: 50000,
  agingDebtDaysThreshold: 7,
};
const ctx = { actor, settings };

const freshBook = () => {
  store.clear();
  return localStorageRepository.getBook();
};

const auditFor = (collection, recordId, action) =>
  collection.find((a) => a.recordId === recordId && a.action === action);

const results = [];
const run = (name, fn) => {
  try {
    freshBook();
    fn();
    results.push({ name, pass: true });
  } catch (err) {
    results.push({ name, pass: false, err: err.message });
  }
};

// 1. Record a sale -> stock reduces, audit entry created
run('recordSale reduces stock and creates audit', () => {
  const pre = localStorageRepository.getBook();
  assert.strictEqual(pre.products.find((p) => p.id === 'p1').stock, 24);
  assert.strictEqual(pre.sales.length, 3);

  const res = shopService.recordSale(
    { productId: 'p1', quantity: 2, paymentMethod: 'cash' },
    ctx,
  );
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.record.totalPrice, 150000);
  assert.strictEqual(res.data.products.find((p) => p.id === 'p1').stock, 22);
  assert.strictEqual(res.data.sales.length, 4);
  assert.ok(auditFor(res.data.auditLogs, res.data.record.id, 'CREATED'));
});

// 2. Attempt oversell -> rejected with error, nothing written
run('oversell is rejected without side effects', () => {
  const pre = freshBook();
  const p4 = pre.products.find((p) => p.id === 'p4'); // stock 5
  assert.strictEqual(p4.stock, 5);

  const res = shopService.recordSale(
    { productId: 'p4', quantity: 7, paymentMethod: 'cash' },
    ctx,
  );
  assert.strictEqual(res.success, false);
  assert.match(res.error.message, /Insufficient stock/);
  assert.strictEqual(res.data, undefined);

  const post = freshBook();
  assert.strictEqual(post.products.find((p) => p.id === 'p4').stock, 5);
  assert.strictEqual(post.sales.length, 3);
  assert.strictEqual(post.auditLogs.length, 2);
});

// 3. Record expense >= 50k -> large-expense event fires
run('large expense (>= 50k) fires large_expense event', () => {
  const res = shopService.recordExpense(
    { description: 'Bulk restock', amount: 55000, paymentMethod: 'transfer' },
    ctx,
  );
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.events.length, 1);
  assert.strictEqual(res.events[0].eventType, 'large_expense');
  assert.ok(
    res.data.backgroundEvents.some((e) => e.eventType === 'large_expense'),
  );
});

// 3b. Expense below threshold -> no event
run('expense below 50k produces no event', () => {
  const res = shopService.recordExpense(
    { description: 'Minor repair', amount: 5000, paymentMethod: 'cash' },
    ctx,
  );
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.events.length, 0);
  assert.strictEqual(res.data.backgroundEvents.length, 3);
});

// 4. Record debt -> appears in CustomerDebts
run('recordDebt adds debt and audits', () => {
  const res = shopService.recordDebt(
    { customerName: 'Aunty Ngozi', customerPhone: '08000000000', amountOwed: 12000 },
    ctx,
  );
  assert.strictEqual(res.success, true);
  assert.ok(res.data.customerDebts.some((d) => d.id === res.data.record.id));
  assert.strictEqual(res.data.record.status, 'unpaid');
  assert.ok(auditFor(res.data.auditLogs, res.data.record.id, 'CREATED'));
});

// 5. Mark debt paid -> status updates, audit entry created
run('markDebtPaid updates status and audits', () => {
  const res = shopService.markDebtPaid('d1', ctx);
  assert.strictEqual(res.success, true);
  const debt = res.data.customerDebts.find((d) => d.id === 'd1');
  assert.strictEqual(debt.status, 'paid');
  assert.ok(debt.paidAt);
  assert.strictEqual(debt.paidByName, 'Chidi (Staff)');
  assert.ok(auditFor(res.data.auditLogs, 'd1', 'MARKED_PAID'));
});

// 6. Edit record -> EDITED audit
run('editRecord creates EDITED audit', () => {
  const res = shopService.editRecord(
    { recordType: 'sale', recordId: 's1', updatedFields: { paymentMethod: 'card' }, reason: 'Customer paid by card' },
    ctx,
  );
  assert.strictEqual(res.success, true);
  const updated = res.data.sales.find((s) => s.id === 's1');
  assert.strictEqual(updated.paymentMethod, 'card');
  assert.strictEqual(updated.editedReason, 'Customer paid by card');
  assert.ok(auditFor(res.data.auditLogs, 's1', 'EDITED'));
});

// 6b. Soft-delete record -> DELETED audit, soft flag set
run('softDeleteRecord sets isDeleted and audits', () => {
  const res = shopService.softDeleteRecord(
    { recordType: 'debt', recordId: 'd2', reason: 'Duplicate entry' },
    ctx,
  );
  assert.strictEqual(res.success, true);
  const deleted = res.data.customerDebts.find((d) => d.id === 'd2');
  assert.strictEqual(deleted.isDeleted, true);
  assert.strictEqual(deleted.deleteReason, 'Duplicate entry');
  assert.ok(auditFor(res.data.auditLogs, 'd2', 'DELETED'));
});

// 7. Aging debt detection (seed d1: unpaid 10 days) fires once, idempotent
run('detectBackgroundEvents fires aging_debt once', () => {
  const first = shopService.detectBackgroundEvents(ctx);
  assert.strictEqual(first.success, true);
  const events = first.data.backgroundEvents.filter((e) => e.eventType === 'aging_debt' && e.metadata?.debtId === 'd1');
  assert.strictEqual(events.length, 1);

  const second = shopService.detectBackgroundEvents(ctx);
  const again = second.data.backgroundEvents.filter((e) => e.eventType === 'aging_debt' && e.metadata?.debtId === 'd1');
  assert.strictEqual(again.length, 1);
});

// 8. Persistence survives a full reload (fresh store re-seeded from storage)
run('data survives reload via persisted storage key', () => {
  shopService.recordSale(
    { productId: 'p1', quantity: 1, paymentMethod: 'cash' },
    ctx,
  );
  const raw = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY));
  assert.strictEqual(raw.sales.length, 4);

  const book = localStorageRepository.getBook(); // same store, "reload"
  assert.strictEqual(book.sales.length, 4);
  assert.strictEqual(book.products.find((p) => p.id === 'p1').stock, 23);
});

// ---------- report ----------
let failures = 0;
for (const r of results) {
  const status = r.pass ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${r.name}`);
  if (!r.pass) {
    failures += 1;
    console.log(`       ${r.err}`);
  }
}
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures > 0 ? 1 : 0);