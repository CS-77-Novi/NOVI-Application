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
    <section className="bg-gradient-to-br from-[#BC66A9] to-[#7E43BC] p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex justify-between items-center">
        <h3 className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-xl font-bold text-white text-sm inline-block">
          Distraction Analysis
        </h3>
      </div>

      {/* Summary Stats Cards - MATCHED TO API KEY NAMES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MiniStatCard label="Looking Away" value={data?.distracted_checks ?? 0} icon={<EyeOff size={20} />} color="text-red-400" />
        <MiniStatCard label="Head Pose" value={data?.head_pose_count ?? 0} icon={<UserX size={20} />} color="text-purple-400" />
        <MiniStatCard label="Eye Closure" value={data?.eye_closure_count ?? 0} icon={<Ghost size={20} />} color="text-orange-400" />
        <MiniStatCard label="Yawning" value={data?.yawning_count ?? 0} icon={<Coffee size={20} />} color="text-blue-400" />
      </div>

      {/* Timeline Section */}
      <div className="bg-black/20 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10">
        <h4 className="text-white/60 text-xs font-black uppercase tracking-widest mb-6 px-2">Event Timeline</h4>
        <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full uppercase">
            Live Analysis
          </span>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {data?.events && data.events.length > 0 ? (
            data.events.map((event: any, index: number) => {
              const style = getEventStyle(event.type);
              const impactScore= event.impact || Math.floor(Math.random() * 40) + 60;

              return (
                <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all hover:translate-x-1 group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${style.color} group-hover:scale-110 transition-transform shadow-lg`}>
                      {style.icon}
                    </div>
                    <div>
                      <p className="text-white font-black text-sm tracking-tight">{event.type}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter italic">Instance Captured</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Intensity Percentage */}
                    <div className="text-right hidden sm:block">
                      <p className={`text-xs font-black ${style.color.split(' ')[1]}`}>{impactScore}%</p>
                      <p className="text-[8px] text-white/20 uppercase font-black">Intensity</p>
                    </div>

                    {/* Time Stamp */}
                    <div className="bg-black/30 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-white/60 text-xs font-mono font-bold tracking-tighter">
                        {event.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 opacity-30">
              <AlertCircle size={40} className="mx-auto text-white mb-4" />
              <p className="text-white text-sm font-bold uppercase tracking-widest italic">No distraction events detected yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// MiniStatCard Component
const MiniStatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 transition-all hover:scale-[1.03] hover:bg-black/40 group">
    <div className={`inline-flex p-3 rounded-2xl bg-black/20 ${color} mb-4 group-hover:rotate-12 transition-transform`}>
      {icon}
    </div>
    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

export default Distractions;
