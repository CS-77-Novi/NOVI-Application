import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET - Fetch meeting metadata.
 * Queries the 'host_meetings' relational table mapping room launch histories to explicit hosts.
 * Accepts optional query parameters: ?host_id=... & meeting_id=... 
 */
export async function GET(req: Request) {
  try {
    // Extract query parameters driving targeted row returns
    const { searchParams } = new URL(req.url);
    const host_id = searchParams.get('host_id');
    const meeting_id = searchParams.get('meeting_id');
    
    // Construct base wildcard query mapping against all fields
    let query = supabase.from('host_meetings').select('*');
    
    // Chain where constraints filtering down rows securely isolating data
    if (host_id) query = query.eq('host_id', host_id);
    if (meeting_id) query = query.eq('meeting_id', meeting_id);

    // Command Supabase database call
    const { data, error } = await query;

    if (error) {
      console.error('[Meeting Meta-Data DB Get] Error fetching host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Safely emit isolated arrays mirroring the client request
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error('[Meeting Meta-Data DB Get] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST - Create a new meeting metadata record.
 * Defines the initial database marker signaling a teacher launched an active room securely.
 * Used crucially as a foreign relational key downstream generating 'group_report' tracking. 
 */
export async function POST(req: Request) {
  try {
    // Parse the JSON payload expecting identity and chronological markers
    const body = await req.json();
    const { host_id, meeting_id, date_time } = body;

    // Check payload shape strictly disallowing empty undefined values 
    if (!host_id || !meeting_id || !date_time) {
      return NextResponse.json({ error: 'Missing host_id, meeting_id, or date_time' }, { status: 400 });
    }

    // Inject exact mapping row matching Supabase explicitly configuring permissions
    const { data, error } = await supabase
      .from('host_meetings')
      .insert([{ host_id, meeting_id, date_time }]);

    if (error) {
      console.error('[Meeting Meta-Data DB Post] Error inserting host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return exact verification matching signaling room prep succeeded
    return NextResponse.json({ message: 'Success setup host meeting', data }, { status: 201 });
  } catch (err: any) {
    console.error('[Meeting Meta-Data DB Post] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove a strictly bound meeting metadata record.
 * Sweeps the `host_meetings` architecture table clearing the pointer.
 * Frequently used dynamically linked with cascaded storage deletions (delete_report).
 */
export async function DELETE(req: Request) {
  try {
    // Read the query parameters limiting deletion
    const { searchParams } = new URL(req.url);
    const meeting_id = searchParams.get('meeting_id');

    // Reject structurally malformed inputs unconditionally shielding database layers 
    if (!meeting_id) {
      return NextResponse.json({ error: 'Missing meeting_id' }, { status: 400 });
    }

    // Wipe exact string-match mapping within target relational table securely
    const { error } = await supabase
      .from('host_meetings')
      .delete()
      .eq('meeting_id', meeting_id);

    if (error) {
      console.error('[Meeting Meta-Data DB Delete] Error deleting host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return definitive OK verification
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('[Meeting Meta-Data DB Delete] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}