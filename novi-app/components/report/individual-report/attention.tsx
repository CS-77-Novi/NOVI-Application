'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

interface AttentionProps {
  data: any; // මෙතැනට එන්නේ timeline data සහිත array එකක්
}

const AttentionScore = ({ data }: AttentionProps) => {
  // Sample Data (ඔබේ API එකෙන් දත්ත එනතෙක් පරීක්ෂා කිරීමට)
  const chartData = data?.timeline || [
    { time: '00:00', score: 85 },
    { time: '05:00', score: 70 },
    { time: '10:00', score: 90 },
    { time: '15:00', score: 40 },
    { time: '20:00', score: 75 },
    { time: '25:00', score: 95 },
  ];

  const avgScore = data?.average_attention_score || 78;

  return (
    <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[#4B1B7D] font-black text-2xl mb-2 flex items-center gap-3">
            <Target className="text-[#7E43BC]" /> Attention Analysis
          </h3>
          <p className="text-slate-400 text-sm font-medium">Focus levels tracked throughout the session</p>
        </div>
        <div className="bg-[#EADFF5] px-6 py-3 rounded-2xl text-center">
          <p className="text-[10px] font-black text-[#7E43BC] uppercase tracking-widest">Average Score</p>
          <p className="text-2xl font-black text-[#4B1B7D]">{avgScore}%</p>
        </div>
      </div>

      {/* Graph Area */}
      <div className="h-[350px] w-full mt-6 bg-slate-50/50 p-6 rounded-[2rem] border border-dashed border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7E43BC" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7E43BC" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}}
            />
            <Tooltip 
              contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#7E43BC" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex items-center gap-3 text-slate-500 bg-slate-50 p-4 rounded-xl">
        <TrendingUp size={20} className="text-green-500" />
        <p className="text-xs font-bold">
          The learner showed peak focus around the <span className="text-[#7E43BC]">10-minute</span> mark.
        </p>
      </div>
    </section>
  );
};

export default AttentionScore;