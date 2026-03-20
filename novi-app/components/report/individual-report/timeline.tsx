'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimelineProps {
  data?: {
    events: Array<{
      type: string;
      timestamp: string;
      status: 'Focused' | 'Distracted' | 'Fatigued';
      duration: number; // minutes
    }>;
  };
}

export default function Timeline({ data }: TimelineProps) {
  // Database logic: Use data from DB or show an empty state placeholder
  const hasData = data?.events && data.events.length > 0;
  
  // Logic for display: We use a specific order of colors to match Novi Analytics branding
  const events = hasData ? data.events : [];

  // Calculate totals for the summary cards based on the actual events
  const stats = events.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + curr.duration;
    acc.total += curr.duration;
    return acc;
  }, { Focused: 0, Distracted: 0, Fatigued: 0, total: 0 });

  const getPercentage = (value: number) => 
    stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Container - Balanced Padding and Centering */}
      <div className="bg-gradient-to-br from-[#BC66A9] to-[#7E43BC] rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight">Activity Timeline</h2>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Session Duration Mapping</p>
            </div>
          </div>
          
          <div className="bg-black/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10">
            <span className="text-white font-bold text-sm tracking-tighter italic">
              Total Recorded: {stats.total} Minutes
            </span>
          </div>
        </div>

        {/* Visual Timeline Bar - Enhanced Height and Border for "Balanced" feel */}
        <div className="relative mb-12">
          {!hasData ? (
             <div className="h-32 w-full rounded-[2rem] border-4 border-dashed border-white/10 flex items-center justify-center">
                <div className="flex items-center gap-2 opacity-30">
                    <AlertCircle className="text-white" size={20} />
                    <p className="text-white font-bold uppercase tracking-widest text-sm">Waiting for session data...</p>
                </div>
             </div>
          ) : (
            <div className="flex h-32 w-full rounded-[2rem] overflow-hidden border-[6px] border-black/20 bg-black/10 shadow-2xl transition-all">
              {events.map((event, idx) => (
                <div 
                  key={idx}
                  style={{ width: `${(event.duration / stats.total) * 100}%`, minWidth: '45px' }}
                  className={`${
                    event.status === 'Focused' ? 'bg-[#4ADE80]' : 
                    event.status === 'Distracted' ? 'bg-[#F87171]' : 'bg-[#FBBF24]'
                  } flex items-center justify-center text-white text-xs font-black border-r border-black/10 relative group hover:brightness-110 transition-all cursor-default`}
                >
                  <span className="drop-shadow-md">{event.duration}m</span>
                  
                  {/* Enhanced Tooltip */}
                  <div className="absolute -top-14 scale-0 group-hover:scale-100 bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all z-20 border border-white/10 shadow-2xl pointer-events-none whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            event.status === 'Focused' ? 'bg-[#4ADE80]' : 
                            event.status === 'Distracted' ? 'bg-[#F87171]' : 'bg-[#FBBF24]'
                        }`} />
                        {event.status}: {event.duration} min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Stats Cards - Grid adjusted for better balance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatusCard 
            label="Focused" 
            color="bg-[#4ADE80]" 
            time={`${stats.Focused} min`} 
            percentage={`${getPercentage(stats.Focused)}%`} 
          />
          <StatusCard 
            label="Distracted" 
            color="bg-[#F87171]" 
            time={`${stats.Distracted} min`} 
            percentage={`${getPercentage(stats.Distracted)}%`} 
          />
          <StatusCard 
            label="Fatigued" 
            color="bg-[#FBBF24]" 
            time={`${stats.Fatigued} min`} 
            percentage={`${getPercentage(stats.Fatigued)}%`} 
          />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, color, time, percentage }: any) {
  return (
    <div className="bg-black/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 transition-all hover:scale-[1.03] hover:bg-black/40 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-white/20 text-[10px] font-bold">{percentage}</span>
      </div>
      <p className="text-white text-3xl font-black tracking-tighter group-hover:translate-x-1 transition-transform">{time}</p>
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} opacity-50`} 
          style={{ width: percentage }} 
        />
      </div>
    </div>
  );
}