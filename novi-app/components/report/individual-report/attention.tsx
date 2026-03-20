'use client';

import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface AttentionProps {
  data?: any; 
}

const AttentionScore = ({ data }: AttentionProps) => {
  
  const realData = data?.timeline || [];
  const hasData = realData.length > 0;

  // 1. GENERATE GHOST DATA: 
  // If no data exists, we create a 7-point flatline at 0 to keep the chart rendered.
  const chartData = hasData ? realData : [
    { time: '00:00', score: 0 },
    { time: '05:00', score: 0 },
    { time: '10:00', score: 0 },
    { time: '15:00', score: 0 },
    { time: '20:00', score: 0 },
    { time: '25:00', score: 0 },
    { time: '30:00', score: 0 },
  ];

  const avgScore = Number(data?.average_attention_score || 0).toFixed(0);

  const peakPoint = hasData 
    ? [...realData].sort((a, b) => b.score - a.score)[0] 
    : null;

  return (
    <section className="bg-[#7E43BC]/50 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[#4B1B7D] font-black text-2xl mb-2 flex items-center gap-3">
            <Target className="text-[#7E43BC]" /> Attention Analysis
          </h3>
          <p className="text-slate-400 text-sm font-medium">
            {hasData ? (
              <>Focus levels from participant <span className="text-[#7E43BC] font-bold">#{data?.participant_id}</span></>
            ) : (
              <span className="flex items-center gap-2 italic text-[#7E43BC]">
                <AlertCircle size={14} className="text-orange-800" /> 
                Waiting for session metrics...
              </span>
            )}
          </p>
        </div>
        
        {/* Average Score Badge - Dimmed if no data */}
        <div className={`px-6 py-3 rounded-3xl text-center border transition-all ${hasData ? 'bg-[#F3E8FF] border-[#EADFF5] shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
          <p className="text-[10px] font-black text-[#7E43BC] uppercase tracking-widest mb-1">Avg Attention</p>
          <p className="text-3xl font-black text-[#4B1B7D]">{avgScore}%</p>
        </div>
      </div>

      {/* Graph Area - The chart now ALWAYS displays */}
      <div className="h-[380px] w-full mt-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-dashed border-slate-200 relative overflow-hidden">
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                {/* Fade the gradient if there is no data */}
                <stop offset="5%" stopColor="#7E43BC" stopOpacity={hasData ? 0.3 : 0.05}/>
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
            
            {/* Tooltip only activates when data is present */}
            {hasData && (
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
            )}

            <Area 
              type="monotone" 
              dataKey="score" 
              stroke={hasData ? "#7E43BC" : "#E2E8F0"} 
              strokeWidth={hasData ? 4 : 2}
              fillOpacity={1} 
              fill="url(#colorScore)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Insight Box */}
      <div className={`mt-8 flex items-center gap-4 p-5 rounded-2xl border transition-all ${hasData ? 'bg-[#F8FAFC] border-slate-100 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
        <div className={`p-2 rounded-lg ${hasData ? 'bg-green-100' : 'bg-slate-200'}`}>
          <TrendingUp size={20} className={hasData ? "text-green-600" : "text-slate-400"} />
        </div>
        <p className="text-sm font-bold">
          {hasData && peakPoint ? (
            <>Peak performance: The learner reached <span className="text-[#7E43BC]">{peakPoint.score}%</span> focus at <span className="text-[#7E43BC]">{peakPoint.time}</span>.</>
          ) : (
            "Session insights will appear here once the focus analysis is complete."
          )}
        </p>
      </div>
    </section>
  );
};

export default AttentionScore;