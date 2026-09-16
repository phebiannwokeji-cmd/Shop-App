"use client";

import React from 'react';
import { CustomerDebts } from '../../src/components/CustomerDebts';
import { useEditModal } from '../AppShell';

export default function DebtsPage() {
  const { setEditPayload } = useEditModal();

  return <CustomerDebts onEditRecord={(payload) => setEditPayload(payload)} />;
}
