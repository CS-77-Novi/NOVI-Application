'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileText, Download, ArrowUpDown, Trash2 } from 'lucide-react';

// Defines the structure of the session record returned by the database
interface SessionRecord {
    file_name: string;
    session_id: string;
    generated_date: string;
    generated_time: string;
}

export default function IndReportDownloadBoard() {
    // Access the current authenticated user from Clerk
    const { user } = useUser();
    
    // Component State
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [deleteTarget, setDeleteTarget] = useState<{ fileName: string; sessionId: string } | null>(null);

    // Fetch the individual reports for the logged-in user when the component mounts
    useEffect(() => {
        const fetchSessions = async () => {
            // Wait until the user object is fully loaded
            if (!user?.id) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // Call the API endpoint that queries the 'ind_report' table for this specific user
                const res = await fetch(`/api/report/individual/display_report?host_id=${user.id}`);
                const json = await res.json();

                // If successful, populate the sessions array
                if (json.ok && json.data && json.data.length > 0) {
                    setSessions(json.data);
                } else {
                    setSessions([]);
                }
            } catch (e) {
                console.error('Failed to fetch individual download report data:', e);
                setSessions([]);
            }
            setLoading(false);
        };
        fetchSessions();
    }, [user?.id]);

    // Sort the sessions array based on the selected sortOrder ('newest' or 'oldest')
    // useMemo ensures this expensive sorting operation only runs when sessions or sortOrder change
    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const dateA = new Date(`${a.generated_date} ${a.generated_time}`).getTime();
            const dateB = new Date(`${b.generated_date} ${b.generated_time}`).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [sessions, sortOrder]);

    // Handle downloading a specific report file from the Supabase bucket
    const handleDownload = async (fileName: string) => {
        try {
            // Request a securely signed temporary download URL from the server
            const res = await fetch(`/api/report/individual/download_report?file_name=${encodeURIComponent(fileName)}`);
            const json = await res.json();
            
            // If we successfully get the signed URL, trigger a hidden anchor tag click to download it natively
            if (json.ok && json.url) {
                const link = document.createElement('a');
                link.href = json.url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('Failed to get download URL:', json.error);
            }
        } catch (e) {
            console.error('Download failed:', e);
        }
    };

    // Open the confirmation modal by setting the target file information
    const handleDeleteClick = (fileName: string, sessionId: string) => {
        setDeleteTarget({ fileName, sessionId });
    };

    // Confirm and execute the permanent deletion of the report
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            // Send DELETE request to wipe the file from the individual_reports bucket AND the ind_report table
            const res = await fetch('/api/report/individual/delete_report', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_name: deleteTarget.fileName, session_id: deleteTarget.sessionId }),
            });
            const json = await res.json();
            
            // If successful, instantly remove it from the display array so there's no layout flash
            if (json.ok) {
                setSessions(prev => prev.filter(s => s.file_name !== deleteTarget.fileName));
            } else {
                console.error('Delete failed:', json.error);
            }
        } catch (e) {
            console.error('Delete failed:', e);
        }
        setDeleteTarget(null);
    };

    return (
        <div className="flex flex-col flex-1 animate-fade-in w-full">
            {/* Delete Confirmation Modal Overlay */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-2xl max-w-[420px] w-full mx-4 border border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-destructive/10 p-2.5 rounded-xl">
                                <Trash2 className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-foreground">Delete Report</h3>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-6">
                            Are you sure you want to permanently delete this report? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm text-[#2c7a9e] bg-secondary hover:bg-secondary/80 transition-colors border border-border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Card displaying section title and Sorting toggle */}
            <div className="bg-card text-card-foreground rounded-[24px] p-8 shadow-sm border-2 border-border w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-[#43a5d1] tracking-tight">Archived Individual Sessions</h2>
                        <p className="text-muted-foreground font-medium text-sm mt-2">
                            Sessions are <span className="text-[#43a5d1] font-semibold">automatically synced</span> and stored here for your review.
                        </p>
                    </div>
                    {sessions.length > 1 && (
                        <button
                            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-[#43a5d1] font-bold text-sm border border-border"
                        >
                            <ArrowUpDown className="w-4 h-4" strokeWidth={2.5} />
                            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State graphic to show while API is fetching data */}
            {loading && (
                <div className="mt-6 text-primary font-bold animate-pulse text-center py-16">Loading individual sessions...</div>
            )}

            {/* Session Cards list iterating over the sorted sessions */}
            {!loading && sortedSessions.length > 0 && (
                <div className="flex flex-col gap-5 mt-6">
                    {sortedSessions.map((session, index) => (
                        <div key={index} className="bg-gradient-to-br from-[#185cab] to-[#9d17bd] rounded-[20px] p-6 shadow-sm flex items-center justify-between w-full">
                            <div className="flex flex-col gap-3 flex-1">
                                {/* Session ID Block */}
                                <div className="bg-card text-card-foreground rounded-xl px-5 py-3 max-w-[550px]">
                                    <span className="text-[#43a5d1] font-bold text-sm">Session ID: <span className="font-semibold text-[#2c7a9e]">{session.session_id}</span></span>
                                </div>
                                {/* Date & Time Metadata Blocks */}
                                <div className="flex gap-3">
                                    <div className="bg-card text-card-foreground rounded-xl px-5 py-2.5 min-w-[180px]">
                                        <span className="text-[#43a5d1] font-bold text-sm">Generated Date: <span className="font-semibold text-[#2c7a9e]">{session.generated_date}</span></span>
                                    </div>
                                    <div className="bg-card text-card-foreground rounded-xl px-5 py-2.5 min-w-[180px]">
                                        <span className="text-[#43a5d1] font-bold text-sm">Generated Time: <span className="font-semibold text-[#2c7a9e]">{session.generated_time}</span></span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons: Download and Delete */}
                            <div className="flex flex-col gap-2 ml-4">
                                <button onClick={() => handleDownload(session.file_name)} className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl p-3 border border-white/30">
                                    <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </button>
                                <button onClick={() => handleDeleteClick(session.file_name, session.session_id)} className="bg-red-500/20 hover:bg-red-500/40 transition-colors rounded-xl p-3 border border-red-300/30">
                                    <Trash2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State Card shown if the user has no generated reports */}
            {!loading && sessions.length === 0 && (
                <div className="mt-6 bg-card text-card-foreground rounded-[24px] p-8 shadow-sm border-2 border-dashed border-border flex flex-col items-center justify-center min-h-[250px] w-full">
                    <FileText className="w-12 h-12 text-[#c4b0dc] mb-4" strokeWidth={1.5} />
                    <p className="text-[#2c7a9e]/60 font-medium text-sm italic text-center">
                        Your individual archive is empty. Completed individual sessions will appear here automatically.
                    </p>
                </div>
            )}
        </div>
    );
}
