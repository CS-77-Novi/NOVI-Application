import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

<<<<<<< Updated upstream
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

  // 2. Insert questions
  if (questions && questions.length > 0) {
    const rows = questions.map((q: any, i: number) => ({
      quiz_id: quiz.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      position: i,
    }))

    const { error: qError } = await supabase.from('quiz_questions').insert(rows)
    if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })
  }

  return NextResponse.json({ quiz })
}
=======
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()

    if (quizError || !quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

    const { data: questions, error: qError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', id)
        .order('position')

    if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })

    return NextResponse.json({ quiz, questions })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const { data: quiz } = await supabase.from('quizzes').select('host_id').eq('id', id).single()
    if (!quiz || quiz.host_id !== user.id)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const quizUpdates: any = {}
    if (body.title !== undefined) quizUpdates.title = body.title
    if (body.time_limit !== undefined) quizUpdates.time_limit = body.time_limit
    if (body.status !== undefined) quizUpdates.status = body.status

    if (Object.keys(quizUpdates).length > 0) {
        const { error } = await supabase.from('quizzes').update(quizUpdates).eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { data: quiz } = await supabase.from('quizzes').select('host_id').eq('id', id).single()
    if (!quiz || quiz.host_id !== user.id)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
>>>>>>> Stashed changes
