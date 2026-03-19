'use client';

import React from 'react';
import { Clock, Info } from 'lucide-react';

interface TimelineProps {
  data: {
    events: Array<{
      type: string;
      timestamp: string;
      status: 'Focused' | 'Distracted' | 'Fatigued';
      duration: number; // minutes
    }>;
  };
}

export default function Timeline({ data }: TimelineProps) {
  // Database eken ena events array eka anusaarayaen timeline bars hadaganna
  // Note: Backend eken events array ekak euwe nathnam demo data pennanawa
  const events = data?.events?.length > 0 ? data.events : [
    { type: 'focus', status: 'Focused', duration: 10, color: 'bg-green-500' },
    { type: 'distract', status: 'Distracted', duration: 5, color: 'bg-red-500' },
    { type: 'focus', status: 'Focused', duration: 12, color: 'bg-green-500' },
    { type: 'fatigue', status: 'Fatigued', duration: 5, color: 'bg-yellow-500' },
    { type: 'focus', status: 'Focused', duration: 10, color: 'bg-green-500' },
    { type: 'distract', status: 'Distracted', duration: 5, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Main Timeline Card */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-10 shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#7E43BC] p-2 rounded-lg">
            <Clock className="text-white" size={20} />
          </div>
          <h2 className="text-white text-xl font-bold">Activity Timeline</h2>
        </div>

        {/* Visual Bar */}
        <div className="flex h-24 w-full rounded-2xl overflow-hidden mb-10 border-4 border-[#2A2A2A]">
          {events.map((event, idx) => (
            <div 
              key={idx}
              style={{ width: `${(event.duration / 60) * 100}%`, minWidth: '40px' }}
              className={`${
                event.status === 'Focused' ? 'bg-green-500' : 
                event.status === 'Distracted' ? 'bg-red-600' : 'bg-yellow-500'
              } flex items-center justify-center text-white text-[10px] font-bold border-r border-black/20 relative group hover:opacity-80 transition-all`}
            >
              {event.duration}m
              {/* Tooltip on hover */}
              <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-white text-black px-2 py-1 rounded text-[10px] transition-all z-10">
                {event.status}: {event.duration} min
              </span>
            </div>
          ))}
        </div>

        {/* Stats Summary Labels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard label="Focused" color="bg-green-500" time="32 min" percentage="70%" />
          <StatusCard label="Distracted" color="bg-red-600" time="10 min" percentage="15%" />
          <StatusCard label="Fatigued" color="bg-yellow-500" time="5 min" percentage="15%" />
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-10 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Info className="text-[#FC96FF]" size={20} />
          <h3 className="text-[#FC96FF] font-bold">Insights</h3>
        </div>
        <ul className="space-y-4">
          <InsightItem text="The learner showed the <span class='text-green-400'>highest focus levels</span> during the first 22 minutes." />
          <InsightItem text="A period of <span class='text-yellow-400'>fatigue</span> was detected between minutes 22-27." />
          <InsightItem text="Focus levels <span class='text-green-400'>recovered</span> in the final 10 minutes." />
        </ul>
      </div>
    </div>
  );
}

function StatusCard({ label, color, time, percentage }: any) {
  return (
    <div className="bg-[#262626] p-5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-gray-400 text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="text-white text-lg font-black">{time}</p>
      <p className="text-gray-500 text-[10px]">{percentage} of session</p>
    </div>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-gray-300 text-sm leading-relaxed">
      <span className="text-[#FC96FF]">•</span>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </li>
  );
}