'use client';

import React, { useState } from 'react';
import Overview from './overview'; // Ensure path is correct

// Types for Navigation
interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

// Helper: Move outside the component to prevent re-declaration errors
const formatTime = (seconds: number | undefined): string => {
  if (!seconds) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

// NavButton Component with proper types
function NavButton({ label, icon, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
        active 
          ? 'bg-[#4B1B7D] text-white shadow-lg' 
          : 'bg-transparent text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data or data fetched from your Unified API
  const [sessionData, setSessionData] = useState<any>(null); 

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header with NavButtons */}
      <div className="flex gap-4 mb-10 border-b pb-4">
        <NavButton 
          label="Overview" 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
          icon={<span>📊</span>}
        />
        <NavButton 
          label="Timeline" 
          active={activeTab === 'timeline'} 
          onClick={() => setActiveTab('timeline')}
          icon={<span>⏳</span>}
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl">
        {activeTab === 'overview' && <Overview data={sessionData} />}
        
        {/* Footer Info Section */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between text-slate-400 text-sm">
          <div>
            Session ID: <span className="font-mono">{sessionData?.session_id || 'N/A'}</span>
          </div>
          <div>
             Created: {sessionData?.created_at 
               ? new Date(sessionData.created_at).toLocaleDateString() 
               : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;