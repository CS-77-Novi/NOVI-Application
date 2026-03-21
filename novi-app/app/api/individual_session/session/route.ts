import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET - Fetch individual session tracking rows.
 * Retrieves rows from the `ind_session` table, optionally scoped down by session_id or host_id.
 * Used for fetching the granular frame-by-frame data points mapped against the timeline.
 */
export async function GET(req: NextRequest) {
  try {
    // Parse the optional filter parameters from the URL
    const session_id = req.nextUrl.searchParams.get('session_id');
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Establish the base query targeting all data required to render the granular timeline
    let query = supabase
      .from('ind_session')
      .select('host_id, session_id, gaze_direction, head_direction, distraction_pct, time');

    // Conditionally chain identical query match filters
    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    // Always sort chronologically to ensure Recharts and Excel exports render correctly
    query = query.order('time', { ascending: true });

    // Execute the constructed query
    const { data, error } = await query;

    if (error) {
      console.error('[Ind Session] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Session] Unexpected GET error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST - Insert a new session tracking row.
 * A high-throughput endpoint receiving data ticks from the active webcam analysis module
 * processing individual participants. 
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON payload body containing the latest interval metrics
    const body = await req.json();
    const { host_id, session_id, gaze_direction, head_direction, distraction_pct, time } = body;

    // Validate absolute minimum indexing fields required to map the session correctly
    if (!host_id || !session_id) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: host_id, session_id' }, { status: 400 });
    }

    // Insert the record applying default defensive string fallbacks where tracking algorithms missed frames
    const { data, error } = await supabase
      .from('ind_session')
      .insert({
        host_id,
        session_id,
        gaze_direction: gaze_direction || 'N/A',
        head_direction: head_direction || 'N/A',
        distraction_pct: distraction_pct ?? 0,
        time: time || '00:00:00',
      })
      .select();

    if (error) {
      console.error('[Ind Session] POST error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (err: any) {
    console.error('[Ind Session] Unexpected POST error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove session rows by session_id or host_id.
 * Typically utilized during data sweeps terminating an invalid or crashed session early.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, host_id } = body;

    // Ensure at least one form of restriction bounds the deletion query
    if (!session_id && !host_id) {
      return NextResponse.json({ ok: false, error: 'Missing required field: session_id or host_id' }, { status: 400 });
    }

    // Base deletion invocation
    let query = supabase.from('ind_session').delete();

    // Map the conditional filters onto the active query
    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    // Execute the deletion
    const { error } = await query;

    if (error) {
      console.error('[Ind Session] DELETE error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Session rows deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Session] Unexpected DELETE error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
