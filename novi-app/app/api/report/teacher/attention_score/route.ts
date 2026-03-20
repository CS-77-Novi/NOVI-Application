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

    // Step 1 & 2: Query host_meetings for the latest meeting_id for this host_id
    const { data: hostMatches, error: hostError } = await supabase
      .from('host_meetings')
      .select('meeting_id, date_time')
      .eq('host_id', host_id)
      .order('date_time', { ascending: false })
      .limit(1);

    if (hostError) {
      console.error('[Overview API] Error querying host_meetings for latest session:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // If there're no matches, don't GET any rows in group_attention_analysis table
    if (!hostMatches || hostMatches.length === 0) {
      return NextResponse.json({ 
        ok: true,
        data: []
      });
    }

    const latestMeetingId = hostMatches[0].meeting_id;
    const meetingDateTime = hostMatches[0].date_time;

    if (!latestMeetingId) {
      return NextResponse.json({ 
        ok: true,
        data: []
      });
    }

    // Step 3: Fetch the raw check counts and related columns from group_attention_analysis explicitly checked against the newest session_id
    const { data: rawData, error: distError } = await supabase
      .from('group_attention_analysis')
      .select('time, avg_pct')
      .eq('session_id', latestMeetingId)
      .order('time', { ascending: true });

    if (distError) {
      console.error('[Overview API] Error fetching distractions:', distError);
      return NextResponse.json({ ok: false, error: distError.message }, { status: 500 });
    }

    // Format data cleanly for Recharts (e.g. "00:05:00" -> "05:00", attention = 100 - distracted)
    const chartData = (rawData || []).map(row => {
        let formattedTime = row.time;
        if (typeof row.time === 'string') {
            const parts = row.time.split(':');
            if (parts.length >= 3) {
                // Drop hours if they are 00, keep minutes and seconds
                formattedTime = parts[0] === '00' ? `${parts[1]}:${parts[2]}` : `${parts[0]}:${parts[1]}:${parts[2]}`;
            }
        }
        return {
            time: formattedTime,
            attention: Math.max(0, 100 - (row.avg_pct || 0))
        };
    });

    return NextResponse.json({ 
        ok: true, 
        data: chartData,
        meeting_id: latestMeetingId,
        date_time: meetingDateTime
    });

  } catch (err: any) {
    console.error('[Overview API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}