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
}
