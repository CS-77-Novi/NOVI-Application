import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET handler to fetch all available individual reports matching a host_id.
 * Used primarily by the frontend Download Report Board to list old sessions.
 */
export async function GET(req: NextRequest) {
  try {
    // Parse the host_id identifier from the incoming request URL search parameters
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Strict validation: Prevent unauthenticated database sweeps of reports
    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Query Supabase: Fetch only the specific report columns required to construct the download UI
    // Filtering down securely via equality match on host_id
    const { data: rawData, error: reportError } = await supabase
      .from('ind_report')
      .select('file_name, session_id, generated_date, generated_time')
      .eq('host_id', host_id);

    if (reportError) {
      // Record any schema issues or backend unavailability
      console.error('[Ind Display Report API] Error fetching reports:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    // Always succeed with an array structure even if null records are returned so mapping doesn't crash on frontend
    return NextResponse.json({ 
        ok: true, 
        data: rawData || []
    });

  } catch (err: any) {
    // General error fall-through catching mapping anomalies or NextRequest interface bugs
    console.error('[Ind Display Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
