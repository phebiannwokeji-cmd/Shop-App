"use client";

import React from 'react';
import { ExpenseEntry } from '../../src/components/ExpenseEntry';
import { useEditModal } from '../AppShell';

export default function ExpensesPage() {
  const { setEditPayload } = useEditModal();

  return <ExpenseEntry onEditRecord={(payload) => setEditPayload(payload)} />;
}
