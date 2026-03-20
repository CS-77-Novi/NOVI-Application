"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Target, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface AttentionScoreBoardProps {
    role: 'individual' | 'teacher';
}

// Dummy data matching the zeroed-out state
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
    const { user } = useUser();
    const [chartData, setChartData] = useState(emptyChartData);
    const [avgAttention, setAvgAttention] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Fetch API data matching the role
        const fetchMetrics = async () => {
            setLoading(true);
            if (role === 'teacher') {
                // Fetch real data from the newly fixed endpoint
                try {
                    const res = await fetch(`/api/report/teacher/attention_score?host_id=${user?.id}`);
                    const json = await res.json();
                    
                    if (json.ok && json.data && json.data.length > 0) {
                        setChartData(json.data);
                        // Calculate average dynamically
                        const sum = json.data.reduce((acc: number, curr: any) => acc + curr.attention, 0);
                        setAvgAttention(Math.round(sum / json.data.length));
                    } else {
                        setChartData(emptyChartData);
                        setAvgAttention(0);
                    }
                } catch (e) {
                    console.error("Failed to fetch attention score data", e);
                    setChartData(emptyChartData);
                    setAvgAttention(0);
                }
            } else {
                // Dummy data for individual view
                setChartData([
                    { time: '00:00', attention: 0 },
                    { time: '05:00', attention: 0 },
                    { time: '10:00', attention: 0 },
                    { time: '15:00', attention: 0 },
                    { time: '20:00', attention: 0 },
                ]);
                setAvgAttention(0);
            }
            setLoading(false);
        };
        fetchMetrics();
    }, [role, user?.id]);

    return (
        <>
            {role === 'teacher' && (
                <div className="flex flex-col flex-1 animate-fade-in bg-[#B164D3] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px] w-full relative">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 w-full">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-[#541c6d]" strokeWidth={2.5} />
                                <h2 className="text-3xl font-black text-[#541c6d] tracking-tight">Attention Analysis</h2>
                            </div>
                            {avgAttention === 0 && (
                                <div className="flex items-center gap-2 text-[#9E4DBC] font-semibold text-sm ml-1">
                                    <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
                                    <span className="italic">Waiting for session metrics...</span>
                                </div>
                            )}
                        </div>

                        {/* Avg Attention Block */}
                        <div className="bg-[#E3D4F4]/70 px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
                            <span className="text-[#813bad] text-[10px] font-black tracking-widest uppercase mb-1">Avg Attention</span>
                            <span className="text-3xl font-black text-[#6B32C9] leading-none">{avgAttention}%</span>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="flex-1 mt-4 bg-[#f4effc] rounded-3xl p-6 shadow-sm border border-purple-100 pt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#813bad" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#813bad" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107,50,201,0.15)" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6B32C9', fontSize: 12, fontWeight: 'bold' }} 
                                    dy={10}
                                    minTickGap={30}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    ticks={[0, 25, 50, 75, 100]} 
                                    stroke="rgba(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6B32C9', fontSize: 12, fontWeight: 'bold' }} 
                                    dx={-10}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="attention" 
                                    stroke="#6B32C9" 
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

            {role === 'individual' && (
                <div className="flex flex-col flex-1 animate-fade-in bg-[#B164D3] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px] w-full relative">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 w-full">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-[#541c6d]" strokeWidth={2.5} />
                                <h2 className="text-3xl font-black text-[#541c6d] tracking-tight">Attention Analysis</h2>
                            </div>
                            {avgAttention === 0 && (
                                <div className="flex items-center gap-2 text-[#9E4DBC] font-semibold text-sm ml-1">
                                    <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
                                    <span className="italic">Waiting for session metrics...</span>
                                </div>
                            )}
                        </div>

                        {/* Avg Attention Block */}
                        <div className="bg-[#E3D4F4]/70 px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
                            <span className="text-[#813bad] text-[10px] font-black tracking-widest uppercase mb-1">Avg Attention</span>
                            <span className="text-3xl font-black text-[#6B32C9] leading-none">{avgAttention}%</span>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="flex-1 mt-4 bg-[#f4effc] rounded-3xl p-6 shadow-sm border border-purple-100 pt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#813bad" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#813bad" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107,50,201,0.15)" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="rgba(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6B32C9', fontSize: 12, fontWeight: 'bold' }} 
                                    dy={10}
                                    minTickGap={30}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    ticks={[0, 25, 50, 75, 100]} 
                                    stroke="rgba(107,50,201,0.4)" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6B32C9', fontSize: 12, fontWeight: 'bold' }} 
                                    dx={-10}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="attention" 
                                    stroke="#6B32C9" 
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
        </>
    );
}
