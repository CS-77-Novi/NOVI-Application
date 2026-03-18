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

export default function Dashboard({ type = 'teacher', sessionId }: DashboardProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState('Overview');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const performAutoSync = useCallback(async (rawDetails: any) => {
    // We skip sync if there's no valid ID or if it's the pending landing page
    if (!rawDetails || !sessionId || sessionId === "pending" || type !== 'teacher') return;

    try {
      const res = await fetch('/api/export-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'teacher', sessionId }), 
      });
      // ... logic for auto-syncing to localStorage
    } catch (error) {
      console.error("❌ Auto-sync failed:", error);
    }
  }, [type, sessionId]);

  useEffect(() => {
    async function loadData() {
      // 1. If it's the landing page (no ID yet), set empty state and stop
      if (!sessionId || sessionId === "pending") {
        setSessionData({
          total_duration: null,
          attentive_duration: null,
          average_attention_score: null,
          distraction_events: null,
        });
        setLoading(false);
        return; 
      }

      // 2. If we have an ID, fetch the real data
      setLoading(true);
      try {
        const endpoint = type === 'individual' 
          ? `/api/meeting/${sessionId}/study-session` 
          : `/api/meeting/${sessionId}/group-session`;

        const res = await fetch(endpoint); 
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const result = await res.json();
        
        if (result.success) {
          setSessionData(result.sessionSummary);
          if (type === 'teacher') await performAutoSync(result.sessionSummary);
        }
      } catch (e) { 
        console.error("Fetch failed:", e);
        // Reset to null values on error to keep UI stable
        setSessionData({
          total_duration: null,
          attentive_duration: null,
          average_attention_score: null,
          distraction_events: null,
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, sessionId, performAutoSync]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7E43BC] mb-4"></div>
          <p className="font-bold animate-pulse text-[#7E43BC]">Loading Session Data...</p>
        </div>
      );
    }

    switch (activePage) {
      case 'Overview':
        return <Overview data={sessionData} />;
      // මේ කොටස අලුතින් එකතු කරන්න 👇
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
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-4 text-[#7E43BC] mb-12">
          <div className="bg-[#7E43BC] p-2.5 rounded-2xl shadow-lg shadow-purple-200">
            <FileText size={28} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight">Novi Analytics</span>
        </div>

        <button 
          onClick={() => router.push('/')} 
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#4B1B7D] mb-12 transition-all group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        <nav className="flex-1 space-y-4">
          <NavButton label="Overview" icon={<LayoutDashboard size={22} />} active={activePage === 'Overview'} onClick={() => setActivePage('Overview')} />
          <NavButton label="Attention Score" icon={<Target size={22} />} active={activePage === 'Attention'} onClick={() => setActivePage('Attention')} />
          <NavButton label="Distractions" icon={<AlertCircle size={22} />} active={activePage === 'Distraction'} onClick={() => setActivePage('Distraction')} />
          <NavButton label="Timeline" icon={<Clock size={22} />} active={activePage === 'Timeline'} onClick={() => setActivePage('Timeline')} />
          <div className="pt-10 mt-10 border-t border-slate-200">
            <NavButton label="Download Reports" icon={<Download size={22} />} active={activePage === 'Download'} onClick={() => setActivePage('Download')} />
          </div>
        </nav>
        
        <div className="mt-auto p-5 bg-gradient-to-br from-[#7E43BC] to-[#4B1B7D] rounded-[2rem] text-white shadow-xl shadow-purple-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Session View</p>
            <p className="text-lg font-black capitalize">{type} Mode</p>
            <p className="text-[10px] opacity-50 truncate">ID: {sessionId || 'Pending'}</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-2">Finalized Report</p>
              <h1 className="text-3xl font-black text-[#4B1B7D]">
                {sessionData?.created_at 
                  ? new Date(sessionData.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                  : 'Awaiting Session Data...'}
              </h1>
            </div>
          </header>
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavButton({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${active ? 'bg-white text-[#7E43BC] shadow-xl shadow-purple-100 translate-x-2 ring-1 ring-slate-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
      <span className={active ? 'text-[#7E43BC]' : 'text-slate-400'}>{icon}</span>
      <span className="text-sm font-black tracking-tight">{label}</span>
    </button>
  );
} 