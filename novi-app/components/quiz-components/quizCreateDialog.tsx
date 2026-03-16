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

        const publish = async () => {
        if (questions.length === 0) return toast('Add at least one question')
        setStep('publishing')
        try {
            const res = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, time_limit: timeLimit, questions }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Publish immediately
            await fetch(`/api/quiz/${data.quiz.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'published' }),
            })

            const base = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
            setShareLink(`${base}/pop-quizzes/${data.quiz.id}`)
            setStep('done')
            onCreated()
        } catch (err: any) {
            toast(err.message || 'Publish failed', { className: '!bg-red-100 !rounded-2xl' })
            setStep('preview')
        }
    }

        const OPTION_LABELS = ['A', 'B', 'C', 'D']

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="!max-w-2xl !w-full bg-gray-50 !rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white">
                            {step === 'upload' && '📄 Create Pop-Quiz'}
                            {step === 'generating' && '✨ Generating Questions...'}
                            {step === 'preview' && '✏️ Preview & Edit Questions'}
                            {step === 'publishing' && '🚀 Publishing...'}
                            {step === 'done' && '🎉 Quiz Published!'}
                        </DialogTitle>
                    </DialogHeader>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        {(['upload', 'preview', 'done'] as const).map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step === s || (s === 'upload' && step === 'generating') || (s === 'preview' && step === 'publishing')
                                        ? 'bg-white text-blue-600'
                                        : step === 'done' || (s === 'upload' && ['preview', 'publishing', 'done'].includes(step)) 
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-blue-500/40 text-white/60'}`}>
                                    {i + 1}
                                </div>
                                <span className="text-sm text-blue-100 hidden sm:inline">
                                    {s === 'upload' ? 'Upload' : s === 'preview' ? 'Edit' : 'Done'}
                                </span>
                                {i < 2 && <div className="w-8 h-px bg-blue-400/50" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">

                    {/* STEP 1: Upload */}
                    {step === 'upload' && (
                        <div className="flex flex-col gap-5">
                            {/* Quiz title */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Quiz Title</label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Chapter 3 Biology Quiz"
                                    className="inputs"
                                />
                            </div>

                            {/* Drop zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
                  ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}
                  ${docText ? 'border-green-400 bg-green-50' : ''}`}
                                onClick={() => document.getElementById('quiz-file-input')?.click()}
                            >
                                {docText ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle2 className="text-green-500 w-10 h-10" />
                                        <p className="font-semibold text-green-700">{fileName}</p>
                                        <p className="text-sm text-gray-500">{docText.length.toLocaleString()} characters extracted</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <FileText className="w-10 h-10" />
                                        <p className="font-semibold">Drag & drop or click to upload</p>
                                        <p className="text-sm">.txt or .pdf files supported</p>
                                    </div>
                                )}
                            </div>
                            <input id="quiz-file-input" type="file" accept=".txt,.pdf" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f) }} />

                            {/* Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Number of Questions</label>
                                    <Input type="number" min={1} max={20} value={numQuestions}
                                        onChange={e => setNumQuestions(Number(e.target.value))} className="inputs" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Time Limit (minutes)</label>
                                    <Input type="number" min={1} max={120} value={timeLimit}
                                        onChange={e => setTimeLimit(Number(e.target.value))} className="inputs" />
                                </div>
                            </div>

                            <Button
                                onClick={generate}
                                disabled={!docText || !title}
                                className="w-full py-6 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer">
                                ✨ Generate Questions with AI
                            </Button>
                        </div>
                    )}

                    {/* STEP: Generating */}
                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                            <p className="text-xl font-bold text-gray-700">AI is reading your document...</p>
                            <p className="text-gray-500 text-sm">Generating {numQuestions} questions, this may take a moment.</p>
                        </div>
                    )}

                    {/* STEP 2: Preview & Edit */}
                    {step === 'preview' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-500">{questions.length} questions • {timeLimit} min time limit</p>
                                <Button variant="outline" size="sm" onClick={addQuestion}
                                    className="rounded-xl gap-1 font-semibold text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer">
                                    <Plus className="w-4 h-4" /> Add Question
                                </Button>
                            </div>

                            {questions.map((q, qi) => (
                                <div key={qi} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0 mt-1">
                                            {qi + 1}
                                        </span>
                                        <textarea
                                            value={q.question}
                                            onChange={e => updateQuestion(qi, 'question', e.target.value)}
                                            rows={2}
                                            className="flex-1 text-sm font-medium bg-gray-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="Question text..."
                                        />
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => moveQuestion(qi, -1)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><ChevronUp className="w-4 h-4" /></button>
                                            <button onClick={() => moveQuestion(qi, 1)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><ChevronDown className="w-4 h-4" /></button>
                                        </div>
                                        <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pl-10">
                                        {q.options.map((opt, oi) => (
                                            <label key={oi} className={`flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer border transition-all
                        ${q.correct_answer === oi ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                                <input type="radio" name={`q-${qi}-correct`} checked={q.correct_answer === oi}
                                                    onChange={() => updateQuestion(qi, 'correct_answer', oi)}
                                                    className="accent-green-500" />
                                                <span className="text-xs font-bold text-gray-500 w-4">{OPTION_LABELS[oi]}</span>
                                                <input
                                                    value={opt}
                                                    onChange={e => updateOption(qi, oi, e.target.value)}
                                                    className="flex-1 text-sm bg-transparent focus:outline-none"
                                                    placeholder={`Option ${OPTION_LABELS[oi]}`}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {questions.length > 0 && (
                                <Button onClick={publish}
                                    className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer mt-2">
                                    🚀 Publish Quiz
                                </Button>
                            )}
                        </div>
                    )}

                    {/* STEP: Publishing */}
                    {step === 'publishing' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                            <p className="text-xl font-bold text-gray-700">Publishing your quiz...</p>
                        </div>
                    )}

                    {/* STEP: Done */}
                    {step === 'done' && (
                        <div className="flex flex-col items-center gap-6 py-8">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-800 mb-1">{title}</h3>
                                <p className="text-gray-500">{questions.length} questions • {timeLimit} min</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-2xl p-4">
                                <p className="text-xs text-gray-500 mb-2 font-semibold">SHARE THIS LINK WITH PARTICIPANTS</p>
                                <div className="flex gap-2">
                                    <Input value={shareLink} readOnly className="inputs text-sm font-mono" />
                                    <Button variant="outline"
                                        onClick={() => { navigator.clipboard.writeText(shareLink); toast('Link copied!') }}
                                        className="rounded-xl font-semibold cursor-pointer shrink-0">
                                        Copy
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={handleClose}
                                className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg cursor-pointer">
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


