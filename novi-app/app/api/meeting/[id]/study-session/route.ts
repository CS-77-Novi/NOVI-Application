import { NextRequest, NextResponse } from 'next/server';
// 1. Import the constant 'supabase' instead of the function 'createClient'
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
  { params }: { params: Promise<{ id: string }> } // 1. Change to Promise
) {
  const resolvedParams = await params; // 2. Await the params
  const sessionIdRaw = resolvedParams.id;

  try {
    const sessionId = isNaN(Number(sessionIdRaw)) ? sessionIdRaw : parseInt(sessionIdRaw);

    // 2. Use 'supabase' directly (no parentheses needed)
    const { data, error } = await supabase
      .from('study_session')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          sessionSummary: {
            session_id: sessionId,
            total_duration: null,
            attentive_duration: null,
            distraction_duration: null,
            average_attention_score: null,
            distraction_events: null,
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const sessionId = params.id;

    const formattedUpdates = {
      ...body,
      ...(body.end_time && { end_time: new Date(body.end_time).toISOString() }),
    };

    // 3. Use 'supabase' directly
    const { data, error } = await supabase
      .from('study_session')
      .update(formattedUpdates)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove session
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;

  try {
    // 4. Use 'supabase' directly
    const { error } = await supabase
      .from('study_session')
      .delete()
      .eq('session_id', sessionId);
      
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}