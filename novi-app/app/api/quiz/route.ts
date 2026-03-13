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
        .select('*, quiz_questions(count)')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ quizzes: data })
}

// POST /api/quiz — create a new quiz with its questions
export async function POST(req: NextRequest) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { title, time_limit, questions } = await req.json()

    // 1. Insert quiz
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({ host_id: user.id, title, time_limit, status: 'draft' })
        .select()
        .single()

    if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 })
}