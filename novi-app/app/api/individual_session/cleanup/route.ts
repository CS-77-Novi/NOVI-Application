import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const host_id = req.nextUrl.searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Missing host_id parameter' }, { status: 400 });
    }

    // Delete all rows from ind_session_overview where host_id matches
    const { error } = await supabase
      .from('ind_session_overview')
      .delete()
      .eq('host_id', host_id);

    if (error) {
      console.error('[Ind Cleanup] Error deleting rows:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Cleanup completed successfully' });

  } catch (err: any) {
    console.error('[Ind Cleanup] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
