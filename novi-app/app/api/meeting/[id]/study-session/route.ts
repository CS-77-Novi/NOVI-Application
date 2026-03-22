import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; 

export interface StudySession {
  session_id: number | string;
  participant_id: string;
  session_type: 'INDIVIDUAL' | 'GROUP';
  start_time: string;
  end_time?: string | null;
  total_duration?: number | null;
  attentive_duration?: number | null;
  distraction_duration?: number | null;
  average_attention_score?: number | null;
  distraction_events?: number | null;
  created_at?: string;
}

/**
 * GET: Retrieve session data
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const sessionId = isNaN(Number(id)) ? id : parseInt(id);

    const { data, error } = await supabase
      .from('study_session')
      .select('*')
      .eq('session_id', sessionId) // Fixed: Changed 'id' to 'session_id' to match your DELETE logic
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          sessionSummary: {
            session_id: sessionId,
            total_duration: 0,
            attentive_duration: 0,
            distraction_duration: 0,
            average_attention_score: 0,
            distraction_events: 0,
            start_time: null,
          }
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true, sessionSummary: data });
  } catch (error: any) {
    console.error('[Study Session GET Error]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Update session metrics
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('study_session')
      .update({ ...body })
      .eq('session_id', id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove session
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { error } = await supabase
      .from('study_session')
      .delete()
      .eq('session_id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}