'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Target, AlertCircle, Clock, 
  Download, FileText, ChevronLeft 
} from 'lucide-react';
import Overview from './overview';
import DownloadReport from './download'; 
import Distractions from './distractions';

interface DashboardProps {
  type?: 'teacher' | 'individual';
  sessionId?: string; 
}

export default function Dashboard({ type = 'individual', sessionId }: DashboardProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState('Overview');
  
  // INITIALIZE with 0s so Distractions can render immediately
  const [sessionData, setSessionData] = useState<any>({
    looking_away_count: 0,
    head_pose_count: 0,
    eye_closure_count: 0,
    yawning_count: 0,
    events: [],
    created_at: null
  });
  
  const [loading, setLoading] = useState(true);

  const performAutoSync = useCallback(async (rawDetails: any) => {
    if (!rawDetails || !sessionId || sessionId === "pending" || type !== 'teacher') return;
    try {
      const res = await fetch('/api/export-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'teacher', sessionId }), 
      });
    } catch (error) {
      console.error("❌ Sync failed:", error);
    }
  }, [type, sessionId]);

  useEffect(() => {
    async function loadData() {
      if (!sessionId || sessionId === "pending") {
        setLoading(false);
        return; 
      }

      setLoading(true);
      try {
        const endpoint = type === 'individual' 
          ? `/api/meeting/${sessionId}/study-session` 
          : `/api/meeting/${sessionId}/group-session`;

        const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } }); 
        const result = await res.json();
        
        if (result.success && result.sessionSummary) {
          setSessionData(result.sessionSummary);
          if (type === 'teacher') await performAutoSync(result.sessionSummary);
        }
      } catch (e) { 
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, sessionId, performAutoSync]);

  const renderContent = () => {
    // If we've finished the initial check, show the pages
    switch (activePage) {
      case 'Overview':
        return <Overview data={sessionData} />;
      case 'Distraction':
         return <Distractions data={sessionData} />;
      case 'Download':
        return <DownloadReport />;
      default:
        return (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
            <p className="text-slate-400 font-bold">{activePage} Section Coming Soon</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#EADFF5] text-slate-900 overflow-hidden font-sans">
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-4 text-[#7E43BC] mb-12">
          <div className="bg-gradient-to-br from-[#FC96FF] to-[#5F83C4] p-2.5 rounded-2xl shadow-lg">
            <FileText size={28} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight">Novi Student</span>
        </div>

        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#4B1B7D] mb-12 transition-all group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        <nav className="flex-1 space-y-4">
          <NavButton label="My Overview" icon={<LayoutDashboard size={22} />} active={activePage === 'Overview'} onClick={() => setActivePage('Overview')} />
          <NavButton label="Focus Score" icon={<Target size={22} />} active={activePage === 'Attention'} onClick={() => setActivePage('Attention')} />
          <NavButton label="Distractions" icon={<AlertCircle size={22} />} active={activePage === 'Distraction'} onClick={() => setActivePage('Distraction')} />
          <NavButton label="Study Timeline" icon={<Clock size={22} />} active={activePage === 'Timeline'} onClick={() => setActivePage('Timeline')} />
          <div className="pt-10 mt-10 border-t border-slate-200">
            <NavButton label="Export My Data" icon={<Download size={22} />} active={activePage === 'Download'} onClick={() => setActivePage('Download')} />
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-2">Performance</p>
              <h1 className="text-3xl font-black text-[#4B1B7D]">
                {sessionData?.created_at 
                  ? new Date(sessionData.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                  : new Date().toLocaleDateString()}
              </h1>
            </div>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function NavButton({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${active ? 'bg-white text-[#5F83C4] shadow-xl shadow-blue-50 translate-x-2 ring-1 ring-slate-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
      <span className={active ? 'text-[#5F83C4]' : 'text-slate-400'}>{icon}</span>
      <span className="text-sm font-black tracking-tight">{label}</span>
    </button>
  );
}