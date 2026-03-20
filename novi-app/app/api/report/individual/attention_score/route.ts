import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const host_id = req.nextUrl.searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Fetch all attention analysis rows for this user, ordered by time
    const { data: rawData, error } = await supabase
      .from('ind_attention_analysis')
      .select('session_id, time, distraction_pct')
      .eq('host_id', host_id)
      .order('time', { ascending: true });

    if (error) {
      console.error('[Ind Attention Score] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Format data for Recharts: time as "MM:SS", attention = 100 - distraction_pct
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
        attention: Math.max(0, 100 - (row.distraction_pct || 0)),
      };
    });

    // Get the session_id from the first row if available
    const sessionId = rawData && rawData.length > 0 ? rawData[0].session_id : null;

    return NextResponse.json({
      ok: true,
      data: chartData,
      session_id: sessionId,
    });

  } catch (err: any) {
    console.error('[Ind Attention Score] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
