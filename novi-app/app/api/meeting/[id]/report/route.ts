import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * MODEL DEFINITION
 * Mirrors the 'report' table with Foreign Key relation to study_session.
 */
export interface Report {
  report_id: number;
  session_id: number;
  file_name: string;
  file_path: string; // The path/URL in Supabase Storage
  generated_time: string;
  created_at?: string;
}

export type CreateReportInput = Omit<Report, 'report_id' | 'created_at'>;

/**
 * GET: Fetch reports
 * Query Params: ?sessionId=123 (filter by session) or ?reportId=45 (single report)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const reportId = searchParams.get('reportId');

  try {
    let query = supabase.from('report').select('*');

    if (reportId) {
      const { data, error } = await query.eq('report_id', reportId).single();
      if (error) throw error;
      return NextResponse.json(data as Report);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json(data as Report[]);
  } catch (error: any) {
    console.error('[Report GET Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Save report metadata after a successful file upload to Storage.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateReportInput = await req.json();

    // Validation
    if (!body.session_id || !body.file_path) {
      return NextResponse.json(
        { error: 'session_id and file_path are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('report')
      .insert([
        {
          session_id: body.session_id,
          file_name: body.file_name,
          file_path: body.file_path,
          generated_time: body.generated_time || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data as Report, { status: 201 });
  } catch (error: any) {
    console.error('[Report POST Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove report metadata.
 * Note: You should also delete the actual file from Supabase Storage separately.
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('report')
      .delete()
      .eq('report_id', reportId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Report DELETE Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}