//This file is a reusable UI component for displaying and managing a quiz card inside the quiz dashboard.
'use client'
import { Clock, FileQuestion, Link2, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface QuizCardProps {
    id: string
    title: string
    status: 'draft' | 'published'
    timeLimit: number
    questionCount: number
    onDeleted: () => void
}

export default function QuizCard({
    id, title, status, timeLimit, questionCount, onDeleted
}: QuizCardProps) {

    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/pop-quizzes/${id}`

    const copyLink = () => {
        navigator.clipboard.writeText(shareLink)
        toast('Link copied to clipboard!', { className: '!bg-green-100 !rounded-2xl' })
    }

    const deleteQuiz = async () => {
        if (!confirm('Delete this quiz? This cannot be undone.')) return
        const res = await fetch(`/api/quiz/${id}`, { method: 'DELETE' })
        if (res.ok) {
            toast('Quiz deleted', { className: '!bg-gray-200 !rounded-2xl' })
            onDeleted()
        } else {
            toast('Failed to delete quiz', { className: '!bg-red-100 !rounded-2xl' })
        }
    }
    return (
    return (
        <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-border hover:shadow-md transition-shadow flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-800 dark:text-gray-100 text-lg leading-tight truncate">{title}</h3>
                </div>
                <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full
          ${status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                    {status === 'published' ? '● Published' : '○ Draft'}
                </span>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                    <FileQuestion className="w-4 h-4" />
                    {questionCount} Questions
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {timeLimit} min
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                {status === 'published' && (
                    <Button onClick={copyLink} variant="outline"
                        className="flex-1 rounded-2xl gap-2 font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors">
                        <Link2 className="w-4 h-4" />
                        Copy Link
                    </Button>
                )}
                <Button onClick={deleteQuiz} variant="outline"
                    className="rounded-2xl gap-2 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 font-semibold cursor-pointer transition-colors">
                        <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

