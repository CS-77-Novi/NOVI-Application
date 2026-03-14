'use client'
//Imports
import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { X, Plus, Trash2, FileText, Loader2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

//Interfaces
interface Question {
    question: string
    options: string[]
    correct_answer: number
}

interface Props {
    open: boolean
    onClose: () => void
    onCreated: () => void
}

type Step = 'upload' | 'generating' | 'preview' | 'publishing' | 'done'
export default function QuizCreateDialog({ open, onClose, onCreated }: Props) {
    const { user } = useUser()
    const [step, setStep] = useState<Step>('upload')
    const [docText, setDocText] = useState('')
    const [fileName, setFileName] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [timeLimit, setTimeLimit] = useState(10)
    const [title, setTitle] = useState('')
    const [questions, setQuestions] = useState<Question[]>([])
    const [shareLink, setShareLink] = useState('')
    const [dragOver, setDragOver] = useState(false)

    const reset = () => {
        setStep('upload')
        setDocText('')
        setFileName('')
        setNumQuestions(5)
        setTimeLimit(10)
        setTitle('')
        setQuestions([])
        setShareLink('')
    }

    const handleClose = () => {
        reset()
        onClose()
    }