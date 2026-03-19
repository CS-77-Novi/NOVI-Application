'use client';

import React from 'react';
import { AlertCircle, EyeOff, UserX, Ghost, Coffee } from 'lucide-react';

interface DistractionEvent {
  type: string;
  time: string;
}

interface DistractionsProps {
  data: any; // Using any to handle the dynamic API structure
}

const Distractions = ({ data }: DistractionsProps) => {
  // REMOVED the "return null" so it shows even if data is empty
  
  const getEventStyle = (type: string) => {
    switch (type) {
      case 'Looking Away': return { color: 'bg-red-500/20 text-red-400', icon: <EyeOff size={18} /> };
      case 'Eye Closure': return { color: 'bg-orange-500/20 text-orange-400', icon: <Ghost size={18} /> };
      case 'Head Pose Deviation': return { color: 'bg-purple-500/20 text-purple-400', icon: <UserX size={18} /> };
      default: return { color: 'bg-blue-500/20 text-blue-400', icon: <AlertCircle size={18} /> };
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#7E43BC] to-[#4B1B7D] p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex justify-between items-center">
        <h3 className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-xl font-bold text-white text-sm inline-block">
          Distraction Analysis
        </h3>
      </div>

      {/* Summary Stats Cards - MATCHED TO API KEY NAMES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MiniStatCard label="Looking Away" value={data?.looking_away_count ?? 0} icon={<EyeOff size={20} />} color="text-red-400" />
        <MiniStatCard label="Head Pose" value={data?.head_pose_count ?? 0} icon={<UserX size={20} />} color="text-purple-400" />
        <MiniStatCard label="Eye Closure" value={data?.eye_closure_count ?? 0} icon={<Ghost size={20} />} color="text-orange-400" />
        <MiniStatCard label="Yawning" value={data?.yawning_count ?? 0} icon={<Coffee size={20} />} color="text-blue-400" />
      </div>

      {/* Timeline Section */}
      <div className="bg-black/20 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10">
        <h4 className="text-white/60 text-xs font-black uppercase tracking-widest mb-6 px-2">Event Timeline</h4>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {data?.events && data.events.length > 0 ? (
            data.events.map((event: any, index: number) => {
              const style = getEventStyle(event.type);
              return (
                <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${style.color}`}>
                      {style.icon}
                    </div>
                    <span className="text-white font-bold text-sm">{event.type}</span>
                  </div>
                  <span className="text-white/40 text-xs font-mono bg-black/20 px-3 py-1 rounded-full">
                    {event.time}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-white/40 italic">No distraction events detected yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const MiniStatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 transition-transform hover:scale-105">
    <div className={`${color} mb-3`}>{icon}</div>
    <p className="text-white/40 text-[10px] font-black uppercase tracking-tighter mb-1">{label}</p>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

export default Distractions;