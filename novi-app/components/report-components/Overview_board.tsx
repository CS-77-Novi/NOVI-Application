"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowUpDown } from 'lucide-react';

// Define the expected props for the OverviewBoard component
interface OverviewBoardProps {
    role: 'teacher';
}

// Define the shape of a single distraction record returned by the API
interface DistractionRecord {
    participant_name: string;
    distraction_percentage: number;
}

export default function OverviewBoard({ role }: OverviewBoardProps) {
    // Access the currently authenticated user from Clerk
    const { user } = useUser();
    
    // State to hold the list of distraction records from the API
    const [distractions, setDistractions] = useState<DistractionRecord[]>([]);
    
    // State to track if the API request is currently loading
    const [loading, setLoading] = useState(false);
    
    // State to hold the formatted date of the most recent session
    const [sessionDate, setSessionDate] = useState<string | null>(null);

    // State to hold the formatted time of the most recent session
    const [sessionTime, setSessionTime] = useState<string | null>(null);

    // State to hold the meeting ID of the most recent session
    const [meetingId, setMeetingId] = useState<string | null>(null);
    
    // State for the distraction filter threshold input (default '75')
    const [threshold, setThreshold] = useState<string>('75');
    
    // State to determine the sort order of the distraction list
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Effect hook to fetch data whenever threshold or sortOrder changes
    useEffect(() => {
        // Only fetch if the user ID is available
        if (user?.id) {
            const fetchDistractions = async () => {
                setLoading(true);
                try {
                    // Default to 75 if the user completely clears the input field
                    const currentThreshold = threshold === '' ? 75 : Number(threshold);
                    
                    // Fetch from the API, passing threshold, sort order, and the essential host_id for filtering
                    const res = await fetch(`/api/report/teacher/overview?threshold=${currentThreshold}&sort=${sortOrder}&host_id=${user.id}`);
                    const json = await res.json();
                    
                    // If the response is successful, update state with the retrieved data
                    if (json.ok) {
                        setDistractions(json.data.distractions || []);
                        
                        // Set meeting ID if it exists
                        if (json.data.meetingId) {
                            setMeetingId(json.data.meetingId);
                        }
                        // Parse date and time from meetingDateTime
                        if (json.data.meetingDateTime) {
                            const dt = new Date(json.data.meetingDateTime);
                            setSessionDate(dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
                            setSessionTime(dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                        } else if (json.data.sessionDate) {
                            setSessionDate(new Date(json.data.sessionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch distractions', err);
                } finally {
                    // Always disable the loading state when the fetch is complete
                    setLoading(false);
                }
            };
            fetchDistractions();
        }
    }, [threshold, sortOrder, user?.id]);

    return (
        <div className="flex flex-col flex-1 animate-fade-in bg-[#D946EF] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px]">
            <p className="text-white/80 text-[15px] font-medium mb-8">A quick overview of your previous classes' performance and aggregated metrics.</p>
                    
                    <div className="text-white text-base w-full">
                        
                        {/* Header displaying meeting info as a single row */}
                        <div className="bg-[#f4effc] w-max px-6 py-3 rounded-2xl mb-8 flex items-center gap-10 font-bold shadow-md">
                            {meetingId && (
                                <span className="text-[#D946EF]/80 text-sm">Meeting ID: <span className="text-[#D946EF]">{meetingId}</span></span>
                            )}
                            <span className="text-[#D946EF]/80 text-sm">Date: {sessionDate ? (
                                <span className="text-[#D946EF]">{sessionDate}</span>
                            ) : (
                                <span className="text-[#D946EF]/50">No recent sessions</span>
                            )}</span>
                            {sessionTime && (
                                <span className="text-[#D946EF]/80 text-sm">Time: <span className="text-[#D946EF]">{sessionTime}</span></span>
                            )}
                        </div>

                        {/* Interactive UI controls for filtering and sorting the data */}
                        <div className="flex flex-col bg-[#f4effc] rounded-[24px] shadow-sm overflow-hidden w-full">
                            <div className="bg-[#f4effc] px-6 py-4 flex flex-wrap items-center gap-6 border-b border-white/10">
                                {/* Threshold Input filter control */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold tracking-wide text-[#D946EF]">DISTRACTION &gt;</span>
                                    <div className="bg-[#D946EF] rounded-lg flex items-center px-1">
                                        <input 
                                            type="number" 
                                            value={threshold}
                                            onChange={(e) => setThreshold(e.target.value)}
                                            className="w-14 h-8 px-2 bg-transparent text-white font-bold text-center border-none focus:ring-0 outline-none"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-white font-bold pr-2">%</span>
                                    </div>
                                </div>
                                {/* Sort Order Toggle Button */}
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#D946EF] hover:bg-[#c026d3] transition-colors text-white font-bold text-sm"
                                >
                                    <ArrowUpDown className="w-4 h-4" strokeWidth={2.5} />
                                    {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
                                </button>
                            </div>

                            {/* Main display area for distraction records */}
                            <div className="p-6 flex flex-col gap-4 min-h-[250px] w-full">
                                {/* Loading state pulse indicator */}
                                {loading && <div className="text-[#D946EF]/70 font-bold animate-pulse text-center py-16 flex-1 flex flex-col items-center justify-center">Loading data...</div>}
                                
                                {/* Empty state indicator when no records match filter criteria */}
                                {!loading && distractions.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-[#D946EF]/90 font-bold text-center py-24 px-8 w-full bg-white/[0.04] rounded-xl border border-white/5 shadow-inner">
                                        {threshold === '' 
                                            ? "Please enter a percentage to filter." 
                                            : `No distraction percentages > ${threshold}% recorded in the session.`}
                                    </div>
                                )}
                                
                                {/* Iterate and render each individual mapped distraction card */}
                                {!loading && distractions.map((d, i) => (
                                    <div key={i} className="bg-[#D946EF] p-5 rounded-2xl flex justify-between items-center shadow-sm border border-white/5">
                                        <div className="font-bold text-white text-lg">{d.participant_name}</div>
                                        <div className="flex items-center gap-2 bg-[#f4effc] px-4 py-2 rounded-xl">
                                            <span className="text-[#D946EF] text-sm font-bold tracking-wide uppercase">Distracted:</span>
                                            <span className="font-black text-[#D946EF]">{Math.round(d.distraction_percentage)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
        </div>
    );
}