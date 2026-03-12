import { NextRequest, NextResponse } from 'next/server' 
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'