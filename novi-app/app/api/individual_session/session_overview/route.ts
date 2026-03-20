import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch session overview rows, optionally filtered by host_id or session_id
export async function GET(req: NextRequest) {
  try {
    const host_id = req.nextUrl.searchParams.get('host_id');
    const session_id = req.nextUrl.searchParams.get('session_id');

    let query = supabase
      .from('ind_session_overview')
      .select('session_id, host_id, session_time, attentive_time, distracted_time');

    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Ind Session Overview] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Session Overview] Unexpected GET error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Insert a new session overview row
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, host_id, session_time, attentive_time, distracted_time } = body;

    if (!session_id || !host_id) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: session_id, host_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ind_session_overview')
      .insert({
        session_id,
        host_id,
        session_time: session_time || '00:00:00',
        attentive_time: attentive_time || '00:00:00',
        distracted_time: distracted_time || '00:00:00',
      })
      .select();

    if (error) {
      console.error('[Ind Session Overview] POST error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (err: any) {
    console.error('[Ind Session Overview] Unexpected POST error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove a session overview row by session_id
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'Missing required field: session_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ind_session_overview')
      .delete()
      .eq('session_id', session_id);

    if (error) {
      console.error('[Ind Session Overview] DELETE error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Session overview deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Session Overview] Unexpected DELETE error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
