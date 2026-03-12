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


}