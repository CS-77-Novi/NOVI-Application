'use client'

import { useEffect, useState, useCallback } from 'react'
import { Call } from '@stream-io/video-react-sdk'
import { UserResource } from '@clerk/types'
import { Loader2, PlayCircle, BookOpen, X } from 'lucide-react'
import { toast } from 'sonner'
import QuizTaker from './quizTaker'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
    isMeetingOwner: boolean | null
    call: Call
    user: UserResource
    isOpen: boolean
    onClose: () => void
    isFullscreen?: boolean
    onQuizActive?: (active: boolean) => void
}

export default function MeetingQuizPanel({ isMeetingOwner, call, user, isOpen, onClose, isFullscreen = false, onQuizActive }: Props) {
    // Teacher state
    const [publishedQuizzes, setPublishedQuizzes] = useState<any[]>([])
    const [loadingQuizzes, setLoadingQuizzes] = useState(false)
    
    // Active quiz state (for everyone)
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
    const [activeQuizData, setActiveQuizData] = useState<any | null>(null)
    const [activeQuestions, setActiveQuestions] = useState<any[]>([])
    const [loadingActive, setLoadingActive] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [score, setScore] = useState<{ score: number, total: number } | null>(null)

    // Notify parent if a quiz is active
    useEffect(() => {
        if (onQuizActive) {
            onQuizActive(!!activeQuizId)
        }
    }, [activeQuizId, onQuizActive])

    // Fetch published quizzes if teacher
    useEffect(() => {
        if (isMeetingOwner && isOpen) {
            setLoadingQuizzes(true)
            fetch('/api/quiz')
                .then(res => res.json())
                .then(data => {
                    const activeQuizzes = (data.quizzes || []).filter((q: any) => q.status === 'published')
                    setPublishedQuizzes(activeQuizzes)
                })
                .catch(() => toast('Failed to load quizzes'))
                .finally(() => setLoadingQuizzes(false))
        }
    }, [isMeetingOwner, isOpen])

    // Listen for custom Stream events (both teacher & students)
    useEffect(() => {
        const handleCustomEvent = async (event: any) => {
            if (event.type === 'custom' && event.custom?.type === 'quiz-released') {
                const quizId = event.custom.quizId
                setActiveQuizId(quizId)
                setQuizCompleted(false)
                setScore(null)
                
                // Fetch quiz data
                setLoadingActive(true)
                try {
                    const res = await fetch(`/api/quiz/${quizId}`)
                    if (res.ok) {
                        const data = await res.json()
                        setActiveQuizData(data.quiz)
                        setActiveQuestions(data.questions)
                    }
                } catch {
                    toast('Failed to load active quiz')
                } finally {
                    setLoadingActive(false)
                }
            }
        }

        call.on('custom', handleCustomEvent)
        return () => {
            call.off('custom', handleCustomEvent)
        }
    }, [call])

    // Release quiz to meeting
    const handleReleaseQuiz = async (quizId: string) => {
        try {
            await call.sendCustomEvent({
                type: 'quiz-released',
                quizId: quizId
            })
            toast('Quiz released to participants!', { className: '!bg-green-100 !rounded-2xl' })
        } catch (error) {
            toast('Failed to release quiz')
        }
    }

    const handleQuizDone = (finalScore: number, total: number) => {
        setScore({ score: finalScore, total })
        setQuizCompleted(true)
    }

    if (!isOpen) return null

    return (
        <div className={cn(
            "flex flex-col h-full w-full bg-white shadow-2xl overflow-hidden relative",
            isFullscreen ? "fixed inset-0 z-[100]" : "max-w-md rounded-[2rem] border border-gray-100 m-2"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-[#185cab] to-[#9d17bd]">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-lg">Pop Quiz</span>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {/* 1. Active Quiz View */}
                {activeQuizId && activeQuizData && activeQuestions.length > 0 ? (
                    quizCompleted ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
                            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 mb-2">Quiz Completed!</h3>
                            <p className="text-gray-500 mb-6">You scored</p>
                            <div className="text-5xl font-black text-[#da32f8] mb-2">
                                {score?.score} <span className="text-2xl text-gray-400">/ {score?.total}</span>
                            </div>
                            <Button className="mt-8 rounded-2xl px-8 border-[#da32f8] text-[#da32f8] hover:bg-[#da32f8]/10" onClick={() => setActiveQuizId(null)} variant="outline">
                                View Dashboard
                            </Button>
                        </div>
                    ) : (
                        <div className={cn("h-full flex flex-col pt-4", isFullscreen ? "bg-slate-50" : "")}>
                            {/* Embedded QuizTaker inside sidebar */}
                            <QuizTaker
                                quizId={activeQuizId}
                                questions={activeQuestions}
                                timeLimit={activeQuizData.time_limit_minutes}
                                onDone={handleQuizDone}
                                isFullscreen={isFullscreen}
                            />
                        </div>
                    )
                ) : loadingActive ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <Loader2 className="w-10 h-10 text-[#da32f8] animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading active quiz...</p>
                    </div>
                ) : (
                    /* 2. Teacher vs Student No-Active-Quiz View */
                    <div className="p-5">
                        {isMeetingOwner ? (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Published Quizzes</p>
                                
                                {loadingQuizzes ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                    </div>
                                ) : publishedQuizzes.length === 0 ? (
                                    <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 mt-2">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <BookOpen className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-gray-600 font-medium font-sm mb-1">No published quizzes.</p>
                                        <p className="text-xs text-gray-400">Go to the main menu to create one.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {publishedQuizzes.map(quiz => (
                                            <div key={quiz.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 line-clamp-1">{quiz.title}</h4>
                                                    <p className="text-xs text-gray-500">{quiz.time_limit_minutes} minutes</p>
                                                </div>
                                                <Button 
                                                    onClick={() => handleReleaseQuiz(quiz.id)}
                                                    className="w-full rounded-xl bg-[#da32f8]/10 text-[#da32f8] hover:bg-[#da32f8]/20 hover:text-[#9d17bd] font-bold border-0 shadow-none gap-2">
                                                    <PlayCircle className="w-4 h-4" /> Release to participants
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-3xl border border-gray-100 mt-4 p-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                    <BookOpen className="w-8 h-8 text-blue-300" />
                                </div>
                                <h4 className="font-bold text-gray-700 mb-1">No Active Quiz</h4>
                                <p className="text-sm text-gray-400">Wait for the host to release a pop quiz.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}