'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Dashboard from '@/components/report/dashboard';

export default function TeacherLandingPage() {
  const [latestId, setLatestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestGroup() {
      try {
        const { data, error } = await supabase
          .from('group_session') // Targeting your group/teacher table
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) setLatestId(data.id);
      } catch (err) {
        console.error("Teacher discovery error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestGroup();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#EADFF5]">
      <div className="animate-pulse text-[#7E43BC] font-black">Loading Classroom Analytics...</div>
    </div>
  );

  return <Dashboard type="teacher" sessionId={latestId || "pending"} />;
}