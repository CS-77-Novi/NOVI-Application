import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET route querying the 'ind_session_overview' table to retrieve specific High-level
 * metadata representing accumulated session stats (Session Duration, Distraction Time, etc.).
 */
export async function GET(req: NextRequest) {
  try {
    // Isolate by host_id to extract multi-session histories belonging exclusively to the given user
    const host_id = req.nextUrl.searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Missing host_id parameter' }, { status: 400 });
    }

    // Query Supabase: Fetching specific aggregate metric columns to pass to the overview dashboard frontend
    const { data, error } = await supabase
      .from('ind_session_overview')
      .select('session_id, host_id, session_time, attentive_time, distracted_time')
      .eq('host_id', host_id);

    // Database error logging and immediate failing check
    if (error) {
      console.error('[Ind Overview] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Pushing the raw records back to the UI interface mapped to data field. Guaranteed as array structure.
    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    // Unexpected error scope boundary to ensure server responds seamlessly
    console.error('[Ind Overview] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
