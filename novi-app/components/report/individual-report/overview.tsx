'use client';

import React from 'react';
import { Eye, EyeOff, Timer, Target } from 'lucide-react';

// 1. Updated Interface to match your SQL Schema exactly
interface SessionData {
  session_id?: number;
  participant_id?: string;
  session_type?: string;
  start_time?: string;
  end_time?: string;
  total_duration?: number;     // From study_session
  attentive_duration?: number;   // From study_session
  distraction_duration?: number; // From study_session
  average_attention_score?: number | string; // From study_session
  created_at?: string;
}

interface OverviewProps {
  data: SessionData | null;
}

const Overview = ({ data }: OverviewProps) => {
  // Helper to format timestamps for the summary lines
  const formatForSentence = (timeStr: string | undefined): string => {
    if (!timeStr) return "N/A";
    try {
      return new Date(timeStr).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "00:00";
    }
  };

  // 2. Updated Loader to show 0s or placeholder instead of just text
  if (!data) {
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest">
        Initializing Analytics...
      </div>
    );
  }

  // Format durations for display MM:SS - Uses 0 as fallback
  const formatDuration = (seconds: number | undefined = 0) => {
    const totalSecs = seconds || 0;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert average_attention_score to number and fix to 0 if null
  const avgScore = data.average_attention_score ? Number(data.average_attention_score) : 0;

  return (
    <section className="bg-gradient-to-br from-[#BC66A9] to-[#7E43BC] p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in duration-500">
      <div className="mb-10">
        <h3 className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-xl font-bold text-white text-sm inline-block">
          Overview
        </h3>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<Eye size={24} className="text-[#4ADE80]" />} 
          label="TOTAL SESSION DURATION" 
          value={formatDuration(data.total_duration)} 
        />
        <StatCard 
          icon={<EyeOff size={24} className="text-[#F87171]" />} 
          label="ATTENTIVE DURATION" 
          value={formatDuration(data.attentive_duration)} 
        />
        <StatCard 
          icon={<Timer size={24} className="text-[#FB923C]" />} 
          label="DISTRACTION DURATION" 
          value={formatDuration(data.distraction_duration)} 
        />
        <StatCard 
          icon={<Target size={24} className="text-white" />} 
          label="AVERAGE ATTENTION SCORE" 
          value={`${avgScore}%`} 
        />
      </div>

      {/* Session Summary Section */}
      <div className="bg-black/10 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10">
        <div className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black text-purple-100 mb-8 uppercase tracking-[0.2em] inline-block">
          Session Summary
        </div>
        
        <ul className="space-y-8">
          <SummaryLine 
            text={`This session lasted ${Math.floor((data.total_duration || 0) / 60)} minutes and ${(data.total_duration || 0) % 60} seconds, during which the learner maintained an average attention score of ${avgScore}%.`} 
          />
          <SummaryLine 
            text={`The learner was actively focused for ${Math.floor((data.attentive_duration || 0) / 60)} minutes and ${(data.attentive_duration || 0) % 60} seconds, representing ${avgScore}% of the total session time.`} 
          />
          <SummaryLine 
            text={`Session tracking started at ${formatForSentence(data.start_time || data.created_at)}. All analytics were recorded via participant ID: ${data.participant_id || '0'}.`} 
          />
        </ul>
      </div>
    </section>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-black/20 border border-black/30 p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:bg-black/30 group shadow-lg">
    <div className="mb-6 p-4 bg-black/40 rounded-full group-hover:scale-110 transition-transform shadow-inner">
      {icon}
    </div>
    <p className="text-[10px] text-white/60 uppercase tracking-widest mb-3 font-black text-center">{label}</p>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
  </div>
);

const SummaryLine = ({ text }: { text: string }) => (
  <li className="flex gap-6 items-start group">
    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 shadow-lg group-hover:scale-110 transition-transform shrink-0">
      <Target size={20} className="text-purple-400" />
    </div>
    <p className="text-white/90 text-sm leading-relaxed font-medium pt-1">
      {text}
    </p>
  </li>
);

export default Overview;