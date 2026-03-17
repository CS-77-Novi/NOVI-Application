'use client'

import { useGetCalls } from '@/hooks/useGetCalls'
import { Loader2, BookOpen, Video, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const RecentActivity = () => {
    const { endedCalls, isLoading } = useGetCalls()
    
    // For now, these are mock data until we have a consistent way to fetch them
    // In a real scenario, we'd fetch these from our API
    const recentQuizzes = [
        { id: '1', title: 'Calculus Basics', date: '2 hours ago' },
        { id: '2', title: 'React Hooks Deep Dive', date: '1 day ago' },
    ]
    
    const recentReports = [
        { id: '1', title: 'Class Focus Report - March 15', date: 'Yesterday' },
    ]

    const ActivityItem = ({ icon: Icon, title, subtitle, href, colorClass }: any) => (
        <Link href={href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/10">
            <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl", colorClass)}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h4>
                    <p className="text-xs text-gray-400">{subtitle}</p>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
        </Link>
    )

    return (
        <div className="glass-morphism p-8 rounded-[2.5rem] w-full max-w-md animate-fade-in backdrop-blur-2xl border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
                <div className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Live Feed</div>
            </div>

            <div className="space-y-6">
                {/* Meetings/Recordings section */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Latest Sessions</p>
                    <div className="space-y-1">
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                        ) : endedCalls && endedCalls.length > 0 ? (
                            endedCalls.slice(0, 2).map((call: any) => (
                                <ActivityItem 
                                    key={call.id}
                                    icon={Video}
                                    title={call.state?.custom?.description || 'Untitled Meeting'}
                                    subtitle={new Date(call.state?.startsAt).toLocaleDateString()}
                                    href={`/recordings`}
                                    colorClass="bg-indigo-500"
                                />
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic ml-1">No recent sessions</p>
                        )}
                    </div>
                </div>

                {/* Quizzes section */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Recent Quizzes</p>
                    <div className="space-y-1">
                        {recentQuizzes.map((quiz) => (
                            <ActivityItem 
                                key={quiz.id}
                                icon={BookOpen}
                                title={quiz.title}
                                subtitle={quiz.date}
                                href="/pop-quizzes"
                                colorClass="bg-orange-500"
                            />
                        ))}
                    </div>
                </div>

                {/* Reports section */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Latest Reports</p>
                    <div className="space-y-1">
                        {recentReports.map((report) => (
                            <ActivityItem 
                                key={report.id}
                                icon={FileText}
                                title={report.title}
                                subtitle={report.date}
                                href="/reports"
                                colorClass="bg-emerald-500"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all hover:shadow-lg active:scale-[0.98]">
                View All Activity
            </button>
        </div>
    )
}

export default RecentActivity
