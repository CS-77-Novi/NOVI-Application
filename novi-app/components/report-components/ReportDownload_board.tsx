'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileText, Download, ArrowUpDown, Trash2 } from 'lucide-react';

interface ReportDownloadBoardProps {
    role: 'individual' | 'teacher';
}

interface SessionRecord {
    file_name: string;
    session_id: string;
    generated_date: string;
    generated_time: string;
}

export default function ReportDownloadBoard({ role }: ReportDownloadBoardProps) {
    const { user } = useUser();
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        const fetchSessions = async () => {
            if (role !== 'teacher' || !user?.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/report/teacher/display_report?host_id=${user.id}`);
                const json = await res.json();

                if (json.ok && json.data && json.data.length > 0) {
                    setSessions(json.data);
                } else {
                    setSessions([]);
                }
            } catch (e) {
                console.error('Failed to fetch download report data', e);
                setSessions([]);
            }
            setLoading(false);
        };
        fetchSessions();
    }, [role, user?.id]);

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const dateA = new Date(`${a.generated_date} ${a.generated_time}`).getTime();
            const dateB = new Date(`${b.generated_date} ${b.generated_time}`).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [sessions, sortOrder]);

    const handleDownload = async (fileName: string) => {
        try {
            const res = await fetch(`/api/report/teacher/download_report?file_name=${encodeURIComponent(fileName)}`);
            const json = await res.json();
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

    const [deleteTarget, setDeleteTarget] = useState<{ fileName: string; sessionId: string } | null>(null);

    const handleDeleteClick = (fileName: string, sessionId: string) => {
        setDeleteTarget({ fileName, sessionId });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch('/api/report/teacher/delete_report', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_name: deleteTarget.fileName, session_id: deleteTarget.sessionId }),
            });
            const json = await res.json();
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
        <>
            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-[420px] w-full mx-4 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2.5 rounded-xl">
                                <Trash2 className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#2d1a4e]">Delete Report</h3>
                        </div>
                        <p className="text-[#8ba3b8] text-sm font-medium leading-relaxed mb-6">
                            Are you sure you want to permanently delete this report? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm text-[#6B32C9] bg-[#f4effc] hover:bg-[#ece3f8] transition-colors border border-purple-200"
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

            {role === 'teacher' && (
                <div className="flex flex-col flex-1 animate-fade-in w-full">
                    {/* Header Card */}
                    <div className="bg-white rounded-[24px] p-8 shadow-sm border-2 border-[#D946EF] w-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-[#D946EF] tracking-tight">Archived Sessions</h2>
                                <p className="text-[#8ba3b8] font-medium text-sm mt-2">
                                    Sessions are <span className="text-[#D946EF] font-semibold">automatically synced</span> and stored here for your review.
                                </p>
                            </div>
                            {sessions.length > 1 && (
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f4effc] hover:bg-[#ece3f8] transition-colors text-[#D946EF] font-bold text-sm border border-purple-200"
                                >
                                    <ArrowUpDown className="w-4 h-4" strokeWidth={2.5} />
                                    {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="mt-6 text-[#9E4DBC] font-bold animate-pulse text-center py-16">Loading sessions...</div>
                    )}

                    {/* Session Cards */}
                    {!loading && sortedSessions.length > 0 && (
                        <div className="flex flex-col gap-5 mt-6">
                            {sortedSessions.map((session, index) => (
                                <div key={index} className="bg-[#D946EF] rounded-[20px] p-6 shadow-sm flex items-center justify-between w-full">
                                    <div className="flex flex-col gap-3 flex-1">
                                        {/* Meeting ID */}
                                        <div className="bg-white rounded-xl px-5 py-3 max-w-[550px]">
                                            <span className="text-[#D946EF] font-bold text-sm">Meeting ID: <span className="font-semibold text-[#9E4DBC]">{session.session_id}</span></span>
                                        </div>
                                        {/* Date & Time */}
                                        <div className="flex gap-3">
                                            <div className="bg-white rounded-xl px-5 py-2.5 min-w-[180px]">
                                                <span className="text-[#D946EF] font-bold text-sm">Generated Date: <span className="font-semibold text-[#9E4DBC]">{session.generated_date}</span></span>
                                            </div>
                                            <div className="bg-white rounded-xl px-5 py-2.5 min-w-[180px]">
                                                <span className="text-[#D946EF] font-bold text-sm">Generated Time: <span className="font-semibold text-[#9E4DBC]">{session.generated_time}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
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

                    {/* Empty State */}
                    {!loading && sessions.length === 0 && (
                        <div className="mt-6 bg-[#f4effc] rounded-[24px] p-8 shadow-sm border-2 border-dashed border-purple-200 flex flex-col items-center justify-center min-h-[250px] w-full">
                            <FileText className="w-12 h-12 text-[#c4b0dc] mb-4" strokeWidth={1.5} />
                            <p className="text-[#9E4DBC]/60 font-medium text-sm italic text-center">
                                Your archive is empty. Completed sessions will appear here automatically.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {role === 'individual' && (
                <div className="flex flex-col flex-1 animate-fade-in w-full">
                    {/* Header Card */}
                    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-purple-100 w-full">
                        <h2 className="text-3xl font-black text-[#2d1a4e] tracking-tight">Archived Sessions</h2>
                        <p className="text-[#8ba3b8] font-medium text-sm mt-2">
                            Sessions are <span className="text-[#6B32C9] font-semibold">automatically synced</span> and stored here for your review.
                        </p>
                    </div>

                    {/* Empty State Card */}
                    <div className="mt-6 bg-[#f4effc] rounded-[24px] p-8 shadow-sm border-2 border-dashed border-purple-200 flex flex-col items-center justify-center min-h-[250px] w-full">
                        <FileText className="w-12 h-12 text-[#c4b0dc] mb-4" strokeWidth={1.5} />
                        <p className="text-[#9E4DBC]/60 font-medium text-sm italic text-center">
                            Your archive is empty. Completed sessions will appear here automatically.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
