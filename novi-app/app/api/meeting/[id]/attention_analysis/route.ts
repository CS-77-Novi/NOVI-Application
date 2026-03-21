import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/meeting/[id]/attention_analysis
 * Retrieve all attention analysis data points for the session.
 * Used for plotting chronological attention graphs
 * for a teacher reviewing a completed meeting.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch granular chronological data points scoped completely to the given session_id
    const { data, error } = await supabase
      .from('group_attention_analysis')
      .select('*')
      .eq('session_id', id)
      .order('time', { ascending: true }); // Ensure time-series data is fetched in order

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
 * Insert or update a specific minute's average distraction percentage for the session.
 * This is an aggregate endpoint: it reads the current overall distractions from the entire group,
 * calculates the macroscopic distraction ratio for that exact minute, and saves it.
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

    // Step 1: Read current state of ALL participants actively mapped to `group_session_overview`
    const { data: overviewRows, error: overviewError } = await supabase
      .from('group_session_overview')
      .select('distracted_checks, total_checks')
      .eq('session_id', id);

    if (overviewError) throw overviewError;

    let totalDistracted = 0;
    let totalChecks = 0;

    // Step 2: Accumulate the total pool of checks vs distracted checks to yield the current global ratio
    if (overviewRows && overviewRows.length > 0) {
      overviewRows.forEach((row) => {
        totalDistracted += row.distracted_checks || 0;
        totalChecks += row.total_checks || 0;
      });
    }

    // Step 3: Calculate the definitive group average at this exact timestamp tick
    const avg_pct = totalChecks > 0 ? Math.round((totalDistracted / totalChecks) * 100) : 0;

    const payload = {
      session_id: id,
      time: body.time,
      avg_pct: avg_pct,
    };

    // Step 4: Upsert logic — Check if a record already exists for this exact chronological minute block
    const { data: existing, error: selectError } = await supabase
      .from('group_attention_analysis')
      .select('session_id')
      .eq('session_id', id)
      .eq('time', body.time)
      .maybeSingle();
      
    if (selectError) throw selectError;

    let dbError;
    if (existing) {
      // Update existing precise minute block
      const { error } = await supabase
        .from('group_attention_analysis')
        .update({ avg_pct: avg_pct })
        .eq('session_id', id)
        .eq('time', body.time);
      dbError = error;
    } else {
      // Insert new minute block
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
 * Purge records for the session (with optional query parameter `?time=X` to delete a specific minute).
 * Built to handle cascading teardowns when a session ends or errors out.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timeParam = req.nextUrl.searchParams.get('time');

    // Prepare deletion query constrained primarily to the session
    let query = supabase
      .from('group_attention_analysis')
      .delete()
      .eq('session_id', id);

    // Filter down to a specific time tick if provided
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
