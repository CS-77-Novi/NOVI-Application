'use client'
//this file is the quiz-taking interface for participants.
import { useEffect, useState, useCallback, useRef } from 'react'
import { Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Question {
    id: string
    question: string
    options: string[]
    correct_answer: number
    position: number
}

interface Props {
    quizId: string
    questions: Question[]
    timeLimit: number // minutes
    onDone: (score: number, total: number) => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizTaker({ quizId, questions, timeLimit, onDone }: Props) {
    const total = questions.length
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState<(number | null)[]>(Array(total).fill(null))
    const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
    const [submitting, setSubmitting] = useState(false)
    const [selected, setSelected] = useState<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const submit = useCallback(async (forcedAnswers?: (number | null)[]) => {
        if (submitting) return
        setSubmitting(true)
        if (timerRef.current) clearInterval(timerRef.current)

        const finalAnswers = (forcedAnswers ?? answers).map(a => a ?? -1)

        try {
            const res = await fetch(`/api/quiz/${quizId}/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: finalAnswers }),
            })
            const data = await res.json()
            if (res.ok) {
                onDone(data.score, data.total)
            } else {
                onDone(0, total)
            }
        } catch {
            onDone(0, total)
        }
    }, [submitting, answers, quizId, onDone, total])

        //Countdown timer
    useEffect(() => {
    timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timerRef.current!)
                submit()
                return 0
            }
            return prev - 1
        })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
}, []) // eslint-disable-line react-hooks/exhaustive-deps

const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
const secs = (timeLeft % 60).toString().padStart(2, '0')
const isLow = timeLeft < 30
const progress = ((current) / total) * 100
const q = questions[current]

}