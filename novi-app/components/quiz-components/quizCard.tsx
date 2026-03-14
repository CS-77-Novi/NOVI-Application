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