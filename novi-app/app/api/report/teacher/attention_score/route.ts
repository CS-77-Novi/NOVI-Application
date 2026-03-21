import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET endpoint to retrieve the Attention Score timeline for a teacher's most recent session.
 * It first finds the latest meeting owned by the teacher, and then queries
 * the aggregated attention data for that specific meeting to populate the UI chart.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract the host_id identifier from query params
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Strict validation: Prevent unauthenticated sweeps
    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Step 1: Discover the Latest Meeting
    // Query host_meetings to find the most recently created meeting for this host_id
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

    // Defensive check: If the host has never hosted a meeting, exit early with empty data
    if (!hostMatches || hostMatches.length === 0) {
      return NextResponse.json({ 
        ok: true,
        data: []
      });
    }

    const latestMeetingId = hostMatches[0].meeting_id;
    const meetingDateTime = hostMatches[0].date_time;

    // Secondary defensive check in case schema is malformed but record exists
    if (!latestMeetingId) {
      return NextResponse.json({ 
        ok: true,
        data: []
      });
    }

    // Step 2: Fetch the Attention Analysis Data
    // Query group_attention_analysis table matching exactly against the extracted newest session_id
    const { data: rawData, error: distError } = await supabase
      .from('group_attention_analysis')
      .select('time, avg_pct')
      .eq('session_id', latestMeetingId)
      .order('time', { ascending: true }); // Ensure chronological order for Recharts

    if (distError) {
      console.error('[Overview API] Error fetching distractions:', distError);
      return NextResponse.json({ ok: false, error: distError.message }, { status: 500 });
    }

    // Step 3: Format data cleanly for the Recharts AreaChart component
    // Converts "00:05:00" -> "05:00", attention = Math.max(0, 100 - distracted)
    const chartData = (rawData || []).map(row => {
        let formattedTime = row.time;
        if (typeof row.time === 'string') {
            const parts = row.time.split(':');
            if (parts.length >= 3) {
                // Drop hours if they are exactly '00', keep minutes and seconds
                formattedTime = parts[0] === '00' ? `${parts[1]}:${parts[2]}` : `${parts[0]}:${parts[1]}:${parts[2]}`;
            }
        }
        return {
            time: formattedTime,
            // Invert the distraction percentage into an attention score bounds checked to a minimum of 0
            attention: Math.max(0, 100 - (row.avg_pct || 0))
        };
    });

    // Return the successful payload including chart formatting and session metadata identifiers
    return NextResponse.json({ 
        ok: true, 
        data: chartData,
        meeting_id: latestMeetingId,
        date_time: meetingDateTime
    });

  } catch (err: any) {
    // Top-level crash safety net
    console.error('[Overview API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}