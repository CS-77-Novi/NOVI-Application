'use client';

import React from 'react';
import Dashboard from '@/components/Dashboard';

export default function IndividualReportSession({ params }: { params: { id: string } }) {
  // This grabs the real UUID/ID from the URL
  return <Dashboard type="individual" sessionId={params.id} />;
}