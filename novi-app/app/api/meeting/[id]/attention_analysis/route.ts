import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/meeting/[id]/attention_analysis
 * Retrieve all attention analysis data points for the session.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('group_attention_analysis')
      .select('*')
      .eq('session_id', id)
      .order('time', { ascending: true });

    if (error) {
      console.error('[attention_analysis GET] Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('[attention_analysis GET] Server Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/meeting/[id]/attention_analysis
 * Insert or update a specific minute's average percentage for the session.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as {
      time?: string;
    };

    if (typeof body.time !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid time in payload' }, { status: 400 });
    }

    // Aggregate values from group_session_overview
    const { data: overviewRows, error: overviewError } = await supabase
      .from('group_session_overview')
      .select('distracted_checks, total_checks')
      .eq('session_id', id);

    if (overviewError) throw overviewError;

    let totalDistracted = 0;
    let totalChecks = 0;

    if (overviewRows && overviewRows.length > 0) {
      overviewRows.forEach((row) => {
        totalDistracted += row.distracted_checks || 0;
        totalChecks += row.total_checks || 0;
      });
    }

    // Calculate group average
    const avg_pct = totalChecks > 0 ? Math.round((totalDistracted / totalChecks) * 100) : 0;

    const payload = {
      session_id: id,
      time: body.time,
      avg_pct: avg_pct,
    };

    // Check if a record already exists for this exact time
    const { data: existing, error: selectError } = await supabase
      .from('group_attention_analysis')
      .select('session_id')
      .eq('session_id', id)
      .eq('time', body.time)
      .maybeSingle();
      
    if (selectError) throw selectError;

    let dbError;
    if (existing) {
      const { error } = await supabase
        .from('group_attention_analysis')
        .update({ avg_pct: avg_pct })
        .eq('session_id', id)
        .eq('time', body.time);
      dbError = error;
    } else {
      const { error } = await supabase
        .from('group_attention_analysis')
        .insert(payload);
      dbError = error;
    }

    if (dbError) throw dbError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[attention_analysis POST] Server Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/meeting/[id]/attention_analysis
 * Delete records for the session (with optional query parameter `?time=X` to delete a specific minute).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timeParam = req.nextUrl.searchParams.get('time');

    let query = supabase
      .from('group_attention_analysis')
      .delete()
      .eq('session_id', id);

    if (timeParam) {
      query = query.eq('time', timeParam);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[attention_analysis DELETE] Server Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
