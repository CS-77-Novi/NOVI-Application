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

}