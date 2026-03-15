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

    const readFile = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
            setDocText(e.target?.result as string)
            setFileName(file.name)
            setTitle(file.name.replace(/\.[^/.]+$/, ''))
        }
        reader.readAsText(file)
    }else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const reader = new FileReader()
    reader.onload = (e) => {
        const raw = e.target?.result as string
        const text = raw
            .replace(/[^\x20-\x7E\n]/g, ' ')
            .replace(/ {3,}/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()

        const meaningful = text
            .split('\n')
            .filter(l => l.trim().length > 20)
            .join('\n')

        setDocText(meaningful || text)
        setFileName(file.name)
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
    reader.readAsBinaryString(file)
}else {
    toast('Please upload a .txt or .pdf file', {
        className: '!bg-red-100 !rounded-2xl'
    })
}
}
const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) readFile(file)

}, [])

    const generate = async () => {
        if (!docText.trim()) return toast('Please upload a document first')
        if (!title.trim()) return toast('Please enter a quiz title')
        setStep('generating')
        try {
            const res = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: docText, numQuestions }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setQuestions(data.questions)
            setStep('preview')
        } catch (err: any) {
            toast(err.message || 'Generation failed', { className: '!bg-red-100 !rounded-2xl' })
            setStep('upload')
        }
    }

    const updateQuestion = (i: number, field: keyof Question, value: any) => {
        setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
    }

    const updateOption = (qi: number, oi: number, value: string) => {
        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qi) return q
            const opts = [...q.options]
            opts[oi] = value
            return { ...q, options: opts }
        }))
    }

        const removeQuestion = (i: number) => setQuestions(prev => prev.filter((_, idx) => idx !== i))

    const addQuestion = () => setQuestions(prev => [
        ...prev,
        { question: '', options: ['', '', '', ''], correct_answer: 0 },
    ])

    const moveQuestion = (i: number, dir: -1 | 1) => {
        const j = i + dir
        if (j < 0 || j >= questions.length) return
        const updated = [...questions]
            ;[updated[i], updated[j]] = [updated[j], updated[i]]
        setQuestions(updated)
    }

    

}