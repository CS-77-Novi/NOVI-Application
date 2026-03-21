import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET - Fetch session overview rows.
 * Retrieves data from the `ind_session_overview` table, optionally parameterized by host_id or session_id.
 * Primarily utilized by the Frontend Overview Dashboard to load summary metrics 
 * (Total Time, Attentive Time, Distracted Time) without parsing granular records.
 */
export async function GET(req: NextRequest) {
  try {
    // Collect potential mapping constraints from URL queries
    const host_id = req.nextUrl.searchParams.get('host_id');
    const session_id = req.nextUrl.searchParams.get('session_id');

    // Specify the base SQL query mapped against targeted readout columns
    let query = supabase
      .from('ind_session_overview')
      .select('session_id, host_id, session_time, attentive_time, distracted_time');

    // Chained query mutation applying relevant filters
    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    // Fire network query to Supabase interface
    const { data, error } = await query;

    if (error) {
      console.error('[Ind Session Overview] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Session Overview] Unexpected GET error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST - Insert a new session overview row.
 * Intended to be invoked at the END of a completed session, inserting a final summary 
 * aggregation of time blocks tracked natively by the active client webcam module.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the payload describing the complete finalized session overview mapping
    const body = await req.json();
    const { session_id, host_id, session_time, attentive_time, distracted_time } = body;

    // Reject structurally malformed inputs lacking strict identifiers
    if (!session_id || !host_id) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: session_id, host_id' }, { status: 400 });
    }

    // Commit row applying "00:00:00" defaults if string calculations crashed on payload dispatch
    const { data, error } = await supabase
      .from('ind_session_overview')
      .insert({
        session_id,
        host_id,
        session_time: session_time || '00:00:00',
        attentive_time: attentive_time || '00:00:00',
        distracted_time: distracted_time || '00:00:00',
      })
      .select();

    if (error) {
      console.error('[Ind Session Overview] POST error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (err: any) {
    console.error('[Ind Session Overview] Unexpected POST error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove a session overview row by session_id.
 * Used defensively if a user cancels a generated summary record or when hard-deleting the report via the UI.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'Missing required field: session_id' }, { status: 400 });
    }

    // Trigger row deletion natively mapped via exact ID equality 
    const { error } = await supabase
      .from('ind_session_overview')
      .delete()
      .eq('session_id', session_id);

    if (error) {
      console.error('[Ind Session Overview] DELETE error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Session overview deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Session Overview] Unexpected DELETE error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
