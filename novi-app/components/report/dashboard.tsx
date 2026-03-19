'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Target, AlertCircle, Clock, 
  Download, FileText, ChevronLeft 
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct for your project
import Overview from './overview';
import DownloadReport from './download'; 

interface DashboardProps {
  type?: 'teacher' | 'individual';
  sessionId?: string; 
}

export default function Dashboard({ type = 'teacher', sessionId }: DashboardProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState('Overview');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * BACKGROUND AUTO-SYNC & WIPE LOGIC
   * 1. Captures live data from API
   * 2. Archives to LocalStorage as CSV
   * 3. Wipes the Supabase table for a clean slate
   */
  const performAutoSync = useCallback(async (rawDetails: any) => {
    // Only auto-sync and wipe if it's a valid teacher session
    if (!rawDetails || !sessionId || sessionId === "pending" || type !== 'teacher') return;

    try {
      const res = await fetch('/api/export-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'teacher', sessionId }), 
      });

      const result = await res.json();

      if (result.success && result.payload.length > 0) {
        // --- 1. GENERATE CSV ---
        const headers = Object.keys(result.payload[0]).join(',');
        const rows = result.payload.map((row: any) => 
          Object.values(row).map(val => `"${val}"`).join(',')
        ).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;

        const newEntry = {
          id: `AUTO_${Date.now()}`,
          date: new Date().toLocaleString(),
          content: csvContent,
          rawPayload: result.payload,
          name: `Auto_Report_${new Date().toLocaleDateString()}_${new Date().getHours()}h.csv`,
          studentCount: result.payload.length
        };

        const history = JSON.parse(localStorage.getItem('novi_report_history') || '[]');
        
        // Prevent duplicate archive entries
        const isDuplicate = history.some((h: any) => 
            h.studentCount === newEntry.studentCount && 
            new Date(h.date).toLocaleDateString() === new Date().toLocaleDateString()
        );

        if (!isDuplicate) {
          // --- 2. ARCHIVE TO LOCAL STORAGE ---
          localStorage.setItem('novi_report_history', JSON.stringify([newEntry, ...history]));
          console.log("✅ Session archived to browser.");

          // --- 3. WIPE SUPABASE TABLE ---
          // This clears the session so the database is ready for a fresh start
          const { error: deleteError } = await supabase
            .from('group_session')
            .delete()
            .eq('id', sessionId);

          if (deleteError) {
            console.error("❌ Failed to clear database:", deleteError);
          } else {
            console.log("⌫ Database cleared for the next session.");
          }
        }
      }
    } catch (error) {
      console.error("❌ Auto-sync/Wipe process failed:", error);
    }
  }, [type, sessionId]);

  /**
   * DATA INITIALIZATION
   */
  useEffect(() => {
    async function loadData() {
      if (!sessionId || sessionId === "pending") {
        setSessionData({
          total_duration: 0,
          attentive_duration: 0,
          average_attention_score: 0,
          distraction_events: 0,
          created_at: null,
        });
        setLoading(false);
        return; 
      }

      setLoading(true);
      try {
        const endpoint = type === 'individual' 
          ? `/api/meeting/${sessionId}/study-session` 
          : `/api/meeting/${sessionId}/group-session`;

        const res = await fetch(endpoint, {
          headers: { 'Accept': 'application/json' }
        }); 
        
        const result = await res.json();
        
        if (result.success && result.sessionSummary) {
          setSessionData(result.sessionSummary);
          // Trigger the Archive + Wipe process if teacher
          if (type === 'teacher') await performAutoSync(result.sessionSummary);
        } else {
          throw new Error("Data not available");
        }
      } catch (e) { 
        console.error("Fetch error:", e);
        setSessionData({
          total_duration: 0,
          attentive_duration: 0,
          average_attention_score: 0,
          distraction_events: 0,
          created_at: null,
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
          <p className="font-bold animate-pulse text-[#7E43BC]">Loading Novi Data...</p>
        </div>
      );
    }

    switch (activePage) {
      case 'Overview':
        return <Overview data={sessionData} />;
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
            <p className="text-lg font-black capitalize">{type} Dashboard</p>
            <p className="text-[10px] opacity-50 truncate">
              {sessionId === "pending" ? "Status: Ready" : `ID: ${sessionId}`}
            </p>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-2">
                {sessionData?.created_at ? "Finalized Report" : "Analytics Engine"}
              </p>
              <h1 className="text-3xl font-black text-[#4B1B7D]">
                {sessionData?.created_at 
                  ? new Date(sessionData.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                  : 'No Active Session'}
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