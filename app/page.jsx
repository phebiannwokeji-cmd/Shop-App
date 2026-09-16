"use client";

import React from 'react';
import { OwnerDashboard } from '../src/components/OwnerDashboard';
import { useAuth } from '../src/context/AuthContext';

export default function DashboardPage() {
  const { isOwner } = useAuth();

  if (!isOwner) {
    return null;
  }

  return <OwnerDashboard />;
}
