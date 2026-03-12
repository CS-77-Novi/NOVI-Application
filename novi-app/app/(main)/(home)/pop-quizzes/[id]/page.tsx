import { NextRequest, NextResponse } from 'next/server' 
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>  //  Must be Promise in Next.js 15
}
export default async function Page({ params }: Props) {
  const { id } = await params
  
  return <div>Quiz ID: {id}</div>
}

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

