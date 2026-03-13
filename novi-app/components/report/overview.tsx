'use client';

import React from 'react';

// Define the model for the session data
interface SessionData {
  total_duration?: number;
  attentive_duration?: number;
  distraction_duration?: number;
  average_attention_score?: number;
  start_time?: string;
  end_time?: string;
  created_at?: string;
}

interface OverviewProps {
  data: SessionData | null;
}

// Sub-component types
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
}

interface SummaryLineProps {
  text: string;
}

const Overview = ({ data }: OverviewProps) => {
  // Fix: Added types to parameters
  const formatForSentence = (timeStr: string | undefined): string => {
    if (!timeStr) return "N/A";
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Fix: Added types to StatCard props
  const StatCard = ({ icon, label, value }: StatCardProps) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );

  // Fix: Added types to SummaryLine props
  const SummaryLine = ({ text }: SummaryLineProps) => (
    <div className="flex items-center gap-3 py-2">
      <div className="w-2 h-2 bg-[#4B1B7D] rounded-full" />
      <p className="text-slate-600 text-lg">{text}</p>
    </div>
  );

  if (!data) {
    return <div className="p-10 text-slate-400">Loading session summary...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon="⏱️" 
          label="Total Duration" 
          value={`${Math.round((data.total_duration || 0) / 60)} mins`} 
        />
        <StatCard 
          icon="🎯" 
          label="Avg. Attention" 
          value={`${data.average_attention_score || 0}%`} 
        />
        <StatCard 
          icon="🚫" 
          label="Distraction" 
          value={`${Math.round((data.distraction_duration || 0) / 60)} mins`} 
        />
      </div>

      {/* Highlights Section */}
      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
        <h3 className="text-[#4B1B7D] font-bold mb-4 text-xl">Session Highlights</h3>
        <div className="space-y-1">
          <SummaryLine text={`The session began at ${formatForSentence(data.start_time)}.`} />
          <SummaryLine text={`Attendees maintained an average focus score of ${data.average_attention_score}% throughout.`} />
          {data.end_time && (
            <SummaryLine text={`Meeting successfully concluded at ${formatForSentence(data.end_time)}.`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;