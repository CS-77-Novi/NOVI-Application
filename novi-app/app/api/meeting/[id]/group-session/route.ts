import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * MODEL DEFINITIONS
 */
export interface GroupSession {
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

// Fixed the naming consistency here
type GroupSessionInput = Partial<Omit<GroupSession, 'session_id' | 'created_at'>>;

/**
 * GET: Fetch session analytics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionIdRaw } = await params;

  try {
    const sessionId = parseInt(sessionIdRaw);

    if (isNaN(sessionId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid ID: The provided Session ID must be a valid number.' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('group_session')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Returns the object shell with nulls so the UI displays "_" instead of vanishing
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
    console.error('[Group Session GET Error]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Initialize session
 */
export async function POST(req: NextRequest) {
  try {
    // Changed from StudySessionInput to GroupSessionInput
    const body: GroupSessionInput = await req.json();

    if (!body.participant_id || !body.start_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('group_session')
      .insert([{
        participant_id: body.participant_id,
        start_time: new Date(body.start_time).toISOString(),
        session_type: body.session_type || 'GROUP',
      }])
      .select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Update session metrics
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, ...updates } = body;

    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

    const formattedUpdates = {
      ...updates,
      ...(updates.end_time && { end_time: new Date(updates.end_time).toISOString() }),
    };

    const { data, error } = await supabase
      .from('group_session')
      .update(formattedUpdates)
      .eq('session_id', session_id)
      .select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove session
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('id');

  if (!sessionId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    const { error } = await supabase
      .from('group_session')
      .delete()
      .eq('session_id', sessionId);
      
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}