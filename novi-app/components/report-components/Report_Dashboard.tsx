'use client'

import React, { useState } from 'react'
import OverviewBoard from './Overview_board'
import IndOverviewBoard from './IndOverview_board'
import AttentionScoreBoard from './AttentionScore_board'
import ReportDownloadBoard from './ReportDownload_board'
import IndReportDownloadBoard from './IndReportDownload_board'
import { LayoutGrid, Target, AlertCircle, Clock, Download, FileText } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

// Dashboard properties allowing us to load the correct UI based on context
interface ReportDashboardProps {
    role: 'individual' | 'teacher'
    onBack: () => void
}

export default function ReportDashboard({ role, onBack }: ReportDashboardProps) {
    // Component State
    // activeTab dictates which child board is currently being rendered in the main content area
    const [activeTab, setActiveTab] = useState<'summary' | 'attention' | 'distractions' | 'timeline' | 'download'>('summary')
    
    // Auth object to retrieve user context for display parameters
    const { user } = useUser()

    return (
        <div className="absolute inset-0 top-[112px] flex text-zinc-800 animate-fade-in bg-[#ecfeff]">
            {/* Sidebar Navigation Column */}
            <div className="w-[280px] bg-[#fbf9fe] border-r border-[#e8ddef] flex flex-col p-6 pt-10 justify-between">
                <div>
                    {/* Brand Header Icon and Title */}
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="bg-[#43a5d1] p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-[#43a5d1] tracking-tight">Novi Analytics</h1>
                    </div>

                    {/* Back Navigation Button */}
                    <button 
                        onClick={onBack}
                        className="text-sm text-[#43a5d1] font-medium hover:text-[#43a5d1]/80 transition-colors flex items-center gap-2 mb-10 pl-2"
                    >
                        &larr; Back to Role
                    </button>
                    
                    {/* Navigation Tab Buttons */}
                    <div className="flex flex-col gap-2">
                        {/* Summary / Overview Tab */}
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'summary' 
                                ? 'bg-white text-[#43a5d1] shadow-sm shadow-[#43a5d1]/10 border-2 border-[#43a5d1]' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#43a5d1]'
                            }`}
                        >
                            <LayoutGrid size={20} strokeWidth={2.5} className={activeTab === 'summary' ? 'text-[#43a5d1]' : ''} />
                            Overview
                        </button>

                        {/* Attention Score metrics Tab */}
                        <button
                            onClick={() => setActiveTab('attention')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'attention' 
                                ? 'bg-white text-[#43a5d1] shadow-sm shadow-[#43a5d1]/10 border-2 border-[#43a5d1]' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#43a5d1]'
                            }`}
                        >
                            <Target size={20} strokeWidth={2.5} />
                            Attention Score
                        </button>
                        
                        {/* Divider Line */}
                        <div className="border-t border-[#e8ddef] my-4 mx-2"></div>

                        {/* Download Archive Tab */}
                        <button
                            onClick={() => setActiveTab('download')}
                            className={`px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 font-bold ${
                                activeTab === 'download' 
                                ? 'bg-white text-[#43a5d1] shadow-sm shadow-[#43a5d1]/10 border-2 border-[#43a5d1]' 
                                : 'text-[#8ba3b8] hover:bg-white/50 hover:text-[#43a5d1]'
                            }`}
                        >
                            <Download size={20} strokeWidth={2.5} />
                            Download Reports
                        </button>
                    </div>
                </div>

                {/* Bottom Role Card Indicator */}
                <div className="bg-[#43a5d1] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest text-white/70 uppercase">Session View</span>
                        <span className="font-bold text-lg leading-tight">{role === 'teacher' ? 'Teacher Dashboard' : 'Individual Dashboard'}</span>
                        <span className="text-[11px] text-white/70 mt-1 break-all">ID: {user?.id || 'pending'}</span>
                    </div>
                    {/* Decorative color gradient fade behind text */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#a21caf] to-transparent z-0 opacity-50"></div>
                </div>
            </div>

            {/* Main Content Area: Board Renders Here */}
            <div className="flex-1 flex flex-col px-10 pb-8 pt-10 overflow-y-auto hidden-scrollbar">
                {/* Header Date displaying current time context */}
                <div className="flex flex-col mb-6">
                    <h2 className="text-2xl font-black text-[#43a5d1]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                </div>
                
                {/* Board Switcher Logic */}
                <div className="flex flex-col flex-1 w-full">
                    {/* Conditionally render different Overview Dashboards based on roles */}
                    {activeTab === 'summary' && role === 'teacher' && <OverviewBoard role={role} />}
                    {activeTab === 'summary' && role === 'individual' && <IndOverviewBoard role={role} />}
                    
                    {/* Attention Score board handles the role logic internally */}
                    {activeTab === 'attention' && <AttentionScoreBoard role={role} />}
                    
                    {/* Conditionally render distinct File Download boards based on roles */}
                    {activeTab === 'download' && role === 'teacher' && <ReportDownloadBoard />}
                    {activeTab === 'download' && role === 'individual' && <IndReportDownloadBoard />}
                </div>
            </div>
        </div>
    )
}