'use client'
//this file is the quiz-taking interface for participants.
import { useEffect, useState, useCallback, useRef } from 'react'
import { Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    isFullscreen: boolean
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizTaker({ quizId, questions, timeLimit, onDone, isFullscreen }: Props) {
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

    const chooseAnswer = (oi: number) => {
        if (submitting) return
        setSelected(oi)
        const updated = [...answers]
        updated[current] = oi
        setAnswers(updated)
    }

    const next = () => {
        if (current < total - 1) {
            setCurrent(current + 1)
            setSelected(answers[current + 1])
        }
    }

    const prev = () => {
        if (current > 0) {
            setCurrent(current - 1)
            setSelected(answers[current - 1])
        }
    }

    const goTo = (i: number) => {
        setCurrent(i)
        setSelected(answers[i])
    }

    return (
    <div className={cn(
        "flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50",
        isFullscreen ? "min-h-screen" : "min-h-[600px]"
    )}>
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="text-sm font-semibold text-gray-500">
                Question <span className="text-blue-600 font-black">{current + 1}</span> of {total}
            </div>

            <div
                className={`flex items-center gap-2 font-black text-2xl tabular-nums px-5 py-1.5 rounded-2xl transition-all
                ${isLow ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}
            >
                <Clock className="w-5 h-5" />
                {mins}:{secs}
            </div>

            <div className="text-sm font-semibold text-gray-400">
                {answers.filter(a => a !== null).length} answered
            </div>
        </div>

        <div className="w-full h-1.5 bg-gray-100">
            <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>

        <div className="flex flex-1 gap-6 p-6">
            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4">
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                            Q{current + 1}
                        </span>
                        <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                            {q.question}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {q.options.map((opt, oi) => (
                        <button
                            key={oi}
                            onClick={() => chooseAnswer(oi)}
                            disabled={submitting}
                            className={`w-full rounded-2xl px-6 py-4 text-left flex items-center gap-4 transition-all border-2 cursor-pointer
                            ${
                                selected === oi
                                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                                    : 'border-transparent bg-white hover:border-blue-200 hover:bg-blue-50/50 shadow-sm'
                            }`}
                        >
                            <span
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all
                                ${
                                    selected === oi
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                {OPTION_LABELS[oi]}
                            </span>
                            <span
                                className={`font-medium text-base ${
                                    selected === oi ? 'text-blue-800' : 'text-gray-700'
                                }`}
                            >
                                {opt}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                    <Button
                        variant="outline"
                        onClick={prev}
                        disabled={current === 0}
                        className="rounded-2xl px-6 font-semibold cursor-pointer"
                    >
                        ← Previous
                    </Button>

                    {current < total - 1 ? (
                        <Button
                            onClick={next}
                            className="rounded-2xl px-6 bg-gradient-to-br from-[#185cab] to-[#9d17bd] hover:bg-blue-700 text-white font-semibold cursor-pointer gap-2"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => submit()}
                            disabled={submitting}
                            className="rounded-2xl px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-base cursor-pointer gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Submit Quiz
                        </Button>
                    )}
                </div>
            </div>

            <div className="lg:w-56 shrink-0">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 sticky top-24">
                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
                        Questions
                    </p>

                    <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer
                                ${
                                    i === current
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : answers[i] !== null
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-3 h-3 rounded bg-green-100" /> Answered
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-3 h-3 rounded bg-blue-500" /> Current
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-3 h-3 rounded bg-gray-100" /> Not answered
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)
}