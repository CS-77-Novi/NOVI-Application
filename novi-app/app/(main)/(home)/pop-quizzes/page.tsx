'use client'

// imports and dependencies
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Plus, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QuizCard from '@/components/quiz-components/quizCard'
import QuizCreateDialog from '@/components/quiz-components/quizCreateDialog'
import Loading from '@/components/Loading'

// Quiz interface typing 
interface Quiz {
    id: string
    title: string
    status: 'draft' | 'published'
    time_limit: number
    quiz_questions: { count: number }[]
}

export default function PopQuizzesPage() {
    const { user, isLoaded } = useUser()
const [quizzes, setQuizzes] = useState<Quiz[]>([])
const [loading, setLoading] = useState(true)
const [createOpen, setCreateOpen] = useState(false)

// Fetch quizzes on component mount
const fetchQuizzes = async () => {
    setLoading(true)
    try {
        const res = await fetch('/api/quiz')
        if (res.ok) {
            const data = await res.json()
            setQuizzes(data.quizzes || [])
        }
    } finally {
        setLoading(false)
    }
}   

//Initial data loading with useEffect
    useEffect(() => {
        if (isLoaded && user) fetchQuizzes()
    }, [isLoaded, user])

    //to prevents the page from rendering incomplete or flickering content
    if (!isLoaded || loading) return <Loading />

    const published = quizzes.filter(q => q.status === 'published')
    const drafts = quizzes.filter(q => q.status === 'draft')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900">Pop Quizzes</h1>
                        </div>
                        <p className="text-gray-500 ml-15 pl-1">
                            Upload a document, let AI generate questions, then share with participants.
                        </p>
                    </div>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-5 rounded-2xl shadow-lg shadow-blue-200 cursor-pointer transition-all hover:scale-105 hover:-translate-y-0.5">
                        <Plus className="w-5 h-5" />
                        Create Quiz
                    </Button>
                </div>

                {/* Empty state */}
                {quizzes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-blue-400" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-700 mb-2">No quizzes yet</h2>
                            <p className="text-gray-400 max-w-sm">
                                Create your first quiz! Upload a document and AI will generate questions instantly.
                            </p>
                        </div>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-5 rounded-2xl cursor-pointer hover:scale-105 transition-all">
                            <Plus className="w-5 h-5" />
                            Create your first quiz
                        </Button>
                    </div>
                )}

                {/* Published quizzes */}
                {published.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-black text-gray-600 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Published ({published.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {published.map(quiz => (
                                <QuizCard
                                    key={quiz.id}
                                    id={quiz.id}
                                    title={quiz.title}
                                    status={quiz.status}
                                    timeLimit={quiz.time_limit}
                                    questionCount={quiz.quiz_questions?.[0]?.count ?? 0}
                                    onDeleted={fetchQuizzes}
                                />
                            ))}
                        </div>
                    </section>
                )}

