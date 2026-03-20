import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch attention analysis rows, optionally filtered by session_id
export async function GET(req: NextRequest) {
  try {
    const session_id = req.nextUrl.searchParams.get('session_id');
    const host_id = req.nextUrl.searchParams.get('host_id');

    let query = supabase
      .from('ind_attention_analysis')
      .select('host_id, session_id, time, distraction_pct');

    if (session_id) {
      query = query.eq('session_id', session_id);
    } else if (host_id) {
      query = query.eq('host_id', host_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Ind Attention Analysis] GET error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Ind Attention Analysis] Unexpected GET error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Insert a new attention analysis row
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, host_id, time, distraction_pct } = body;

    if (!session_id || !host_id || time === undefined || distraction_pct === undefined) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: session_id, host_id, time, distraction_pct' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ind_attention_analysis')
      .insert({ session_id, host_id, time, distraction_pct })
      .select();

    if (error) {
      console.error('[Ind Attention Analysis] POST error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (err: any) {
    console.error('[Ind Attention Analysis] Unexpected POST error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove attention analysis rows by session_id
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'Missing required field: session_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ind_attention_analysis')
      .delete()
      .eq('session_id', session_id);

    if (error) {
      console.error('[Ind Attention Analysis] DELETE error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Attention analysis rows deleted successfully' });

  } catch (err: any) {
    console.error('[Ind Attention Analysis] Unexpected DELETE error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
