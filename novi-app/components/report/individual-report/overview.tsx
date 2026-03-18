'use client';

import React from 'react';
import { Eye, EyeOff, Timer, Target } from 'lucide-react';

interface SessionData {
  total_duration?: number | null;
  attentive_duration?: number | null;
  distraction_duration?: number | null;
  average_attention_score?: number | null;
  distraction_events?: number | null;
  start_time?: string | null;
  created_at?: string | null;
}

interface OverviewProps {
  data: SessionData | null;
}

const Overview = ({ data }: OverviewProps) => {
  // 1. Helper to handle the "_" placeholder for numbers
  const displayVal = (val: number | undefined | null, suffix = '') => {
    if (val === null || val === undefined) return '_';
    return `${val}${suffix}`;
  };

  // 2. Updated Duration Formatter to handle nulls
  const formatDuration = (seconds: number | undefined | null) => {
    if (seconds === null || seconds === undefined) return '_';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Formatter for the Summary text
  const formatForSentence = (timeStr: string | undefined | null): string => {
    if (!timeStr) return "the start of the session";
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const session = data || {}; 

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
          value={formatDuration(session.total_duration)} 
        />
        <StatCard 
          icon={<EyeOff size={24} className="text-[#F87171]" />} 
          label="ATTENTIVE DURATION" 
          value={formatDuration(session.attentive_duration)} 
        />
        <StatCard 
          icon={<Timer size={24} className="text-[#FB923C]" />} 
          label="DISTRACTION DURATION" 
          value={formatDuration(session.distraction_duration)} 
        />
        <StatCard 
          icon={<Target size={24} className="text-white" />} 
          label="AVERAGE ATTENTION SCORE" 
          value={displayVal(session.average_attention_score, '%')} 
        />
      </div>

      {/* Session Summary Section */}
      <div className="bg-black/10 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10">
        <div className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black text-purple-100 mb-8 uppercase tracking-[0.2em] inline-block">
          Session Summary
        </div>
        
        <ul className="space-y-8">
          <SummaryLine 
            text={`This session lasted ${displayVal(session.total_duration ? Math.floor(session.total_duration / 60) : null)} minutes, maintaining an average attention score of ${displayVal(session.average_attention_score, '%')}.`} 
          />
          <SummaryLine 
            text={`The learner was actively focused for ${formatDuration(session.attentive_duration)}, representing ${displayVal(session.average_attention_score, '%')} of the total session time.`} 
          />
          <SummaryLine 
            text={`A total of ${displayVal(session.distraction_events)} distraction events were detected starting from ${formatForSentence(session.start_time)}.`} 
          />
        </ul>
      </div>
    </section>
  );
};

// Sub-components (StatCard & SummaryLine) remain the same as your design
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
    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
      <Target size={20} className="text-purple-400" />
    </div>
    <p className="text-white/90 text-sm leading-relaxed font-medium pt-1">
      {text}
    </p>
  </li>
);

export default Overview;