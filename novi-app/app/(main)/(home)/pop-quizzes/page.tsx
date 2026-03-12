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
}