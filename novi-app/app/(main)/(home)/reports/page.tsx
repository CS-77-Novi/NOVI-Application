"use client"

import { useState } from 'react'
import { User } from 'lucide-react'
import ReportDashboard from '@/components/report-components/Report_Dashboard'

const ReportsPage = () => {
    const [selectedRole, setSelectedRole] = useState<'individual' | 'teacher' | null>(null)

    if (selectedRole) {
        return (
            <ReportDashboard role={selectedRole} onBack={() => setSelectedRole(null)} />
        )
    }

    return (
        <section className="flex size-full flex-col items-center justify-center pt-20 px-4 text-white animate-fade-in relative hidden-scrollbar">
            <div className="bg-[#1C1C21] w-full max-w-[340px] rounded-[24px] p-8 py-10 flex flex-col items-center shadow-2xl border border-white/5">
                
                {/* Centered Avatar Icon */}
                <div className="w-14 h-14 rounded-full border border-[#D946EF] flex items-center justify-center mb-6 bg-[#f4effc]/10">
                    <User className="text-[#D946EF] w-6 h-6" strokeWidth={2} />
                </div>
                
                <h2 className="text-[15px] font-medium text-center mb-8 leading-[1.6] text-zinc-100">
                    Are you trying to access the<br />
                    report? Tell us<br />
                    who you are.
                </h2>

                <div className="flex flex-col w-full gap-4 px-1">
                    <button 
                        onClick={() => setSelectedRole('teacher')}
                        className="w-full py-3 rounded-xl bg-[#D946EF] hover:bg-[#c02bc5] transition-all text-[#f4effc] font-bold shadow-[0_4px_20px_rgba(217,70,239,0.3)]"
                    >
                        Teacher
                    </button>
                    <button 
                        onClick={() => setSelectedRole('individual')}
                        className="w-full py-3 rounded-xl bg-[#D946EF] hover:bg-[#c02bc5] transition-all text-[#f4effc] font-bold shadow-[0_4px_20px_rgba(217,70,239,0.3)]"
                    >
                        Individual
                    </button>
                </div>

                <button 
                    onClick={() => window.history.back()}
                    className="mt-6 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors tracking-wide"
                >
                    Cancel
                </button>
            </div>
        </section>
    )
}

export default ReportsPage