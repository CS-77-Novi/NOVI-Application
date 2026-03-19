'use client';

import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface AttentionProps {
  data: any; 
}

const AttentionScore = ({ data }: AttentionProps) => {
  
  // 1. Map timeline from database. 
  // If your API returns 'timeline_data', we use that, otherwise fall back to empty array
  const chartData = data?.timeline || [];

  // 2. Extract average score from study_session table (average_attention_score)
  // We use Number() because Postgres DECIMALS often come as strings via JSON
  const avgScore = Number(data?.average_attention_score || 0).toFixed(0);

  // 3. Find the peak moment dynamically for the insight box
  const peakPoint = chartData.length > 0 
    ? [...chartData].sort((a, b) => b.score - a.score)[0] 
    : null;

  return (
    <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[#4B1B7D] font-black text-2xl mb-2 flex items-center gap-3">
            <Target className="text-[#7E43BC]" /> Attention Analysis
          </h3>
          <p className="text-slate-400 text-sm font-medium">
            Focus levels from participant <span className="text-[#7E43BC] font-bold">#{data?.participant_id || 'N/A'}</span>
          </p>
        </div>
        
        {/* Average Score Badge */}
        <div className="bg-[#F3E8FF] px-6 py-3 rounded-3xl text-center border border-[#EADFF5] shadow-sm">
          <p className="text-[10px] font-black text-[#7E43BC] uppercase tracking-widest mb-1">Avg Attention</p>
          <p className="text-3xl font-black text-[#4B1B7D]">{avgScore}%</p>
        </div>
      </div>

      {/* Graph Area */}
      <div className="h-[380px] w-full mt-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-dashed border-slate-200 relative">
        {chartData.length > 0 ? (
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
                tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}}
                dy={10}
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}}
              />
              <Tooltip 
                cursor={{ stroke: '#7E43BC', strokeWidth: 2, strokeDasharray: '5 5' }}
                contentStyle={{
                  borderRadius: '1.5rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '15px'
                }}
                itemStyle={{ fontWeight: 800, color: '#4B1B7D' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#7E43BC" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <AlertCircle className="mb-2 opacity-20" size={48} />
            <p className="font-bold">No timeline data available for this session</p>
          </div>
        )}
      </div>

      {/* Dynamic Insight Box */}
      {peakPoint && (
        <div className="mt-8 flex items-center gap-4 text-slate-600 bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100">
          <div className="bg-green-100 p-2 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-sm font-bold">
            Peak performance: The learner reached <span className="text-[#7E43BC]">{peakPoint.score}%</span> focus at <span className="text-[#7E43BC]">{peakPoint.time}</span>.
          </p>
        </div>
      )}
    </section>
  );
};

export default AttentionScore;