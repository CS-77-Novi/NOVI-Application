import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Parse host_id from query params
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Check whether the current logged-in user's userid is provided
    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Fetch reports directly from ind_report where host_id matches
    const { data: rawData, error: reportError } = await supabase
      .from('ind_report')
      .select('file_name, session_id, generated_date, generated_time')
      .eq('host_id', host_id);

    if (reportError) {
      console.error('[Ind Display Report API] Error fetching reports:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        ok: true, 
        data: rawData || []
    });

  } catch (err: any) {
    console.error('[Ind Display Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
