// this file handles the quiz attempt flow for a specific quiz.
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params 
    
    const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ attempt: data })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const { answers } = await req.json() // answers: number[] indexed by question position

    // Check if already attempted
    const { data: existing } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        return NextResponse.json({ error: 'You have already attempted this quiz.' }, { status: 409 })
    }    
    // Fetch quiz questions to compute score
    const { data: questions, error: qError } = await supabase
        .from('quiz_questions')
        .select('correct_answer')
        .eq('quiz_id', id)
        .order('position')

    if (qError || !questions) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })    
    
    const score = questions.reduce((acc: number, q: any, i: number) => {
    return answers[i] === q.correct_answer ? acc + 1 : acc
    }, 0)    

        const { error: insertError } = await supabase.from('quiz_attempts').insert({
        quiz_id: id,
        user_id: user.id,
        answers,
        score,
    })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({ score, total: questions.length })
}