'use client';

import React, { use } from 'react';
import Dashboard from '@/components/report/dashboard';

// Next.js 15 requires params to be a Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function IndividualSessionPage({ params }: PageProps) {
  // Use the 'use' hook to unwrap the promise
  const resolvedParams = use(params); 
  const id = resolvedParams.id;

  return <Dashboard type="individual" sessionId={id} />;
}