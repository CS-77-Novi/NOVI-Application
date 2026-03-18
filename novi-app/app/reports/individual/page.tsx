'use client';

import React from 'react';
import Dashboard from '@/components/report/dashboard';

export default function IndividualLandingPage() {
  // We pass "pending" because there is no [id] in this URL path
  return <Dashboard type="individual" sessionId="pending" />;
}