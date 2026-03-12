import { NextRequest, NextResponse } from 'next/server' 
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>  //  Must be Promise in Next.js 15
}