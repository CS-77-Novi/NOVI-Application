'use client'

// imports and dependencies
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Plus, BookOpen, Sparkles, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
const [searchQuery, setSearchQuery] = useState('')

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

    const filteredQuizzes = quizzes.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const published = filteredQuizzes.filter(q => q.status === 'published')
    const drafts = filteredQuizzes.filter(q => q.status === 'draft')

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background p-6 md:p-10 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#185cab] to-[#9d17bd] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Pop Quizzes</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 ml-1 pl-1">
                            Upload a document, let AI generate questions, then share with participants.
                        </p>
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-4">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                placeholder="Search quizzes..." 
                                className="pl-10 rounded-2xl bg-white dark:bg-card border-gray-100 dark:border-border focus:ring-[#da32f8] dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-br from-[#185cab] to-[#9d17bd] hover:bg-[#9d17bd] text-white font-bold px-6 py-5 rounded-2xl shadow-lg shadow-purple-200 cursor-pointer transition-all hover:scale-105 hover:-translate-y-0.5">
                            <Plus className="w-5 h-5" />
                            Create Quiz
                        </Button>
                    </div>
                </div>

                {/* Empty state */}
                {filteredQuizzes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="w-24 h-24 rounded-3xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-[#da32f8]" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-700 dark:text-white mb-2">No quizzes yet</h2>
                            <p className="text-gray-400 dark:text-gray-400 max-w-sm">
                                Create your first quiz! Upload a document and AI will generate questions instantly.
                            </p>
                        </div>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-2 bg-[#da32f8] hover:bg-[#9d17bd] text-white font-bold px-8 py-5 rounded-2xl cursor-pointer hover:scale-105 transition-all outline-hidden">
                            <Plus className="w-5 h-5" />
                            Create your first quiz
                        </Button>
                    </div>
                )}

                {/* Published quizzes */}
                {published.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-black text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#185cab] to-[#9d17bd] inline-block" />
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

                {/* Draft quizzes */}
                {drafts.length > 0 && (
                    <section>
                        <h2 className="text-lg font-black text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                            Drafts ({drafts.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {drafts.map(quiz => (
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
            </div>

            {/* Create Dialog */}
            <QuizCreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={fetchQuizzes}
            />
        </div>
    )
}

