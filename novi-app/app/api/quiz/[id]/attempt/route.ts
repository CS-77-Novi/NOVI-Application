// this file handles the quiz attempt flow for a specific quiz.
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET /api/quiz/[id]/attempt — check if user already attempted this quiz
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params 
    
    const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', id)
        .eq('participant_id', user.id)   // was user_id — now participant_id
        .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ attempt: data })
}

// POST /api/quiz/[id]/attempt — submit answers and record attempt
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const { answers } = await req.json() // answers: number[] indexed by question order

    // 1. Check if already attempted
    const { data: existing } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', id)
        .eq('participant_id', user.id)   // was user_id — now participant_id
        .maybeSingle()

    if (existing) {
        return NextResponse.json({ error: 'You have already attempted this quiz.' }, { status: 409 })
    }

    // 2. Fetch quiz questions to compute score
    const { data: questions, error: qError } = await supabase
        .from('questions')                   // was 'ququestions' (typo fixed)
        .select('id, correct_answer')
        .eq('quiz_id', id)
        .order('order_index')                // was 'position' — now order_index

    if (qError || !questions) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

    // 3. Compute score (correct_answer is stored as text e.g. "0","1","2","3")
    const score = questions.reduce((acc: number, q: any, i: number) => {
        return String(answers[i]) === q.correct_answer ? acc + 1 : acc
    }, 0)

    // 4. Insert attempt record
    const { data: attempt, error: insertError } = await supabase
        .from('quiz_attempts')
        .insert({
            quiz_id: id,
            participant_id: user.id,         // was user_id — now participant_id
            score,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    // 5. Insert individual answers into quiz_answers table
    const answerRows = questions.map((q: any, i: number) => ({
        attempt_id: attempt.id,
        question_id: q.id,
        selected_answer: String(answers[i]),
        is_correct: String(answers[i]) === q.correct_answer,
    }))

    const { error: answersError } = await supabase.from('quiz_answers').insert(answerRows)
    if (answersError) {
        // Non-fatal: attempt is recorded, answers detail failed
        console.error('Failed to insert quiz_answers:', answersError.message)
    }

    return NextResponse.json({ score, total: questions.length })
}