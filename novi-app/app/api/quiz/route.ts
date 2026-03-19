//This file provides the backend API for quizzes.

import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET /api/quiz — list all quizzes for the logged-in host
export async function GET() {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions(count)')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ quizzes: data })
}

// POST /api/quiz — create a new quiz with its questions
export async function POST(req: NextRequest) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, time_limit_minutes, questions } = await req.json()

    // 1. Insert quiz
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({ host_id: user.id, title, time_limit_minutes, status: 'draft' })
        .select()
        .single()

    if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 })

    // 2. Insert questions
    if (questions && questions.length > 0) {
        const rows = questions.map((q: any, i: number) => ({
            quiz_id: quiz.id,
            question: q.question,
            options: q.options,
            correct_answer: String(q.correct_answer), // DB column is text
            order_index: i,
        }))
        const { error: qError } = await supabase.from('questions').insert(rows)
        if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })
    }

    return NextResponse.json({ quiz })
}