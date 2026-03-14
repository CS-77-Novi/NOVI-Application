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
}