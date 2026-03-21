import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch session rows, optionally filtered by session_id or host_id
export async function GET(req: NextRequest) {
  try {
    const session_id = req.nextUrl.searchParams.get('session_id');
    const host_id = req.nextUrl.searchParams.get('host_id');

    let query = supabase
      .from('ind_session')
      .select('host_id, session_id, gaze_direction, head_direction, distraction_pct, time');

    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    query = query.order('time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Ind Session] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Session] Unexpected GET error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Insert a new session row
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host_id, session_id, gaze_direction, head_direction, distraction_pct, time } = body;

    if (!host_id || !session_id) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: host_id, session_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ind_session')
      .insert({
        host_id,
        session_id,
        gaze_direction: gaze_direction || 'N/A',
        head_direction: head_direction || 'N/A',
        distraction_pct: distraction_pct ?? 0,
        time: time || '00:00:00',
      })
      .select();

    if (error) {
      console.error('[Ind Session] POST error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (err: any) {
    console.error('[Ind Session] Unexpected POST error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove session rows by session_id or host_id
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, host_id } = body;

    if (!session_id && !host_id) {
      return NextResponse.json({ ok: false, error: 'Missing required field: session_id or host_id' }, { status: 400 });
    }

    let query = supabase.from('ind_session').delete();

    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    const { error } = await query;

    if (error) {
      console.error('[Ind Session] DELETE error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Session rows deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Session] Unexpected DELETE error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
