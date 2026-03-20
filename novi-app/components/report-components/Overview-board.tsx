"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// Define the expected props for the OverviewBoard component
interface OverviewBoardProps {
    role: 'individual' | 'teacher';
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
    
    // State for the distraction filter threshold input (default '75')
    const [threshold, setThreshold] = useState<string>('75');
    
    // State to determine the sort order of the distraction list
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Effect hook to fetch data whenever role, threshold, or sortOrder changes
    useEffect(() => {
        // Only fetch if the user is a teacher and the user ID is available
        if (role === 'teacher' && user?.id) {
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
                        
                        // Parse and format the returned session date if it exists
                        if (json.data.sessionDate) {
                            setSessionDate(new Date(json.data.sessionDate).toLocaleDateString());
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
    }, [role, threshold, sortOrder, user?.id]); // Safely include user?.id in dependencies

    return (
        <div className="flex flex-col flex-1 animate-fade-in bg-[#B164D3] rounded-[32px] p-8 mt-2 shadow-sm text-white min-h-[500px]">
            {/* UI for the Individual Role */}
            {role === 'individual' && (
                <>
                    <p className="text-white/80 text-[15px] font-medium mb-8">A quick overview of your personal progress and key metrics.</p>
                    <div className="mt-4 space-y-4">
                        {/* Placeholder for future individual chart implementation */}
                        <div className="h-40 bg-[#9543B8] rounded-2xl animate-pulse shadow-md flex items-center justify-center text-white/50 font-bold">
                            Summary Chart Placeholder
                        </div>
                        {/* Placeholders for future individual metrics */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="h-24 bg-[#9543B8] rounded-[24px] animate-pulse shadow-md flex items-center justify-center text-white/50 font-bold">Metric 1</div>
                             <div className="h-24 bg-[#9543B8] rounded-[24px] animate-pulse shadow-md flex items-center justify-center text-white/50 font-bold">Metric 2</div>
                        </div>
                    </div>
                </>
            )}

            {/* UI for the Teacher Role */}
            {role === 'teacher' && (
                <>
                    <p className="text-white/80 text-[15px] font-medium mb-8">A quick overview of your previous classes' performance and aggregated metrics.</p>
                    
                    <div className="text-white text-base w-full">
                        
                        {/* Header displaying the date of the most recent mapped session */}
                        <div className="bg-[#9543B8] w-max px-6 py-3 rounded-2xl mb-8 flex gap-2 font-bold shadow-md">
                            <span className="text-white/80">Date:</span>
                            {sessionDate ? (
                                <span className="text-white">
                                    {sessionDate}
                                </span>
                            ) : (
                                <span className="text-white/50">No recent sessions</span>
                            )}
                        </div>

                        {/* Interactive UI controls for filtering and sorting the data */}
                        <div className="flex flex-col bg-[#9E4DBC] rounded-[24px] shadow-sm overflow-hidden w-full">
                            <div className="bg-[#9543B8] px-6 py-4 flex flex-wrap items-center gap-6 border-b border-white/10">
                                {/* Threshold Input filter control */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold tracking-wide text-white/90">DISTRACTION &gt;</span>
                                    <div className="bg-[#813bad] rounded-lg flex items-center px-1">
                                        <input 
                                            type="number" 
                                            value={threshold}
                                            onChange={(e) => setThreshold(e.target.value)}
                                            className="w-14 h-8 px-2 bg-transparent text-white font-bold text-center border-none focus:ring-0 outline-none"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-white/70 font-bold pr-2">%</span>
                                    </div>
                                </div>
                                {/* Sort Order Dropdown Select */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold tracking-wide text-white/90">SORT:</span>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                        className="h-8 pl-3 pr-8 rounded-lg bg-[#813bad] border-none text-white font-bold text-sm focus:ring-2 focus:ring-white/20 outline-none cursor-pointer"
                                    >
                                        <option value="desc">Highest First</option>
                                        <option value="asc">Lowest First</option>
                                    </select>
                                </div>
                            </div>

                            {/* Main display area for distraction records */}
                            <div className="p-6 flex flex-col gap-4 min-h-[250px] w-full">
                                {/* Loading state pulse indicator */}
                                {loading && <div className="text-white/70 font-bold animate-pulse text-center py-16 flex-1 flex flex-col items-center justify-center">Loading data...</div>}
                                
                                {/* Empty state indicator when no records match filter criteria */}
                                {!loading && distractions.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-white/90 font-bold text-center py-24 px-8 w-full bg-white/[0.04] rounded-xl border border-white/5 shadow-inner">
                                        {threshold === '' 
                                            ? "Please enter a percentage to filter." 
                                            : `No distraction percentages > ${threshold}% recorded in the session.`}
                                    </div>
                                )}
                                
                                {/* Iterate and render each individual mapped distraction card */}
                                {!loading && distractions.map((d, i) => (
                                    <div key={i} className="bg-[#9543B8] p-5 rounded-2xl flex justify-between items-center shadow-sm border border-white/5">
                                        <div className="font-bold text-white text-lg">{d.participant_name}</div>
                                        <div className="flex items-center gap-2 bg-[#813bad] px-4 py-2 rounded-xl">
                                            <span className="text-white/70 text-sm font-bold tracking-wide uppercase">Distracted</span>
                                            <span className="font-black text-white">{Math.round(d.distraction_percentage)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}