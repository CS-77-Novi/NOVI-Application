"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Clock, Eye, EyeOff } from 'lucide-react';

interface IndOverviewBoardProps {
    role: 'individual';
}

interface SessionData {
    session_id: string;
    host_id: string;
    session_time: string;
    attentive_time: string;
    distracted_time: string;
}

// Helper to parse HH:MM:SS time string into total seconds
const timeToSeconds = (time: string): number => {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
};

// Helper to format total seconds into a display string (e.g. "5m 32s" or "1h 2m")
const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds === 0) return '0:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function IndOverviewBoard({ role }: IndOverviewBoardProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState<SessionData[]>([]);

    useEffect(() => {
        if (user?.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/report/individual/overview?host_id=${user.id}`);
                    const json = await res.json();
                    if (json.ok) {
                        setSessionData(json.data || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch individual overview:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user?.id]);

    // Aggregate totals across all sessions
    const totals = sessionData.reduce(
        (acc, row) => {
            acc.session += timeToSeconds(row.session_time);
            acc.attentive += timeToSeconds(row.attentive_time);
            acc.distracted += timeToSeconds(row.distracted_time);
            return acc;
        },
        { session: 0, attentive: 0, distracted: 0 }
    );

    return (
        <div className="flex flex-col flex-1 animate-fade-in bg-[#D946EF] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#f4effc] w-max px-5 py-2 rounded-xl">
                    <span className="text-[#D946EF] font-bold text-sm tracking-wide">Overview</span>
                </div>
                {sessionData.length > 0 && (
                    <span className="text-white/80 text-1x1 font-bold">
                        Session ID: <span className="text-white">{sessionData[0].session_id}</span>
                    </span>
                )}
            </div>

            {/* Metric Boxes */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                {/* Total Session Duration */}
                <div className="bg-[#f4effc] rounded-[20px] p-6 flex flex-col items-center gap-4 shadow-md">
                    <div className="bg-[#D946EF] p-3 rounded-full">
                        <Clock className="w-6 h-6 text-[#f4effc]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-[#D946EF] uppercase text-center">
                        Total Session Duration
                    </span>
                    <span className="text-3xl font-black text-[#D946EF]">
                        {loading ? '...' : formatDuration(totals.session)}
                    </span>
                </div>

                {/* Attentive Duration */}
                <div className="bg-[#f4effc] rounded-[20px] p-6 flex flex-col items-center gap-4 shadow-md">
                    <div className="bg-[#D946EF] p-3 rounded-full">
                        <Eye className="w-6 h-6 text-[#f4effc]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-[#D946EF] uppercase text-center">
                        Attentive Duration
                    </span>
                    <span className="text-3xl font-black text-[#D946EF]">
                        {loading ? '...' : formatDuration(totals.attentive)}
                    </span>
                </div>

                {/* Distraction Duration */}
                <div className="bg-[#f4effc] rounded-[20px] p-6 flex flex-col items-center gap-4 shadow-md">
                    <div className="bg-[#D946EF] p-3 rounded-full">
                        <EyeOff className="w-6 h-6 text-[#f4effc]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-[#D946EF] uppercase text-center">
                        Distraction Duration
                    </span>
                    <span className="text-3xl font-black text-[#D946EF]">
                        {loading ? '...' : formatDuration(totals.distracted)}
                    </span>
                </div>
            </div>

            {/* Session Summary Section */}
            <div className="bg-[#c026d3]/60 rounded-[24px] p-6 flex flex-col gap-5 border-2 border-[#f4effc]">
                <div className="bg-[#f4effc] w-max px-4 py-1.5 rounded-xl">
                    <span className="text-[#D946EF] font-bold text-xs tracking-widest uppercase">Session Summary</span>
                </div>

                {loading ? (
                    <div className="text-white/70 font-bold animate-pulse text-center py-8">Loading data...</div>
                ) : sessionData.length === 0 ? (
                    <div className="text-white/70 font-bold text-center py-8">No session data found. Start an individual learning session first.</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-[#D946EF] p-2 rounded-full mt-0.5">
                                <Clock className="w-4 h-4 text-[#f4effc]" strokeWidth={2.5} />
                            </div>
                            <p className="text-white/90 text-sm leading-relaxed">
                                This session lasted <strong>{formatDuration(totals.session)}</strong>, during which the learner maintained an average attention score of <strong>{totals.session > 0 ? Math.round((totals.attentive / totals.session) * 100) : 0}%</strong>.
                            </p>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="bg-[#D946EF] p-2 rounded-full mt-0.5">
                                <EyeOff className="w-4 h-4 text-[#f4effc]" strokeWidth={2.5} />
                            </div>
                            <p className="text-white/90 text-sm leading-relaxed">
                                A total of <strong>{formatDuration(totals.distracted)}</strong> of distraction time was detected during the session, representing <strong>{totals.session > 0 ? Math.round((totals.distracted / totals.session) * 100) : 0}%</strong> of the total session time.
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-[#D946EF] p-2 rounded-full mt-0.5">
                                <Eye className="w-4 h-4 text-[#f4effc]" strokeWidth={2.5} />
                            </div>
                            <p className="text-white/90 text-sm leading-relaxed">
                                No engagement was detected for <strong>{formatDuration(totals.session-(totals.distracted+totals.attentive))}</strong> seconds.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
