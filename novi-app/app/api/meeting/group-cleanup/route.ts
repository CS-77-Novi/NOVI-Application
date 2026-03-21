import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE /api/meeting/group-cleanup
 * Executes a hard teardown removing metrics recorded for the MOST RECENT meeting assigned 
 * to the requesting teacher (host_id).
 * Operates cross-table deleting `group_session_overview` and `group_attention_analysis` lines.
 */
export async function DELETE(req: Request) {
  try {
    // Step 1: Secure the caller's identity (the host_id usually matching user.id)
    const body = await req.json();
    const { host_id } = body;

    // Reject unverified or improperly mapped payload calls natively
    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Traverse host_meetings history to lock onto the exactly localized meeting_id 
    // strictly isolated to the newest single chronological launch timestamp
    const { data: hostMatches, error: hostError } = await supabase
      .from('host_meetings')
      .select('meeting_id')
      .eq('host_id', host_id)
      .order('date_time', { ascending: false })
      .limit(1);

    if (hostError) {
      console.error('[DB Cleanup] Error querying host_meetings for latest session:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // Edge check: Discard silently if the teacher literally has zero historical room metadata 
    if (!hostMatches || hostMatches.length === 0) {
      console.log('[DB Cleanup] No host meetings found for user. Skipping cleanup.');
      return NextResponse.json({ ok: true, message: 'No cleanup needed for this user' });
    }

    const latestMeetingId = hostMatches[0].meeting_id;

    if (!latestMeetingId) {
      return NextResponse.json({ ok: true, message: 'No latest session_id found to cleanup' });
    }

    // Step 3: Cascading Deletion phase one
    // Wipe the high-level mapping from `group_session_overview` preventing UI ghostly elements
    const { error: deleteError } = await supabase
      .from('group_session_overview')
      .delete()
      .eq('session_id', latestMeetingId);

    if (deleteError) {
      console.error(`[DB Cleanup] Error wiping group_session_overview for meeting ${latestMeetingId}:`, deleteError);
      return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
    }

    // Step 4: Cascading Deletion phase two
    // Wipe the granular timeframe mapping isolating the minute-ticks preventing chart ghosts
    const { error: attentionDeleteError } = await supabase
      .from('group_attention_analysis')
      .delete()
      .eq('session_id', latestMeetingId);

    if (attentionDeleteError) {
      console.error(`[DB Cleanup] Error wiping group_attention_analysis for meeting ${latestMeetingId}:`, attentionDeleteError);
      return NextResponse.json({ ok: false, error: attentionDeleteError.message }, { status: 500 });
    }

    // Success response safely finalizing network transaction
    console.log(`[DB Cleanup] Successfully wiped previous tracking rows for group_session_overview and group_attention_analysis ${latestMeetingId}.`);
    return NextResponse.json({ ok: true, message: 'Specific session cleared successfully from group_session_overview and group_attention_analysis' });

  } catch (err: any) {
    console.error('[DB Cleanup] Unexpected error during selective cleanup:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}