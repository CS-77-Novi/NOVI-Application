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

    // Step 1 & 2: Query host_meetings for all meeting_ids for this host_id
    const { data: hostMatches, error: hostError } = await supabase
      .from('host_meetings')
      .select('meeting_id')
      .eq('host_id', host_id);

    if (hostError) {
      console.error('[Download Report API] Error querying host_meetings:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // If there're no matches, don't GET any rows in group_report table
    if (!hostMatches || hostMatches.length === 0) {
      return NextResponse.json({ 
        ok: true,
        data: []
      });
    }

    const meetingIds = hostMatches.map(match => match.meeting_id);

    // Step 3: Fetch rows from group_report where session_id matches any of the extracted meeting_ids
    const { data: rawData, error: reportError } = await supabase
      .from('group_report')
      .select('file_name, session_id, generated_date, generated_time')
      .in('session_id', meetingIds);

    if (reportError) {
      console.error('[Download Report API] Error fetching reports:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        ok: true, 
        data: rawData || []
    });

  } catch (err: any) {
    console.error('[Download Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}