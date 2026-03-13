import React, { useState } from 'react';
import { 
  LayoutDashboard, Target, AlertCircle, Clock, 
  Download, FileText, ChevronLeft 
} from 'lucide-react';

// Import the specific page components
import Overview from './components/Overview';
import DownloadReport from './components/DownloadReport';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('Overview');

  const renderContent = () => {
    switch (activePage) {
      case 'Overview':
        return <Overview />;
      case 'Download Report':
        return <DownloadReport />;
      default:
        return <Overview />;
    }
  };

  return (
    /* Change 1: Set main container to White and text to Slate-900 */
    <div className="flex h-screen bg-[#EADFF5] text-slate-900 overflow-hidden font-sans">
      
      {/* --- SIDEBAR COMPONENT --- */}
      {/* Change 2: Sidebar set to a very light Slate with a subtle border */}
      <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col p-6 shrink-0">
        {/* Logo Section - Purple/Blue brand colors */}
        <div className="flex items-center gap-3 text-[#7E43BC] mb-10">
          <div className="bg-[#7E43BC] p-2 rounded-lg">
            <FileText size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Session Report</span>
        </div>

        {/* Back Button - Slate-500 for secondary elements */}
        <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#4B1B7D] mb-12 transition-colors">
          <ChevronLeft size={16} /> Back to Home
        </button>

        {/* Navigation Links */}
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
            active={activePage === 'Attention Score'} 
            onClick={() => setActivePage('Attention Score')} 
          />
          <NavButton 
            label="Distraction Events" 
            icon={<AlertCircle size={20} />} 
            active={activePage === 'Distraction Events'} 
            onClick={() => setActivePage('Distraction Events')} 
          />
          <NavButton 
            label="Time Line" 
            icon={<Clock size={20} />} 
            active={activePage === 'Time Line'} 
            onClick={() => setActivePage('Time Line')} 
          />
          
          <div className="pt-10">
            <NavButton 
              label="Download Report" 
              icon={<Download size={20} />} 
              active={activePage === 'Download Report'} 
              onClick={() => setActivePage('Download Report')} 
            />
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* Change 3: Background set to pure White/Light-Slate gradient */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Generated on</p>
            <h1 className="text-xl font-semibold text-[#7E43BC]">March 2, 2026</h1>
          </header>

          <div className="animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </div>
      </main>

    </div>
  );
}

// Updated NavButton for Light Theme
function NavButton({ label, icon, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
        active 
        /* Change 4: Active state uses your brand purple background with white text */
        ? 'bg-[#7E43BC]/90 text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
      }`}
    >
      {icon}
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </button>
  );
}