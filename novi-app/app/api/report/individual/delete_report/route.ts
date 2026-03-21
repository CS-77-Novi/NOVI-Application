import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_name, session_id } = body;

    if (!file_name || !session_id) {
      return NextResponse.json({ ok: false, error: 'Missing file_name or session_id' }, { status: 400 });
    }

    // Step 1: Delete the file from the individual_reports storage bucket
    const { error: storageError } = await supabase
      .storage
      .from('individual_reports')
      .remove([file_name]);

    if (storageError) {
      console.error('[Ind Delete Report API] Error deleting file from storage:', storageError);
      return NextResponse.json({ ok: false, error: storageError.message }, { status: 500 });
    }

    // Step 2: Delete the row from ind_report table
    const { error: reportError } = await supabase
      .from('ind_report')
      .delete()
      .eq('file_name', file_name);

    if (reportError) {
      console.error('[Ind Delete Report API] Error deleting from ind_report:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Report deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Delete Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
