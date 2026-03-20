'use client'

import React, { useState } from 'react'
import OverviewBoard from './Overview-board'
import AttentionScoreBoard from './AttentionScore_board'
import ReportDownloadBoard from './ReportDownload_board'
import { LayoutGrid, Target, AlertCircle, Clock, Download, FileText } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface ReportDashboardProps {
    role: 'individual' | 'teacher'
    onBack: () => void
}

export default function ReportDashboard({ role, onBack }: ReportDashboardProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'attention' | 'distractions' | 'timeline' | 'download'>('summary')
    const { user } = useUser()

    return (
        <div className="absolute inset-0 top-[112px] flex text-zinc-800 animate-fade-in bg-[#f4effc]">
            {/* Sidebar Navigation */}
            <div className="w-[280px] bg-[#fbf9fe] border-r border-[#e8ddef] flex flex-col p-6 pt-10 justify-between">
                <div>
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="bg-[#8b5cf6] p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-[#6B32C9] tracking-tight">Novi Analytics</h1>
                    </div>

                    <button 
                        onClick={onBack}
                        className="text-sm text-[#8b5cf6] font-medium hover:text-[#6B32C9] transition-colors flex items-center gap-2 mb-10 pl-2"
                    >
                        &larr; Back to Home
                    </button>
                    
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'summary' 
                                ? 'bg-white text-[#6B32C9] shadow-sm shadow-[#8b5cf6]/10' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#6B32C9]'
                            }`}
                        >
                            <LayoutGrid size={20} strokeWidth={2.5} className={activeTab === 'summary' ? 'text-[#a280e2]' : ''} />
                            Overview
                        </button>

                        <button
                            onClick={() => setActiveTab('attention')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'attention' 
                                ? 'bg-white text-[#6B32C9] shadow-sm shadow-[#8b5cf6]/10' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#6B32C9]'
                            }`}
                        >
                            <Target size={20} strokeWidth={2.5} />
                            Attention Score
                        </button>

                        <button
                            onClick={() => setActiveTab('distractions')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'distractions' 
                                ? 'bg-white text-[#6B32C9] shadow-sm shadow-[#8b5cf6]/10' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#6B32C9]'
                            }`}
                        >
                            <AlertCircle size={20} strokeWidth={2.5} />
                            Distractions
                        </button>

                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'timeline' 
                                ? 'bg-white text-[#6B32C9] shadow-sm shadow-[#8b5cf6]/10' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#6B32C9]'
                            }`}
                        >
                            <Clock size={20} strokeWidth={2.5} />
                            Timeline
                        </button>
                        
                        <div className="border-t border-[#e8ddef] my-4 mx-2"></div>

                        <button
                            onClick={() => setActiveTab('download')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'download' 
                                ? 'bg-white text-[#6B32C9] shadow-sm shadow-[#8b5cf6]/10' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#6B32C9]'
                            }`}
                        >
                            <Download size={20} strokeWidth={2.5} />
                            Download Reports
                        </button>
                    </div>
                </div>

                {/* Bottom Role Card */}
                <div className="bg-[#4D2483] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest text-[#a882e6] uppercase">Session View</span>
                        <span className="font-bold text-lg leading-tight">{role === 'teacher' ? 'Teacher Dashboard' : 'Individual Dashboard'}</span>
                        <span className="text-[11px] text-[#a882e6] mt-1 break-all">ID: {user?.id || 'pending'}</span>
                    </div>
                    {/* Decorative fade behind text */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#3a1b63] to-transparent z-0 opacity-50"></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col px-10 pb-8 pt-10 overflow-y-auto hidden-scrollbar">
                {/* Header Date */}
                <div className="flex flex-col mb-6">
                    <span className="text-[11px] font-black tracking-widest text-[#8ba3b8] uppercase mb-1">Generated On</span>
                    <h2 className="text-2xl font-black text-[#8b5cf6]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                </div>
                
                <div className="flex flex-col flex-1 w-full">
                    {activeTab === 'summary' && <OverviewBoard role={role} />}
                    {activeTab === 'attention' && <AttentionScoreBoard role={role} />}
                    {activeTab === 'download' && <ReportDownloadBoard role={role} />}
                </div>
            </div>
        </div>
    )
}