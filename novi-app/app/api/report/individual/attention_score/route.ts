import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET handler for fetching the individual attention score data.
 * It retrieves 'ind_attention_analysis' rows matching the provided host_id,
 * representing the focus percentage over the timeline of a session.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract the host_id parameter which identifies the target user
    const host_id = req.nextUrl.searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Query Supabase: Fetch all attention analysis rows for this user, ordered chronologically by time
    const { data: rawData, error } = await supabase
      .from('ind_attention_analysis')
      .select('session_id, time, distraction_pct')
      .eq('host_id', host_id)
      .order('time', { ascending: true });

    if (error) {
      console.error('[Ind Attention Score] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Format the raw database data to match the expected format for Recharts on the frontend
    // Rules:
    // 1. time should be formatted as "MM:SS" if the hour component is "00"
    // 2. attention metric is inverted from distraction_pct (100 - distraction_pct)
    const chartData = (rawData || []).map(row => {
      let formattedTime = row.time;
      // Handle the time formatting logic to drop '00' hours for cleaner chart labels
      if (typeof row.time === 'string') {
        const parts = row.time.split(':');
        if (parts.length >= 3) {
          // Drop hours if they are 00, keep minutes and seconds preserving the zero-padding
          formattedTime = parts[0] === '00' ? `${parts[1]}:${parts[2]}` : `${parts[0]}:${parts[1]}:${parts[2]}`;
        }
      }
      return {
        time: formattedTime,
        // Calculate positive attention and clamp to 0 as minimum bound
        attention: Math.max(0, 100 - (row.distraction_pct || 0)),
      };
    });

    // Extract the session_id from the first array element to pass alongside the formatted data
    const sessionId = rawData && rawData.length > 0 ? rawData[0].session_id : null;

    // Return the successful payload including chart formatting and session identifier
    return NextResponse.json({
      ok: true,
      data: chartData,
      session_id: sessionId,
    });

  } catch (err: any) {
    // Catch-all block to prevent server crashes and return 500 cleanly
    console.error('[Ind Attention Score] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
