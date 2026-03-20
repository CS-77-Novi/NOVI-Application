import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const host_id = req.nextUrl.searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Missing host_id parameter' }, { status: 400 });
    }

    // Fetch all session overview rows for this user
    const { data, error } = await supabase
      .from('ind_session_overview')
      .select('session_id, host_id, session_time, attentive_time, distracted_time')
      .eq('host_id', host_id);

    if (error) {
      console.error('[Ind Overview] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Overview] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
