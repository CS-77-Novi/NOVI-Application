"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Target, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Props passed from the parent dashboard to determine which API to fetch
interface AttentionScoreBoardProps {
    role: 'individual' | 'teacher';
}

// Dummy data matching the zeroed-out state used as a fallback or loading placeholder
const emptyChartData = [
    { time: '00:00', attention: 0 },
    { time: '05:00', attention: 0 },
    { time: '10:00', attention: 0 },
    { time: '15:00', attention: 0 },
    { time: '20:00', attention: 0 },
    { time: '25:00', attention: 0 },
    { time: '30:00', attention: 0 },
];

export default function AttentionScoreBoard({ role }: AttentionScoreBoardProps) {
    // Authenticated user from Clerk
    const { user } = useUser();
    
    // Component State
    const [chartData, setChartData] = useState(emptyChartData); // Recharts data array
    const [avgAttention, setAvgAttention] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [meetingId, setMeetingId] = useState<string>('');
    const [meetingDateTime, setMeetingDateTime] = useState<string>('');

    // Fetch metric data from the server whenever the role or Auth ID changes
    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            
            // Branch based on the provided role
            if (role === 'teacher') {
                // Fetch teacher attention score data
                try {
                    const res = await fetch(`/api/report/teacher/attention_score?host_id=${user?.id}`);
                    const json = await res.json();
                    
                    if (json.ok && json.data && json.data.length > 0) {
                        setChartData(json.data);
                        
                        // Calculate average attention score dynamically from the payload
                        const sum = json.data.reduce((acc: number, curr: any) => acc + curr.attention, 0);
                        setAvgAttention(Math.round(sum / json.data.length));
                        
                        // Store metadata
                        if (json.meeting_id) setMeetingId(json.meeting_id);
                        if (json.date_time) setMeetingDateTime(json.date_time);
                    } else {
                        // Reset to empty data if nothing valid was returned
                        setChartData(emptyChartData);
                        setAvgAttention(0);
                    }
                } catch (e) {
                    console.error("Failed to fetch attention score data", e);
                    setChartData(emptyChartData);
                    setAvgAttention(0);
                }
            } else {
                // Fetch individual attention score data
                try {
                    const res = await fetch(`/api/report/individual/attention_score?host_id=${user?.id}`);
                    const json = await res.json();
                    
                    if (json.ok && json.data && json.data.length > 0) {
                        setChartData(json.data);
                        
                        // Calculate average attention score dynamically
                        const sum = json.data.reduce((acc: number, curr: any) => acc + curr.attention, 0);
                        setAvgAttention(Math.round(sum / json.data.length));
                        
                        // Individual endpoints use session_id instead of meeting_id
                        if (json.session_id) setMeetingId(json.session_id);
                    } else {
                        setChartData(emptyChartData);
                        setAvgAttention(0);
                    }
                } catch (e) {
                    console.error("Failed to fetch individual attention score data", e);
                    setChartData(emptyChartData);
                    setAvgAttention(0);
                }
            }
            setLoading(false);
        };
        fetchMetrics();
    }, [role, user?.id]);

    return (
        <>
            {/* Render block for the Teacher role */}
            {role === 'teacher' && (
                <div className="flex flex-col flex-1 animate-fade-in bg-gradient-to-br from-[#185cab] to-[#9d17bd] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px] w-full relative">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-2 w-full">
                        <div className="flex flex-col gap-2">
                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-[#ecfeff]" strokeWidth={2.5} />
                                <h2 className="text-3xl font-black text-[#ecfeff] tracking-tight">Attention Analysis</h2>
                            </div>
                            
                            {/* Empty state alert if no graph data is available */}
                            {avgAttention === 0 && (
                                <div className="flex items-center gap-2 text-[#2c7a9e] font-semibold text-sm ml-1">
                                    <AlertCircle className="w-4 h-4 text-[#ecfeff]" strokeWidth={2.5} />
                                    <span className="text-[#ecfeff] italic">Waiting for session metrics...</span>
                                </div>
                            )}
                            
                            {/* Meeting identifiers */}
                            {meetingId && (
                                <div className="flex flex-col gap-1 mt-1 ml-1">
                                    <span className="text-[#ecfeff] text-1xl font-bold">Meeting ID: <span className="font-semibold">{meetingId}</span></span>
                                    {meetingDateTime && (
                                        <span className="text-[#ecfeff] text-1xl font-bold">
                                            {new Date(meetingDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            {' · '}
                                            {new Date(meetingDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Average Attention Badge */}
                        <div className="bg-card text-card-foreground px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
                            <span className="text-[#43a5d1] text-[10px] font-black tracking-widest uppercase mb-1">Avg Attention</span>
                            <span className="text-3xl font-black text-[#43a5d1] leading-none">{avgAttention}%</span>
                        </div>
                    </div>

                    {/* Recharts Area Container */}
                    <div className="flex-1 mt-4 bg-card text-card-foreground rounded-3xl p-6 shadow-sm border border-border pt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#43a5d1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#43a5d1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107,50,201,0.15)" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#43a5d1', fontSize: 12, fontWeight: 'bold' }} 
                                    dy={10}
                                    minTickGap={30}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    ticks={[0, 25, 50, 75, 100]} 
                                    stroke="#43a5d1(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#43a5d1', fontSize: 12, fontWeight: 'bold' }} 
                                    dx={-10}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="attention" 
                                    stroke="#43a5d1" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorAttention)" 
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Render block for the Individual role */}
            {role === 'individual' && (
                <div className="flex flex-col flex-1 animate-fade-in bg-gradient-to-br from-[#185cab] to-[#9d17bd] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px] w-full relative">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-2 w-full">
                        <div className="flex flex-col gap-2">
                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-[#ecfeff]" strokeWidth={2.5} />
                                <h2 className="text-3xl font-black text-[#ecfeff] tracking-tight">Attention Analysis</h2>
                            </div>
                            
                            {/* Empty state alert */}
                            {avgAttention === 0 && (
                                <div className="flex items-center gap-2 font-semibold text-sm ml-1">
                                    <AlertCircle className="w-4 h-4 text-[#ecfeff]" strokeWidth={2.5} />
                                    <span className="text-[#ecfeff] italic">Waiting for session metrics...</span>
                                </div>
                            )}
                            
                            {/* Session ID */}
                            {meetingId && (
                                <div className="flex flex-col gap-1 mt-1 ml-1">
                                    <span className="text-[#ecfeff] text-1xl font-bold">Session ID: <span className="font-semibold">{meetingId}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Average Attention Badge */}
                        <div className="bg-card text-card-foreground px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
                            <span className="text-[#43a5d1] text-[10px] font-black tracking-widest uppercase mb-1">Avg Attention</span>
                            <span className="text-3xl font-black text-[#43a5d1] leading-none">{avgAttention}%</span>
                        </div>
                    </div>

                    {/* Recharts Area Container */}
                    <div className="flex-1 mt-4 bg-card text-card-foreground rounded-3xl p-6 shadow-sm border border-border pt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAttentionInd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#43a5d1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#43a5d1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107,50,201,0.15)" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#43a5d1', fontSize: 12, fontWeight: 'bold' }} 
                                    dy={10}
                                    minTickGap={30}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    ticks={[0, 25, 50, 75, 100]} 
                                    stroke="rgba(217,70,239,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#43a5d1', fontSize: 12, fontWeight: 'bold' }} 
                                    dx={-10}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="attention" 
                                    stroke="#43a5d1" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorAttentionInd)" 
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
    );
}
