import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET - Fetch attention analysis rows.
 * Retrieves rows from 'ind_attention_analysis', optionally filtered by a specific session_id or host_id.
 * Used for fetching the granular timeline data of distraction percentages.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters for filtering
    const session_id = req.nextUrl.searchParams.get('session_id');
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Base query targeting the individual attention analysis table
    let query = supabase
      .from('ind_attention_analysis')
      .select('host_id, session_id, time, distraction_pct');

    // Apply filters conditionally based on provided parameters
    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    // Execute the constructed query
    const { data, error } = await query;

    if (error) {
      console.error('[Ind Attention Analysis] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Attention Analysis] Unexpected GET error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST - Insert a new attention analysis row.
 * Records a single data point representing a user's distraction percentage reading at a specific time.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON payload
    const body = await req.json();
    const { session_id, host_id, time, distraction_pct } = body;

    // Validate that all necessary data points are present
    if (!session_id || !host_id || time === undefined || distraction_pct === undefined) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: session_id, host_id, time, distraction_pct' }, { status: 400 });
    }

    // Insert the new record into the database
    const { data, error } = await supabase
      .from('ind_attention_analysis')
      .insert({ session_id, host_id, time, distraction_pct })
      .select();

    if (error) {
      console.error('[Ind Attention Analysis] POST error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (err: any) {
    console.error('[Ind Attention Analysis] Unexpected POST error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove attention analysis rows by session_id.
 * Cleans up all attention tracking data associated with a specific session.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'Missing required field: session_id' }, { status: 400 });
    }

    // Attempt the deletion matching the session_id
    const { error } = await supabase
      .from('ind_attention_analysis')
      .delete()
      .eq('session_id', session_id);

    if (error) {
      console.error('[Ind Attention Analysis] DELETE error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Attention analysis rows deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Attention Analysis] Unexpected DELETE error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
