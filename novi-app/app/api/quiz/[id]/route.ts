// This file provides specific quiz management (GET, PATCH, DELETE) for authenticated hosts and participants.
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET /api/quiz/[id] — fetch a specific quiz and its questions
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', id)
    .single()

  if (quizError) return NextResponse.json({ error: quizError.message }, { status: 404 })

  return NextResponse.json({ 
    quiz, 
    questions: quiz.questions 
  })
}

// PATCH /api/quiz/[id] — update quiz details (e.g., status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('quizzes')
    .update(body)
    .eq('id', id)
    .eq('host_id', user.id) // Ensure only owner can update
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ quiz: data[0] })
}

// DELETE /api/quiz/[id] — delete a quiz
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id)
    .eq('host_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
