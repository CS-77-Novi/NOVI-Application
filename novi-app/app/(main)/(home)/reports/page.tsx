"use client"

import { Suspense } from 'react'
import { User } from 'lucide-react'
import ReportDashboard from '@/components/report-components/Report_Dashboard'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const ReportsContent = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const selectedRole = searchParams.get('role') as 'individual' | 'teacher' | null

    if (selectedRole === 'teacher' || selectedRole === 'individual') {
        return (
            <ReportDashboard role={selectedRole} onBack={() => router.push(pathname)} />
        )
    }

    return (
        <section className="flex size-full flex-col items-center justify-center pt-20 px-4 text-gray-900 dark:text-white animate-fade-in relative hidden-scrollbar min-h-[80vh]">
            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl w-full max-w-[360px] rounded-[24px] p-8 py-10 flex flex-col items-center shadow-2xl border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
                
                {/* Centered Avatar Icon */}
                <div className="w-16 h-16 rounded-full border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center mb-6 bg-cyan-50 dark:bg-cyan-500/10 shadow-lg shadow-cyan-500/10 transition-colors duration-300">
                    <User className="text-cyan-600 dark:text-cyan-400 w-8 h-8" strokeWidth={2} />
        
                </div>
                
                <h2 className="text-[16px] font-semibold text-center mb-8 leading-[1.6] text-gray-800 dark:text-zinc-100 transition-colors duration-300">
                    Choose your role<br />to access the reports.
                </h2>

                <div className="flex flex-col w-full gap-4 px-1">
                    <button 
                        onClick={() => router.push(`${pathname}?role=teacher&tab=overview`)}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#185cab] to-[#9d17bd] hover:scale-[1.02] transition-all text-white font-bold shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                        >
                        Teacher
                    </button>
                    <button 
                        onClick={() => router.push(`${pathname}?role=individual&tab=overview`)}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#185cab] to-[#9d17bd] hover:scale-[1.02] transition-all text-white font-bold shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                    >
                        Individual
                    </button>
                </div>

                <button 
                    onClick={() => window.history.back()}
                    className="mt-6 text-[13px] font-medium text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors tracking-wide"
                >
                    Cancel
                </button>
            </div>
        </section>
    )
}

const ReportsPage = () => {
    return (
        <Suspense fallback={<div className="flex size-full items-center justify-center pt-20">Loading...</div>}>
            <ReportsContent />
        </Suspense>
    )
}

export default ReportsPage