'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, EyeOff, UserX, Ghost, Coffee, Loader2 } from 'lucide-react';

interface DistractionsProps {
  meetingId?: string | number;
  participantId?: string | number;
  data?: any; // Fallback prop
}

const Distractions = ({ meetingId, participantId, data }: DistractionsProps) => {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetching logic to connect to your database tables
  useEffect(() => {
    const fetchDistractionData = async () => {
      if (!meetingId || !participantId) return;
      
      setLoading(true);
      try {
        // Replace with your actual API endpoint that queries meeting_distraction table
        const response = await fetch(`/api/distractions?meetingId=${meetingId}&participantId=${participantId}`);
        const result = await response.json();
        setDbData(result);
      } catch (error) {
        console.error("Error fetching database distraction stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistractionData();
  }, [meetingId, participantId]);

  // 2. Data Selection: Priority = DB Data -> Prop Data -> Dummy Data
  const dummyDistractionData = {
    distracted_checks: 5,
    head_pose_count: 2,
    eye_closure_count: 4,
    yawning_count: 1,
    events: [
      { type: 'Looking Away', time: '05:23', impact: 88 },
      { type: 'Eye Closure', time: '12:45', impact: 92 },
      { type: 'Head Pose Deviation', time: '15:12', impact: 75 },
      { type: 'Yawning', time: '22:56', impact: 40 },
    ]
  };

  const finalData = dbData || data || dummyDistractionData;

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'Looking Away': return { color: 'bg-red-500/20 text-red-400', icon: <EyeOff size={18} /> };
      case 'Eye Closure': return { color: 'bg-orange-500/20 text-orange-400', icon: <Ghost size={18} /> };
      case 'Head Pose Deviation': return { color: 'bg-purple-500/20 text-purple-400', icon: <UserX size={18} /> };
      case 'Yawning': return { color: 'bg-blue-500/20 text-blue-400', icon: <Coffee size={18} /> };
      default: return { color: 'bg-slate-500/20 text-slate-400', icon: <AlertCircle size={18} /> };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-black/10 rounded-[2.5rem]">
        <Loader2 className="animate-spin text-white/50" size={40} />
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-[#BC66A9] to-[#7E43BC] p-10 rounded-[2.5rem] shadow-2xl w-full animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-center">
        <h3 className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-xl font-bold text-white text-sm inline-block">
          Distraction Analysis
        </h3>
        {meetingId && (
          <span className="text-[10px] text-white/40 font-mono">ID: {meetingId}</span>
        )}
      </div>

      {/* Summary Stats - Mapped to meeting_distraction columns */}
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
            {dbData ? 'Stored Session' : 'Live Analysis'}
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
                      <span className="text-white/60 text-xs font-mono font-bold">
                        {/* Format timestamp if it comes from DB */}
                        {event.time.includes('T') ? new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : event.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-20 opacity-30">
                <AlertCircle size={48} className="mx-auto mb-4 text-white" />
                <p className="text-white uppercase font-black tracking-widest text-sm italic">No Distraction Events Detected Yet</p>
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
    <p className="text-[8px] text-white/10 font-bold uppercase mt-1">Total Count</p>
  </div>
);

export default Distractions;