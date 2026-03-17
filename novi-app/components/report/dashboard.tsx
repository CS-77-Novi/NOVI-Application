'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Target, AlertCircle, Clock, 
  Download, FileText, ChevronLeft 
} from 'lucide-react';
import Overview from './overview';
import DownloadReport from './download'; // Ensure this component exists in the same folder

interface DashboardProps {
  type?: 'teacher' | 'individual';
}

export default function Dashboard({ type = 'teacher' }: DashboardProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState('Overview');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Using '123' as a trigger for the mock data in the API
        const res = await fetch('/api/meeting/123/study-session', {
          headers: { 'Accept': 'application/json' }
        }); 
        
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        
        const result = await res.json();
        if (result.success) {
          setSessionData(result.sessionSummary);
        }
      } catch (e) { 
        console.error("Fetch failed, using local mock data for UI testing:", e);
        setSessionData({
          total_duration: 3600,
          attentive_duration: 3000,
          distraction_duration: 600,
          average_attention_score: 85,
          distraction_events: 5,
          start_time: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // UPDATED: Added switch logic to handle different pages
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7E43BC] mb-4"></div>
          <p>Loading Session Analytics...</p>
        </div>
      );
    }

    switch (activePage) {
      case 'Overview':
        return <Overview data={sessionData} />;
      case 'Download':
        return <DownloadReport data={sessionData} />;
      default:
        return (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50">
            <p className="text-slate-400 font-medium">{activePage} section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#EADFF5] text-slate-900 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 text-[#7E43BC] mb-10">
          <div className="bg-[#7E43BC] p-2 rounded-lg">
            <FileText size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Session Report</span>
        </div>

        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#4B1B7D] mb-12 transition-colors">
          <ChevronLeft size={16} /> Back to Home
        </button>

        <nav className="flex-1 space-y-3">
          <NavButton 
            label="Overview" 
            icon={<LayoutDashboard size={20} />} 
            active={activePage === 'Overview'} 
            onClick={() => setActivePage('Overview')} 
          />
          <NavButton 
            label="Attention Score" 
            icon={<Target size={20} />} 
            active={activePage === 'Attention'} 
            onClick={() => setActivePage('Attention')} 
          />
          <NavButton 
            label="Distraction Events" 
            icon={<AlertCircle size={20} />} 
            active={activePage === 'Distraction'} 
            onClick={() => setActivePage('Distraction')} 
          />
          <NavButton 
            label="Time Line" 
            icon={<Clock size={20} />} 
            active={activePage === 'Timeline'} 
            onClick={() => setActivePage('Timeline')} 
          />
          
          <div className="pt-8 mt-8 border-t border-slate-200">
            <NavButton 
              label="Download Report" 
              icon={<Download size={20} />} 
              active={activePage === 'Download'} 
              onClick={() => setActivePage('Download')} 
            />
          </div>
        </nav>
        
        <div className="mt-auto p-4 bg-[#7E43BC]/10 rounded-xl">
           <p className="text-[10px] font-bold text-[#7E43BC] uppercase">View Mode</p>
           <p className="text-sm font-bold capitalize text-slate-800">{type}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Generated on</p>
            <h1 className="text-xl font-semibold text-[#7E43BC]">
              {sessionData?.created_at 
                ? new Date(sessionData.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) 
                : 'March 14, 2026'}
            </h1>
          </header>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavButton({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-[#7E43BC] text-white shadow-lg shadow-purple-200' 
          : 'text-slate-500 hover:bg-slate-200'
      }`}
    >
      {icon}
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </button>
  );
}