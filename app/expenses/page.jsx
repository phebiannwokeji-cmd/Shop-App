"use client";

import React from 'react';
import { ExpenseEntry } from '../../src/components/ExpenseEntry';
import { useEditModal } from '../AppShell';

export default function ExpensesPage() {
  const { setEditPayload } = useEditModal();

  return (
    <>
      <div className="glass-card" style={{ padding: '0.85rem 1.1rem', border: '1px solid var(--primary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        <strong style={{ color: 'var(--primary)' }}>Note:</strong>{' '}
        Daily entry now happens in WhatsApp. Use this screen for corrections and backfilling.
      </div>
      <ExpenseEntry onEditRecord={(payload) => setEditPayload(payload)} />
    </>
  );
}
