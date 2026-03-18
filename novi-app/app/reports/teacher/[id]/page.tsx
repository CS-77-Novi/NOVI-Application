'use client';

import React, { use } from 'react';
import Dashboard from '@/components/report/dashboard';

export default function TeacherSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <Dashboard type="teacher" sessionId={resolvedParams.id} />;
}