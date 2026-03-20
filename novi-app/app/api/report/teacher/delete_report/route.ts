import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_name, session_id } = body;

    if (!file_name || !session_id) {
      return NextResponse.json({ ok: false, error: 'Missing file_name or session_id' }, { status: 400 });
    }

    // Step 1: Delete the file from the storage bucket
    const { error: storageError } = await supabase
      .storage
      .from('generated_reports')
      .remove([file_name]);

    if (storageError) {
      console.error('[Delete Report API] Error deleting file from storage:', storageError);
      return NextResponse.json({ ok: false, error: storageError.message }, { status: 500 });
    }

    // Step 2: Delete the row from group_report table
    const { error: reportError } = await supabase
      .from('group_report')
      .delete()
      .eq('file_name', file_name);

    if (reportError) {
      console.error('[Delete Report API] Error deleting from group_report:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    // Step 3: Delete the row from host_meetings table
    const { error: hostError } = await supabase
      .from('host_meetings')
      .delete()
      .eq('meeting_id', session_id);

    if (hostError) {
      console.error('[Delete Report API] Error deleting from host_meetings:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Report deleted successfully' });

  } catch (err: any) {
    console.error('[Delete Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
