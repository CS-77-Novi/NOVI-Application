'use client';

import React from 'react';
import { AlertCircle, EyeOff, UserX, Ghost, Coffee } from 'lucide-react';

// This matches your 'meeting_distraction' table structure
interface DistractionDBData {
  meeting_id: number;
  participant_id: number;
  name: string;
  status: string;
  total_checks: number;
  distracted_checks: number; // Looking Away
  peak_distraction_pct: number;
  peak_distraction_time: string;
  // Note: For a full production app, you would add columns for:
  head_pose_count?: number; 
  eye_closure_count?: number;
  yawning_count?: number;
  events?: Array<{ type: string; time: string; impact: number }>;
}

interface DistractionsProps {
  data?: DistractionDBData; 
}

// Fallback dummy data for testing or empty states
const dummyDistractionData = {
  distracted_checks: 5,
  head_pose_count: 2,
  eye_closure_count: 4,
  yawning_count: 1,
  events: [
    { type: 'Looking Away', time: '05:23', impact: 88 },
    { type: 'Eye Closure', time: '12:45', impact: 92 },
    { type: 'Head Pose Deviation', time: '15:12', impact: 75 },
    { type: 'Looking Away', time: '18:34', impact: 64 },
    { type: 'Yawning', time: '22:56', impact: 40 },
    { type: 'Looking Away', time: '25:18', impact: 82 },
    { type: 'Eye Closure', time: '28:42', impact: 95 },
    { type: 'Head Pose Deviation', time: '31:09', impact: 70 },
  ]
};

const Distractions = ({ data }: DistractionsProps) => {
  // Logic: Use database data if it exists and has checks, otherwise fallback to dummy
  const hasDbData = data && (data.distracted_checks > 0 || (data.events && data.events.length > 0));
  const finalData = hasDbData ? data : dummyDistractionData;

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'Looking Away': return { color: 'bg-red-500/20 text-red-400', icon: <EyeOff size={18} /> };
      case 'Eye Closure': return { color: 'bg-orange-500/20 text-orange-400', icon: <Ghost size={18} /> };
      case 'Head Pose Deviation': return { color: 'bg-purple-500/20 text-purple-400', icon: <UserX size={18} /> };
      case 'Yawning': return { color: 'bg-blue-500/20 text-blue-400', icon: <Coffee size={18} /> };
      default: return { color: 'bg-slate-500/20 text-slate-400', icon: <AlertCircle size={18} /> };
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#BC66A9] to-[#7E43BC] p-10 rounded-[2.5rem] shadow-2xl w-full animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-xl font-bold text-white text-sm inline-block w-fit">
            Distraction Analysis
          </h3>
          {data?.name && (
            <p className="text-white/60 text-xs ml-1">Report for: {data.name}</p>
          )}
        </div>
      </div>

      {/* Summary Stats Cards mapped to DB Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MiniStatCard 
            label="Looking Away" 
            value={finalData.distracted_checks} 
            icon={<EyeOff size={20} />} 
            color="text-red-400" 
        />
        <MiniStatCard 
            label="Head Pose" 
            value={finalData.head_pose_count || 0} 
            icon={<UserX size={20} />} 
            color="text-purple-400" 
        />
        <MiniStatCard 
            label="Eye Closure" 
            value={finalData.eye_closure_count || 0} 
            icon={<Ghost size={20} />} 
            color="text-orange-400" 
        />
        <MiniStatCard 
            label="Yawning" 
            value={finalData.yawning_count || 0} 
            icon={<Coffee size={20} />} 
            color="text-blue-400" 
        />
      </div>

      {/* Timeline Section */}
      <div className="bg-black/20 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex justify-between items-center mb-6 px-2">
          <h4 className="text-white/60 text-xs font-black uppercase tracking-widest">Event Timeline</h4>
          <span className="text-[10px] text-white font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
            {hasDbData ? 'Session History' : 'Live Analysis'}
          </span>
        </div>
        
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
          {finalData.events && finalData.events.length > 0 ? (
            finalData.events.map((event: any, index: number) => {
              const style = getEventStyle(event.type);
              return (
                <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${style.color} shadow-lg`}>
                      {style.icon}
                    </div>
                    <div>
                      <p className="text-white font-black text-sm tracking-tight">{event.type}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black italic">Instance Captured</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className={`text-xs font-black ${style.color.split(' ')[1]}`}>{event.impact}%</p>
                      <p className="text-[8px] text-white/20 uppercase font-black">Intensity</p>
                    </div>
                    <div className="bg-black/30 px-4 py-2 rounded-xl border border-white/5">
                      <span className="text-white/60 text-xs font-mono font-bold">{event.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <AlertCircle size={48} className="text-white mb-4" />
              <p className="text-white font-black uppercase tracking-widest text-center">
                No Distraction Events Found
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const MiniStatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 group transition-transform hover:scale-105">
    <div className={`inline-flex p-3 rounded-2xl bg-black/20 ${color} mb-4`}>
      {icon}
    </div>
    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

export default Distractions;