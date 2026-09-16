"use client";

import React from 'react';
import { SalesEntry } from '../../src/components/SalesEntry';
import { useEditModal } from '../AppShell';

export default function SalesPage() {
  const { setEditPayload } = useEditModal();

  return <SalesEntry onEditRecord={(payload) => setEditPayload(payload)} />;
}
